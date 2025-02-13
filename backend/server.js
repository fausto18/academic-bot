import express from "express";
import multer from "multer";
import cors from "cors";
import pdfParse from "pdf-parse";
import OpenAI from "openai"; // Importação correta
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 5000;

// Configuração do OpenAI utilizando a nova sintaxe do SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuração do multer para upload de arquivos em memória
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

/**
 * Função para extrair uma seção específica do texto.
 */
function extrairSecao(nomeSecao, texto) {
  const regex = new RegExp(nomeSecao + "\\s*([\\s\\S]*?)(?=\\n[A-Z])", "i");
  const match = texto.match(regex);
  return match ? match[1].trim() : "";
}

/**
 * Função para sugerir correções ortográficas usando a API da OpenAI.
 */
async function corrigirTexto(texto) {
  try {
    const prompt = `Corrija os erros ortográficos no seguinte texto e apresente as sugestões de correção:\n\n${texto}`;
    const completion = await openai.completions.create({
      model: "gpt-4o",
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.3, // Mantém correções precisas
    });
    return completion.choices[0].text.trim();
  } catch (error) {
    console.error("Erro na correção ortográfica:", error);
    return "Não foi possível corrigir o texto.";
  }
}

/**
 * Função para avaliar parágrafos mal elaborados.
 */
async function avaliarParagrafos(texto) {
  try {
    const prompt = `Identifique parágrafos mal elaborados no seguinte texto e sugira melhorias:\n\n${texto}`;
    const completion = await openai.completions.create({
      model: "gpt-4o",
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.4,
    });
    return completion.choices[0].text.trim();
  } catch (error) {
    console.error("Erro na análise de parágrafos:", error);
    return "Não foi possível avaliar os parágrafos.";
  }
}

/**
 * Função para sugerir melhorias na Introdução.
 */
async function sugestaoMelhoriasIntroducao(introducao) {
  if (!introducao) return "Introdução não encontrada.";
  try {
    const prompt = `Analise a introdução abaixo e sugira melhorias:\n\n${introducao}`;
    const completion = await openai.completions.create({
      model: "gpt-4o",
      prompt: prompt,
      max_tokens: 400,
      temperature: 0.7, // Permite mais criatividade
    });
    return completion.choices[0].text.trim();
  } catch (error) {
    console.error("Erro na análise da introdução:", error);
    return "Não foi possível sugerir melhorias para a introdução.";
  }
}

/**
 * Função para avaliar a convergência entre Objetivos e Resultados.
 */
async function avaliarConvergencia(objetivos, resultados) {
  if (!objetivos || !resultados) return "Seção de Objetivos ou Resultados não encontrada.";
  try {
    const prompt = `Analise se os resultados apresentados no trabalho estão alinhados com os objetivos estabelecidos. Identifique inconsistências e descreva possíveis falhas.\n\nObjetivos:\n${objetivos}\n\nResultados:\n${resultados}\n\nAnálise:`;
    const completion = await openai.completions.create({
      model: "gpt-4o",
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.2,
    });
    return completion.choices[0].text.trim();
  } catch (error) {
    console.error("Erro na avaliação de convergência:", error);
    return "Não foi possível avaliar a convergência entre objetivos e resultados.";
  }
}

/**
 * Função para avaliar Metas (Objetivos) e Conclusões utilizando Chat Completions.
 */
async function avaliarMetasEConclusoes(metas, conclusoes) {
  if (!metas || !conclusoes) return "Metas ou Conclusões não encontradas.";

  const messages = [
    {
      role: "system",
      content: "Você é um avaliador de trabalhos acadêmicos. Sua função é analisar se as conclusões estão alinhadas com as metas (objetivos) e sugerir melhorias quando necessário.",
    },
    {
      role: "user",
      content: `Metas (Objetivos):
${metas}

Conclusões:
${conclusoes}

Por favor, forneça uma análise completa e sugira como melhorar a coerência entre as metas e as conclusões.`,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 500,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Erro na avaliação de metas e conclusões:", error);
    return "Não foi possível avaliar as metas e conclusões.";
  }
}

/**
 * Rota para upload de PDF e análise do documento.
 */
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("Nenhum arquivo enviado.");
  }
  try {
    const data = await pdfParse(req.file.buffer);
    const textoExtraido = data.text;

    // Realizar análises com base no texto extraído
    const errosOrtograficos = await corrigirTexto(textoExtraido);
    const paragrafosMalElaborados = await avaliarParagrafos(textoExtraido);
    const introducao = extrairSecao("Introdução", textoExtraido);
    const sugestoesIntroducao = await sugestaoMelhoriasIntroducao(introducao);
    const objetivos = extrairSecao("Objetivos", textoExtraido);
    const resultados = extrairSecao("Resultados", textoExtraido);
    const conclusao = extrairSecao("Conclusão", textoExtraido);

    // Avaliação via modelo de completions tradicional
    const avaliacaoConvergencia = await avaliarConvergencia(objetivos, resultados);

    // Avaliação via chat completions: metas e conclusões
    const avaliacaoMetasConclusoes = await avaliarMetasEConclusoes(objetivos, conclusao);

    res.json({
      textoExtraido,
      errosOrtograficos,
      paragrafosMalElaborados,
      introducao,
      sugestoesIntroducao,
      objetivos,
      resultados,
      avaliacaoConvergencia,
      conclusao,
      avaliacaoMetasConclusoes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao processar o PDF.");
  }
});

/**
 * Inicia o servidor na porta definida.
 */
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
