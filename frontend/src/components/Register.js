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
      maxWidth: "400px",
      margin: "50px auto",
      padding: "30px",
      backgroundColor: "#f2f2f2",
      borderRadius: "10px",
      fontFamily: "Arial"
    }}>
      <h2>Registro</h2>

      {["primeiro_nome", "ultimo_nome", "email", "contacto", "senha", "repetir_senha"].map((field, index) => (
        <div key={field} style={{ marginBottom: "10px" }}>
          <label>
            {field === "primeiro_nome" ? "Primeiro Nome:" :
              field === "ultimo_nome" ? "Último Nome:" :
              field === "email" ? "Email:" :
              field === "contacto" ? "Contacto:" :
              field === "senha" ? "Senha:" :
              "Digite novamente a senha:"}
          </label>
          <input
            type={field.includes("senha") ? "password" : "text"}
            name={field}
            value={form[field]}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            placeholder={
              field === "primeiro_nome" ? "Digite seu primeiro nome" :
              field === "ultimo_nome" ? "Digite seu último nome" :
              field === "email" ? "Digite seu email" :
              field === "contacto" ? "Digite seu contacto" :
              field === "senha" ? "Crie uma senha segura" :
              "Repita a senha"
            }
          />
        </div>
      ))}

      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#22D4FD",
          border: "none",
          borderRadius: "5px",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        {loading ? "Registrando..." : "Registrar"}
      </button>

      {loading && <Spinner />}
      {mensagem && (
        <div style={{ marginTop: "15px", color: "green", textAlign: "center" }}>
          {mensagem}
        </div>
      )}

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={onVoltar}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "#007bff",
            textDecoration: "underline",
            cursor: "pointer"
          }}
        >
          Já tem conta? Voltar
        </button>
      </div>
    </div>
  );
}

export default Register;
