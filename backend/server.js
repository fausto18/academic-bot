import express from "express";
import multer from "multer";
import cors from "cors";
import pdfParse from "pdf-parse";
import OpenAI from "openai";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 5000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const JWT_SECRET = process.env.JWT_SECRET || "segredo_forte";

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Middlewares
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000",
  "https://academic-bot-five.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
}));

const upload = multer({ storage: multer.memoryStorage() });

// Autenticação via token
function autenticarToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ mensagem: "Token não fornecido." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch {
    return res.status(401).json({ mensagem: "Token inválido." });
  }
}

// Rota para verificar autenticação
app.get("/verificar", autenticarToken, (req, res) => {
  res.json({ mensagem: "Usuário autenticado", email: req.usuario.email });
});

// Registro de novo usuário
app.post("/register", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const existe = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ mensagem: "Email já cadastrado." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await pool.query(
      "INSERT INTO usuarios (email, senha, aprovado) VALUES ($1, $2, $3)",
      [email, senhaHash, false]
    );

    res.json({ mensagem: "Registro realizado com sucesso. Aguarde a aprovação do administrador." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao registrar." });
  }
});

// Aprovação de usuários pelo admin
app.post("/aprovar", async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query("UPDATE usuarios SET aprovado = true WHERE email = $1 RETURNING *", [email]);
    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }
    res.json({ mensagem: "Usuário aprovado com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao aprovar usuário." });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    const usuario = result.rows[0];

    if (!usuario || !usuario.aprovado || !bcrypt.compareSync(senha, usuario.senha)) {
      return res.status(401).json({ mensagem: "Credenciais inválidas ou conta não aprovada." });
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: "2h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.json({ mensagem: "Login bem-sucedido" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao efetuar login." });
  }
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax"
  });
  res.json({ mensagem: "Logout realizado com sucesso." });
});

// Mapeamento de seções para extração
const secoesMapeadas = {
  introducao: ["Introdução", "Introducao"],
  objetivos: ["Objetivos", "Objetivo", "Objectivos", "Objectivo"],
  resultados: ["Resultados", "Resultados obtidos"],
  conclusao: ["Conclusão", "Conclusao", "Considerações finais"]
};

function extrairSecao(tipo, texto) {
  const nomesPossiveis = secoesMapeadas[tipo];
  for (const nome of nomesPossiveis) {
    const regex = new RegExp(`-?\\s*${nome}( geral| específicos)?\\s*:?\\s*\\n?([\\s\\S]*?)(?=\\n\\s*[-–]?\\s*[A-Z])`, "i");
    const match = texto.match(regex);
    if (match) return match[2].trim();
  }
  return "";
}

function isQuotaExceeded(error) {
  return error?.status === 429 && (error?.code === "insufficient_quota" || error?.error?.code === "insufficient_quota");
}

// Funções de avaliação usando OpenAI
async function corrigirTexto(texto) {
  try {
    const prompt = `Corrija os erros ortográficos:\n\n${texto}`;
    const completion = await openai.completions.create({ model: "gpt-4o", prompt, max_tokens: 500, temperature: 0.3 });
    return completion.choices[0].text.trim();
  } catch (error) {
    console.error("Erro na correção ortográfica:", error);
    return isQuotaExceeded(error) ? "Limite de uso da API da OpenAI excedido." : "Erro na correção ortográfica.";
  }
}

async function avaliarParagrafos(texto) {
  try {
    const prompt = `Identifique parágrafos mal elaborados:\n\n${texto}`;
    const completion = await openai.completions.create({ model: "gpt-4o", prompt, max_tokens: 500, temperature: 0.4 });
    return completion.choices[0].text.trim();
  } catch (error) {
    console.error("Erro na avaliação de parágrafos:", error);
    return isQuotaExceeded(error) ? "Limite de uso da API da OpenAI excedido." : "Erro na avaliação de parágrafos.";
  }
}

async function sugestaoMelhoriasIntroducao(introducao) {
  if (!introducao) return "Introdução não encontrada.";
  try {
    const prompt = `Sugira melhorias para a introdução:\n\n${introducao}`;
    const completion = await openai.completions.create({ model: "gpt-4o", prompt, max_tokens: 400, temperature: 0.7 });
    return completion.choices[0].text.trim();
  } catch (error) {
    console.error("Erro na introdução:", error);
    return isQuotaExceeded(error) ? "Limite de uso da API da OpenAI excedido." : "Erro na sugestão da introdução.";
  }
}

async function avaliarConvergencia(objetivos, resultados) {
  if (!objetivos || !resultados) return "Objetivos ou Resultados não encontrados.";
  try {
    const prompt = `Analise se os resultados estão alinhados aos objetivos:\n\nObjetivos:\n${objetivos}\n\nResultados:\n${resultados}`;
    const completion = await openai.completions.create({ model: "gpt-4o", prompt, max_tokens: 300, temperature: 0.2 });
    return completion.choices[0].text.trim();
  } catch (error) {
    console.error("Erro na convergência:", error);
    return isQuotaExceeded(error) ? "Limite de uso da API da OpenAI excedido." : "Erro na convergência.";
  }
}

async function avaliarMetasEConclusoes(metas, conclusoes) {
  if (!metas || !conclusoes) return "Metas ou Conclusões não encontradas.";
  const messages = [
    { role: "system", content: "Você é um avaliador de trabalhos acadêmicos." },
    { role: "user", content: `Metas:\n${metas}\n\nConclusões:\n${conclusoes}` }
  ];

  try {
    const completion = await openai.chat.completions.create({ model: "gpt-4o", messages, max_tokens: 500 });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Erro na análise de metas/conclusões:", error);
    return isQuotaExceeded(error) ? "Limite de uso da API da OpenAI excedido." : "Erro na avaliação de metas e conclusões.";
  }
}

// Upload e análise de PDF
app.post("/upload", autenticarToken, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send("Nenhum arquivo enviado.");

  try {
    const data = await pdfParse(req.file.buffer);
    const texto = data.text;
    const erros = await corrigirTexto(texto);
    const parags = await avaliarParagrafos(texto);
    const intro = extrairSecao("introducao", texto);
    const sugIntro = await sugestaoMelhoriasIntroducao(intro);
    const obj = extrairSecao("objetivos", texto);
    const resul = extrairSecao("resultados", texto);
    const concl = extrairSecao("conclusao", texto);
    const conv = await avaliarConvergencia(obj, resul);
    const conclFinal = await avaliarMetasEConclusoes(obj, concl);

    res.json({
      textoExtraido: texto,
      errosOrtograficos: erros,
      paragrafosMalElaborados: parags,
      introducao: intro,
      sugestoesIntroducao: sugIntro,
      objetivos: obj,
      resultados: resul,
      conclusao: concl,
      avaliacaoConvergencia: conv,
      avaliacaoConclusao: conclFinal
    });
  } catch (error) {
    console.error("Erro ao processar o PDF:", error);
    res.status(500).send("Erro ao processar o PDF.");
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
