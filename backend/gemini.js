// gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Usa o modelo rápido da Google Gemini
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function gerarResposta(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro ao gerar resposta com Gemini:", error);
    return "Erro ao gerar resposta.";
  }
}
