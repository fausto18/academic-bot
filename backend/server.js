import express from "express";
import multer from "multer";
import cors from "cors";
import pdfParse from "pdf-parse";
// import OpenAI from "openai";
import { gerarResposta } from "./gemini.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import sequelize from "./db.js";
import Usuario from "./models/Usuario.js";
import { createClient } from "@supabase/supabase-js"

// Configuração do Supabase
const supabaseUrl = 'https://nlbrbspgvzulsswkqsya.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const JWT_SECRET = process.env.JWT_SECRET || "segredo_forte";

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000", // frontend local
  "https://academic-bot-five.vercel.app" // frontend em produção
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));


const upload = multer({ storage: multer.memoryStorage() });

// Middleware de autenticação JWT
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

// Rota de verificação
app.get("/verificar", autenticarToken, (req, res) => {
  res.json({ mensagem: "Usuário autenticado", email: req.usuario.email });
});

// Registro
app.post("/register", async (req, res) => {
  const {
    primeiro_nome,
    ultimo_nome,
    email,
    contacto,
    senha,
    repetir_senha
  } = req.body;

  if (!primeiro_nome || !ultimo_nome || !email || !contacto || !senha || !repetir_senha) {
    return res.status(400).json({ mensagem: "Todos os campos são obrigatórios." });
  }

  if (senha !== repetir_senha) {
    return res.status(400).json({ mensagem: "As senhas não coincidem." });
  }

  try {
    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({ mensagem: "Email já cadastrado." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await Usuario.create({
      primeiro_nome,
      ultimo_nome,
      email,
      contacto,
      senha: senhaHash,
      aprovado: false
    });

    res.json({ mensagem: "Registro realizado com sucesso. Aguarde a aprovação." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro no registro." });
  }
});

// Aprovar usuários
app.post("/aprovar", async (req, res) => {
  const { email } = req.body;
  try {
    const [updated] = await Usuario.update(
      { aprovado: true },
      { where: { email } }
    );

    if (updated === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    res.json({ mensagem: "Usuário aprovado com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "Erro ao aprovar usuário." });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await Usuario.findOne({ where: { email } });
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
  } catch (err) {
    console.error(err);
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

// -----------------------------------
// Processamento de PDF via Gemini
// -----------------------------------
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

async function corrigirTexto(texto) {
  try {
    return await gerarResposta(`Corrija os erros ortográficos:\n\n${texto}`);
  } catch (error) {
    console.error(error);
    return "Erro na correção.";
  }
}

async function avaliarParagrafos(texto) {
  try {
    return await gerarResposta(`Identifique parágrafos mal elaborados:\n\n${texto}`);
  } catch (error) {
    console.error(error);
    return "Erro na análise.";
  }
}

async function sugestaoMelhoriasIntroducao(introducao) {
  if (!introducao) return "Introdução não encontrada.";
  try {
    return await gerarResposta(`Sugira melhorias para a introdução:\n\n${introducao}`);
  } catch (error) {
    console.error(error);
    return "Erro na sugestão.";
  }
}

async function avaliarConvergencia(objetivos, resultados) {
  if (!objetivos || !resultados) return "Faltam dados.";
  try {
    return await gerarResposta(`Analise se os resultados estão alinhados aos objetivos:\n\nObjetivos:\n${objetivos}\n\nResultados:\n${resultados}`);
  } catch (error) {
    console.error(error);
    return "Erro na convergência.";
  }
}

async function avaliarMetasEConclusoes(metas, conclusoes) {
  if (!metas || !conclusoes) return "Faltam dados.";
  try {
    return await gerarResposta(`Analise se as conclusões refletem as metas estabelecidas:\n\nMetas:\n${metas}\n\nConclusões:\n${conclusoes}`);
  } catch (error) {
    console.error(error);
    return "Erro na avaliação.";
  }
}


// Upload e análise
app.post("/upload", autenticarToken, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send("Nenhum arquivo enviado.");

  try {
    const data = await pdfParse(req.file.buffer);
    const texto = data.text;

    const [erros, parags, intro, obj, resul, concl] = await Promise.all([
      corrigirTexto(texto),
      avaliarParagrafos(texto),
      extrairSecao("introducao", texto),
      extrairSecao("objetivos", texto),
      extrairSecao("resultados", texto),
      extrairSecao("conclusao", texto)
    ]);

    const [sugIntro, conv, conclFinal] = await Promise.all([
      sugestaoMelhoriasIntroducao(intro),
      avaliarConvergencia(obj, resul),
      avaliarMetasEConclusoes(obj, concl)
    ]);

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
    console.error("Erro no processamento:", error);
    res.status(500).send("Erro ao processar o PDF.");
  }
});

// Sincroniza modelos com o banco (cria tabela se não existir)
sequelize.sync()
  .then(() => {
    console.log("Modelos sincronizados com o banco de dados.");
    
    // Inicia o servidor após sincronização bem-sucedida
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao sincronizar modelos:", err);
  });

