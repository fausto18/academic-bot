import React, { useState } from "react";
import axios from "axios";

function ResetPassword({ onVoltar }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleReset = async () => {
    if (!novaSenha || !confirmarSenha) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setMensagem("As senhas não coincidem.");
      return;
    }

    try {
      const response = await axios.post(
        "https://academic-bot-production.up.railway.app/reset-password",
        { novaSenha },
        { withCredentials: true }
      );

      setMensagem(response.data.mensagem || "Senha redefinida com sucesso.");
      setSucesso(true);
    } catch (err) {
      setMensagem("Erro ao redefinir a senha.");
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
          <h2 style={{ fontSize: "22px", color: "#333" }}>Redefinir Senha</h2>
        </div>

        <input
          type="password"
          placeholder="Nova senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#f1f1f1",
            fontSize: "14px",
            marginBottom: "10px"
          }}
        />
        <input
          type="password"
          placeholder="Confirmar nova senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#f1f1f1",
            fontSize: "14px",
            marginBottom: "10px"
          }}
        />

        <button
          onClick={handleReset}
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
          Redefinir Senha
        </button>

        {mensagem && (
          <p style={{
            marginTop: "15px",
            color: sucesso ? "green" : "#C3343F",
            textAlign: "center",
            fontSize: "13px"
          }}>
            {mensagem}
          </p>
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
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
