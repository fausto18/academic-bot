import React, { useState } from "react";
import axios from "axios";

function Register({ onVoltar }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleRegistro = async () => {
    if (!email || !senha) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    setCarregando(true);
    setMensagem("");

    try {
      const response = await axios.post(
        "https://academic-bot-production.up.railway.app/registrar",
        { email, senha }
      );

      if (response.data?.mensagem) {
        setMensagem(response.data.mensagem);
      } else {
        setMensagem("Registro efetuado com sucesso.");
      }
    } catch (error) {
      setMensagem("Erro ao registrar. Email pode já estar em uso.");
    }

    setCarregando(false);
  };

  return (
    <div style={{
      maxWidth: "400px",
      margin: "50px auto",
      padding: "30px",
      backgroundColor: "#f9f9f9",
      borderRadius: "10px",
      fontFamily: "Arial",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ textAlign: "center" }}>Registrar</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "4px",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Senha:</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "4px",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
        />
      </div>

      <button
        onClick={handleRegistro}
        disabled={carregando}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#22D4FD",
          border: "none",
          borderRadius: "5px",
          fontWeight: "bold",
          cursor: carregando ? "not-allowed" : "pointer",
          opacity: carregando ? 0.7 : 1
        }}
      >
        {carregando ? "Registrando..." : "Registrar"}
      </button>

      {mensagem && (
        <div style={{
          marginTop: "15px",
          color: mensagem.includes("sucesso") ? "green" : "red",
          textAlign: "center",
          fontWeight: "bold"
        }}>
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
          Já tem conta? Fazer Login
        </button>
      </div>
    </div>
  );
}

export default Register;
