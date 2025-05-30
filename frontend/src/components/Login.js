import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin, onRegistrar }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    setCarregando(true);
    setMensagem("");

    try {
      const response = await axios.post(
        "https://academic-bot-production.up.railway.app/login",
        { email, senha },
        { withCredentials: true }
      );

      if (response.data && response.data.usuario) {
        onLogin(response.data.usuario); // envia os dados para App
      } else {
        setMensagem("Login realizado, mas usuário não reconhecido.");
      }
    } catch (error) {
      setMensagem("Email ou senha inválido.");
    }

    setCarregando(false);
  };

  return (
    <div style={{
      maxWidth: "400px",
      margin: "50px auto",
      padding: "30px",
      backgroundColor: "#f2f2f2",
      borderRadius: "10px",
      fontFamily: "Arial",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ textAlign: "center" }}>Login</h2>

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
          type={mostrarSenha ? "text" : "password"}
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
        <label style={{ fontSize: "0.9em" }}>
          <input
            type="checkbox"
            checked={mostrarSenha}
            onChange={() => setMostrarSenha(!mostrarSenha)}
          /> Mostrar senha
        </label>
      </div>

      <button
        onClick={handleLogin}
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
        {carregando ? "Entrando..." : "Login"}
      </button>

      {mensagem && (
        <div style={{
          marginTop: "15px",
          color: "red",
          textAlign: "center",
          fontWeight: "bold"
        }}>
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
