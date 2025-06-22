import React, { useState } from "react";
import axios from "axios";
import Spinner from "./Spinner";

function Login({ onLogin, onRegistrar, onResetPassword, onLoginSMS }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      setMensagem("Preencha todos os campos.");
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
      onLogin(response.data.usuario); // passa o usuário logado
    } catch {
      setMensagem("Email ou senha inválido.");
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
        maxWidth: "360px",
        padding: "30px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        borderRadius: "12px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "22px", color: "#333" }}>Faça login no bot acadêmico</h2>
        </div>

        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Telefone/E-mail"
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#f1f1f1",
            marginBottom: "15px",
            fontSize: "14px"
          }}
        />

        <div style={{ marginBottom: "10px" }}>
          <input
            type={mostrarSenha ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#f1f1f1",
              fontSize: "14px"
            }}
          />
          <div style={{ textAlign: "right", fontSize: "12px", marginTop: "4px" }}>
            <button
              onClick={() => setMostrarSenha(!mostrarSenha)}
              style={{
                background: "none",
                border: "none",
                color: "#3366cc",
                cursor: "pointer",
                padding: 0
              }}
            >
              {mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "20px", fontSize: "13px", textAlign: "center" }}>
          <button
            onClick={onLoginSMS}
            style={{
              background: "none",
              border: "none",
              color: "#3366cc",
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0
            }}
          >
            Faça login via SMS
          </button>
        </div>

        <button
          onClick={handleLogin}
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
          {loading ? "Conectando..." : "CONECTE-SE"}
        </button>

        {mensagem && (
          <div style={{ marginTop: "15px", textAlign: "center", color: "#C3343F", fontSize: "13px" }}>
            {mensagem}
          </div>
        )}

        <div style={{
          marginTop: "25px",
          display: "flex",
          justifyContent: "space-around",
          fontSize: "13px"
        }}>
          <button onClick={onRegistrar} style={{ color: "#3366cc", border: "none", background: "none", cursor: "pointer" }}>
            Registrar
          </button>
          <span style={{ color: "#ccc" }}>|</span>
          <button onClick={onResetPassword} style={{ color: "#3366cc", border: "none", background: "none", cursor: "pointer" }}>
            Esqueceu sua senha?
          </button>
          <span style={{ color: "#ccc" }}>|</span>
          <a href="#" style={{ color: "#3366cc", textDecoration: "none" }}>
            Ajuda
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
