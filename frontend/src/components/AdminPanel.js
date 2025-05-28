// src/components/AdminPanel.js
import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminPanel() {
  const [pendentes, setPendentes] = useState([]);
  const [mensagem, setMensagem] = useState("");

  const buscarPendentes = async () => {
    try {
      const response = await axios.get("https://academic-bot-production.up.railway.app/pendentes", {
        withCredentials: true,
      });
      setPendentes(response.data);
    } catch (error) {
      setMensagem("Erro ao buscar usuários pendentes.");
    }
  };

  const aprovarUsuario = async (email) => {
    try {
      const response = await axios.post("https://academic-bot-production.up.railway.app/aprovar", { email }, {
        withCredentials: true,
      });
      setMensagem(response.data.mensagem);
      buscarPendentes(); // atualizar lista
    } catch (error) {
      setMensagem("Erro ao aprovar usuário.");
    }
  };

  useEffect(() => {
    buscarPendentes();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Painel do Administrador</h2>
      {mensagem && <p>{mensagem}</p>}
      <ul>
        {pendentes.map((user) => (
          <li key={user.email} style={{ marginBottom: "10px" }}>
            {user.email}
            <button onClick={() => aprovarUsuario(user.email)} style={{ marginLeft: "10px", padding: "5px" }}>
              Aprovar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPanel;
