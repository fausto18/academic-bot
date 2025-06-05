import React, { useState, useEffect } from "react";
import axios from "axios";

function AdminPanel() {
  const [usuariosPendentes, setUsuariosPendentes] = useState([]);
  const [mensagem, setMensagem] = useState("");

  const buscarPendentes = async () => {
    try {
      const res = await axios.get("https://academic-bot-production.up.railway.app/usuarios/pendentes", {
        withCredentials: true,
      });
      setUsuariosPendentes(res.data);
    } catch (err) {
      setMensagem("Erro ao buscar usuários.");
    }
  };

  useEffect(() => {
    buscarPendentes();
  }, []);

  const aprovar = async (id) => {
    try {
      await axios.post("https://academic-bot-production.up.railway.app/usuarios/aprovar/${id}", {}, {
        withCredentials: true,
      });
      setMensagem("Usuário aprovado com sucesso.");
      buscarPendentes();
    } catch {
      setMensagem("Erro ao aprovar usuário.");
    }
  };

  const rejeitar = async (id) => {
    try {
      await axios.delete("https://academic-bot-production.up.railway.app/usuarios/${id}", {
        withCredentials: true,
      });
      setMensagem("Usuário rejeitado e removido.");
      buscarPendentes();
    } catch {
      setMensagem("Erro ao rejeitar usuário.");
    }
  };

  return (
    <div style={{
      padding: "20px",
      maxWidth: "600px",
      margin: "0 auto",
      fontFamily: "Arial, sans-serif",
    }}>
      <h2 style={{ textAlign: "center" }}>Painel de Administração</h2>

      {mensagem && (
        <div style={{ marginBottom: "15px", color: "green", textAlign: "center" }}>
          {mensagem}
        </div>
      )}

      {usuariosPendentes.length === 0 ? (
        <p style={{ textAlign: "center" }}>Nenhum usuário pendente.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {usuariosPendentes.map((usuario) => (
            <li key={usuario.id} style={{
              padding: "10px",
              borderBottom: "1px solid #ccc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span>{usuario.email}</span>
              <div>
                <button
                  onClick={() => aprovar(usuario.id)}
                  style={{
                    marginRight: "10px",
                    backgroundColor: "green",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Aprovar
                </button>
                <button
                  onClick={() => rejeitar(usuario.id)}
                  style={{
                    backgroundColor: "red",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Rejeitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminPanel;
