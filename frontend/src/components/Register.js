import React, { useState } from "react";
import axios from "axios";
import Spinner from "./Spinner";

function Register({ onVoltar }) {
  const [form, setForm] = useState({
    primeiro_nome: "",
    ultimo_nome: "",
    email: "",
    contacto: "",
    senha: "",
    repetir_senha: ""
  });

  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const { primeiro_nome, ultimo_nome, email, contacto, senha, repetir_senha } = form;

    if (!primeiro_nome || !ultimo_nome || !email || !contacto || !senha || !repetir_senha) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    if (senha !== repetir_senha) {
      setMensagem("As senhas não coincidem.");
      return;
    }

    setMensagem("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/register`,
        { primeiro_nome, ultimo_nome, email, contacto, senha },
        { withCredentials: true }
      );
      setMensagem(response.data.mensagem || "Registro realizado com sucesso!");
    } catch (error) {
      setMensagem("Erro ao registrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "380px",
        padding: "30px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        borderRadius: "12px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "22px", color: "#333" }}>Crie sua conta</h2>
        </div>

        {["primeiro_nome", "ultimo_nome", "email", "contacto", "senha", "repetir_senha"].map((field) => (
          <div key={field} style={{ marginBottom: "15px" }}>
            <input
              type={field.includes("senha") ? "password" : "text"}
              name={field}
              value={form[field]}
              onChange={handleChange}
              placeholder={
                field === "primeiro_nome" ? "Primeiro Nome" :
                field === "ultimo_nome" ? "Último Nome" :
                field === "email" ? "Email" :
                field === "contacto" ? "Contacto" :
                field === "senha" ? "Senha" :
                "Repita a Senha"
              }
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#f1f1f1",
                fontSize: "14px"
              }}
            />
          </div>
        ))}

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: "#C3343F",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer"
          }}
        >
          {loading ? "Registrando..." : "REGISTRAR"}
        </button>

        {mensagem && (
          <div style={{ marginTop: "15px", color: "green", textAlign: "center", fontSize: "13px" }}>
            {mensagem}
          </div>
        )}

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={onVoltar}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "#3366cc",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            Já tem conta? Faça login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
