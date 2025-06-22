// src/components/LoginSMS.js
import React, { useState } from "react";
import axios from "axios";
import Spinner from "./Spinner";

function LoginSMS({ onLogin, onVoltar }) {
  const [telefone, setTelefone] = useState("");
  const [codigo, setCodigo] = useState("");
  const [etapa, setEtapa] = useState("enviar");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnviarSMS = async () => {
    if (!telefone.trim()) {
      setMensagem("Preencha o número de telefone.");
      return;
    }

    setLoading(true);
    setMensagem("");

    try {
      await axios.post("https://academic-bot-production.up.railway.app/enviar-sms", { telefone });
      setEtapa("verificar");
      setMensagem("Código enviado para o telefone informado.");
    } catch (error) {
      setMensagem("Erro ao enviar SMS. Verifique o número e tente novamente.");
    }

    setLoading(false);
  };

  const handleVerificarCodigo = async () => {
    if (!codigo.trim()) {
      setMensagem("Informe o código recebido.");
      return;
    }

    setLoading(true);
    setMensagem("");

    try {
      const res = await axios.post(
        "https://academic-bot-production.up.railway.app/verificar-sms",
        { telefone, codigo },
        { withCredentials: true }
      );
      onLogin(res.data.usuario);
    } catch {
      setMensagem("Código inválido ou expirado.");
    }

    setLoading(false);
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
          <h2 style={{ fontSize: "22px", color: "#333" }}>Login via SMS</h2>
        </div>

        {etapa === "enviar" && (
          <>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Número de Telefone"
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
            <button
              onClick={handleEnviarSMS}
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
              {loading ? "Enviando..." : "Enviar Código"}
            </button>
          </>
        )}

        {etapa === "verificar" && (
          <>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Código recebido"
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
            <button
              onClick={handleVerificarCodigo}
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
              {loading ? "Verificando..." : "Verificar Código"}
            </button>
          </>
        )}

        {mensagem && (
          <div style={{ marginTop: "15px", textAlign: "center", color: "#C3343F", fontSize: "13px" }}>
            {mensagem}
          </div>
        )}

        <div style={{ marginTop: "25px", textAlign: "center" }}>
          <button
            onClick={onVoltar}
            style={{
              background: "none",
              border: "none",
              color: "#3366cc",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            Voltar para o login principal
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginSMS;
