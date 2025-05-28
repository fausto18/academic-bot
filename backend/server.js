import express from "express";
import multer from "multer";
import cors from "cors";
import pdfParse from "pdf-parse";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 5000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Configura CORS para permitir apenas o frontend hospedado na Vercel
app.use(cors({
  origin: 'https://academic-bot-five.vercel.app',
  methods: ["GET", "POST"],
  credentials: true

}));

app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

const secoesMapeadas = {
  introducao: ["Introdução", "Introducao"],
  objetivos: ["Objetivos", "Objetivo", "Objectivos", "Objectivo"],
  resultados: ["Resultados", "Resultados obtidos"],
  conclusao: ["Conclusão", "Conclusao", "Considerações finais"],
};

function isQuotaExceeded(error) {
  return (
    error?.status === 429 &&
    (error?.code === "insufficient_quota" ||
      error?.error?.code === "insufficient_quota")
  );
}

function extrairSecao(tipo, texto) {
  const nomesPossiveis = secoesMapeadas[tipo];
  if (!nomesPossiveis) return "";

  for (const nome of nomesPossiveis) {
    const regex = new RegExp(
      `-?\\s*${nome}( geral| específicos)?\\s*:?\\s*\\n?([\\s\\S]*?)(?=\\n\\s*[-–]?\\s*[A-Z])`,
      "i"
    );
    const match = texto.match(regex);
    if (match) return match[2].trim();
  }

  return "";
}

async function corrigirTexto(texto) {
  try {
    const prompt = `Corrija os erros ortográficos no seguinte texto e apresente as sugestões de correção:\n\n${texto}`;
    const completion = await openai.completions.create({
      model: "gpt-4o",
      prompt,
      max_tokens: 500,
      temperature: 0.3,
    });
    return completion.choices[0].text.trim();
  } catch (error) {
    console.error("Erro na correção ortográfica:", error);
    if (isQuotaExceeded(error)) {
      return "Limite de uso da API da OpenAI excedido.";
    }
    return "Erro na correção ortográfica.";
  }
}

async function avaliarParagrafos(texto) {
  try {
    const prompt = `Identifique parágrafos mal elaborados no seguinte texto e sugira melhorias:\n\n${texto}`;
    const completion = await openai.completions.create({
      model: "gpt-4o",
      prompt,
      max_tokens: 500,
      temperature: 0.4,
    });
    return completion.choices[0].text.trim();
  } catch (error) {
    console.error("Erro na análise de parágrafos:", error);
    if (isQuotaExceeded(error)) {
      return "Limite de uso da API da OpenAI excedido.";
    }
    return "Erro na avaliação de parágrafos.";
  }
}

async function sugestaoMelhoriasIntroducao(introducao) {
  if (!introducao) return "Introdução não encontrada.";
  try {
    const prompt = `Analise a introdução abaixo e sugira melhorias:\n\n${introducao}`;
    const completion = await openai.completions.create({
      model: "gpt-4o",
      prompt,
      max_tokens: 400,
      temperature: 0.7,
    });
    return completion.choices[0].text.trim();
  } catch (error) {
    console.error("Erro na introdução:", error);
    if (isQuotaExceeded(error)) {
      return "Limite de uso da API da OpenAI excedido.";
    }
    return "Erro na sugestão de melhorias para a introdução.";
  }
}

async function avaliarConvergencia(objetivos, resultados) {
  if (!objetivos || !resultados)
    return "Seção de Objetivos ou Resultados não encontrada.";
  try {
    const prompt = `Analise se os resultados apresentados estão alinhados com os objetivos estabelecidos:\n\nObjetivos:\n${objetivos}\n\nResultados:\n${resultados}\n\nAnálise:`;
    const completion = await openai.completions.create({
      model: "gpt-4o",
      prompt,
      max_tokens: 300,
      temperature: 0.2,
    });
    return completion.choices[0].text.trim();
  } catch (error) {
    console.error("Erro na convergência:", error);
    if (isQuotaExceeded(error)) {
      return "Limite de uso da API da OpenAI excedido.";
    }
    return "Erro na análise de convergência.";
  }
}

async function avaliarMetasEConclusoes(metas, conclusoes) {
  if (!metas || !conclusoes) return "Metas ou Conclusões não encontradas.";

  const messages = [
    {
      role: "system",
      content:
        "Você é um avaliador de trabalhos acadêmicos. Sua função é analisar se as conclusões estão alinhadas com as metas (objetivos) e sugerir melhorias quando necessário.",
    },
    {
      role: "user",
      content: `Metas (Objetivos):\n${metas}\n\nConclusões:\n${conclusoes}\n\nPor favor, forneça uma análise completa e sugestões de melhoria.`,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 500,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Erro na análise metas/conclusões:", error);
    if (isQuotaExceeded(error)) {
      return "Limite de uso da API da OpenAI excedido.";
    }
    return "Erro na avaliação de metas e conclusões.";
  }
}

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("Nenhum arquivo enviado.");
  }
  try {
    const data = await pdfParse(req.file.buffer);
    const textoExtraido = data.text;

    const errosOrtograficos = await corrigirTexto(textoExtraido);
    const paragrafosMalElaborados = await avaliarParagrafos(textoExtraido);

    const introducao = extrairSecao("introducao", textoExtraido);
    const sugestoesIntroducao = await sugestaoMelhoriasIntroducao(introducao);

    const objetivos = extrairSecao("objetivos", textoExtraido);
    const resultados = extrairSecao("resultados", textoExtraido);
    const conclusao = extrairSecao("conclusao", textoExtraido);

    const avaliacaoConvergencia = await avaliarConvergencia(objetivos, resultados);
    const avaliacaoMetasConclusoes = await avaliarMetasEConclusoes(objetivos, conclusao);

    res.json({
      textoExtraido,
      errosOrtograficos,
      paragrafosMalElaborados,
      introducao,
      sugestoesIntroducao,
      objetivos,
      resultados,
      conclusao,
      avaliacaoConvergencia,
      avaliacaoConclusao: avaliacaoMetasConclusoes,
    });
  } catch (error) {
    console.error("Erro no processamento:", error);
    res.status(500).send("Erro ao processar o PDF.");
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
