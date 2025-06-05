import React, { useState } from "react";
import axios from "axios";
import Spinner from "./Spinner";


function Register({ onVoltar }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !senha.trim()) {
      setMensagem("Preencha o email e a senha.");
      return;
    }

    setMensagem("");
    setLoading(true);

    try {
      const response = await axios.post(
        "${API_BASE}/register",
        { email, senha },
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

      <div style={{ marginBottom: "10px" }}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          placeholder="Digite seu email"
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Senha:</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          placeholder="Crie uma senha segura"
        />
      </div>

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
