const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "https://academic-bot-frontend.vercel.app", credentials: true }));
app.use(express.json());
app.use(cookieParser());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const autenticarToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ mensagem: "Token ausente" });

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ mensagem: "Token inválido" });
    req.usuario = usuario;
    next();
  });
};

// --- ROTAS DE ADMINISTRAÇÃO ---
app.get("/usuarios/pendentes", autenticarToken, async (req, res) => {
  try {
    if (req.usuario.email !== " ") {
      return res.status(403).json({ mensagem: "Acesso negado" });
    }

    const resultado = await pool.query(
      "SELECT id, email FROM usuarios WHERE aprovado = false"
    );
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao buscar usuários pendentes" });
  }
});

app.post("/usuarios/aprovar/:id", autenticarToken, async (req, res) => {
  const { id } = req.params;
  try {
    if (req.usuario.email !== " ") {
      return res.status(403).json({ mensagem: "Acesso negado" });
    }

    await pool.query("UPDATE usuarios SET aprovado = true WHERE id = $1", [id]);
    res.json({ mensagem: "Usuário aprovado com sucesso" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao aprovar usuário" });
  }
});

app.delete("/usuarios/:id", autenticarToken, async (req, res) => {
  const { id } = req.params;
  try {
    if (req.usuario.email !== " ") {
      return res.status(403).json({ mensagem: "Acesso negado" });
    }

    await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    res.json({ mensagem: "Usuário rejeitado e removido" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao excluir usuário" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
