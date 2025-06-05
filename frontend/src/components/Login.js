import React, { useState } from "react";
import axios from "axios";
import Spinner from "./Spinner";

function Login({ onLogin, onRegistrar }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      setMensagem("Preencha o email e a senha.");
      return;
    }

    setMensagem("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://academic-bot-production.up.railway.app/login",
        { email, senha },
        { withCredentials: true }
      );
      setMensagem(response.data.mensagem);
      onLogin(); // sucesso
    } catch (error) {
      setMensagem("Email ou senha inválido.");
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
      <h2>Login</h2>

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
          type={mostrarSenha ? "text" : "password"}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          placeholder="Digite sua senha"
        />
        <label style={{ fontSize: "14px", display: "block", marginTop: "5px" }}>
          <input
            type="checkbox"
            checked={mostrarSenha}
            onChange={() => setMostrarSenha(!mostrarSenha)}
          /> Mostrar senha
        </label>
      </div>

      <button
        onClick={handleLogin}
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
        {loading ? "Entrando..." : "Entrar"}
      </button>

      {loading && <Spinner />}
      {mensagem && (
        <div style={{ marginTop: "15px", color: "red", textAlign: "center" }}>
          {mensagem}
        </div>
      )}

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={onRegistrar}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "#007bff",
            textDecoration: "underline",
            cursor: "pointer"
          }}
        >
          Não tem conta? Registrar
        </button>
      </div>
    </div>
  );
}

export default Login;
