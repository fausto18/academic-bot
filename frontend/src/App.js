// src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import SectionDisplay from "./components/SectionDisplay";
import VisualizadorPDF from "./components/VisualizadorPDF";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [file, setFile] = useState(null);
  const [showPDF, setShowPDF] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");

  const [analise, setAnalise] = useState({
    textoExtraido: "",
    errosOrtograficos: "",
    paragrafosMalElaborados: "",
    introducao: "",
    sugestoesIntroducao: "",
    objetivos: "",
    resultados: "",
    conclusao: "",
    avaliacaoConvergencia: "",
    avaliacaoConclusao: ""
  });

  const lightTheme = {
    backgroundColor: "#ffffff",
    color: "#000000",
    backgroundBlockquote: "#f0f0f0",
    suggestionBlockquote: "#e6ffe6",
  };

  const darkTheme = {
    backgroundColor: "#000000",
    color: "#ffffff",
    backgroundBlockquote: "#333333",
    suggestionBlockquote: "#444444",
  };

  const themeStyles = theme === "light" ? lightTheme : darkTheme;

  useEffect(() => {
    const verificarAutenticacao = async () => {
      try {
        const res = await axios.get("https://academic-bot-production.up.railway.app/verificar", {
          withCredentials: true,
        });
        setAutenticado(true);
        setUsuario(res.data.usuario);
      } catch {
        setAutenticado(false);
        setUsuario(null);
      }
    };

    verificarAutenticacao();
  }, []);

  const handleLogout = async () => {
    await axios.post("https://academic-bot-production.up.railway.app/logout", {}, { withCredentials: true });
    setAutenticado(false);
    setUsuario(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Selecione um arquivo PDF");
      return;
    }

    setLoading(true);
    setShowPDF(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("https://academic-bot-production.up.railway.app/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setAnalise(response.data);
    } catch (error) {
      alert("Erro ao processar o PDF");
    }

    setLoading(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setShowPDF(true);
  };

  if (!autenticado) {
    return mostrarRegistro ? (
      <Register onVoltar={() => setMostrarRegistro(false)} />
    ) : (
      <Login
        onLogin={(usuarioData) => {
          setAutenticado(true);
          setUsuario(usuarioData);
        }}
        onRegistrar={() => setMostrarRegistro(true)}
      />
    );
  }

  if (usuario?.email === "fausto.sacufundala1997@gmail.com") {
    return <AdminPanel onLogout={handleLogout} />;
  }

  return (
    <>
      {loading && <div className="loading-overlay"><div className="loading-spinner"></div></div>}

      <div style={{ ...themeStyles, padding: "20px", minHeight: "100vh" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Revisão de Trabalhos Acadêmicos</h1>
          <div>
            <p>Bem-vindo, {usuario?.email}</p>
            <button onClick={handleLogout} style={{ padding: "8px", borderRadius: "6px", cursor: "pointer" }}>Logout</button>
          </div>
        </header>

        <div style={{ marginBottom: "25px" }}>
          <button onClick={() => setTheme("light")}>Tema Claro</button>
          <button onClick={() => setTheme("dark")}>Tema Escuro</button>
        </div>

        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button onClick={handleUpload}>Enviar</button>

        {showPDF && file && <VisualizadorPDF file={file} />}

        {analise.textoExtraido && (
          <>
            <hr />
            <h2>Texto Extraído</h2>
            <pre>{analise.textoExtraido}</pre>

            <h2>Erros Ortográficos</h2>
            <pre>{analise.errosOrtograficos}</pre>

            <h2>Parágrafos Mal Elaborados</h2>
            <pre>{analise.paragrafosMalElaborados}</pre>

            <SectionDisplay title="Introdução" content={analise.introducao} suggestion={analise.sugestoesIntroducao} themeStyles={themeStyles} />
            <SectionDisplay title="Objetivos" content={analise.objetivos} themeStyles={themeStyles} />
            <SectionDisplay title="Resultados" content={analise.resultados} themeStyles={themeStyles} />
            <SectionDisplay title="Conclusão" content={analise.conclusao} themeStyles={themeStyles} />

            <h2>Avaliação da Convergência</h2>
            <blockquote>{analise.avaliacaoConvergencia}</blockquote>

            <h2>Avaliação da Conclusão</h2>
            <blockquote>{analise.avaliacaoConclusao}</blockquote>
          </>
        )}
      </div>

      <footer style={{
        color: "#000000",
        backgroundColor: "#22D4FD",
        padding: "16px",
        textAlign: "center",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: "16px",
        fontWeight: 400,
      }}>
        © 2025 METANOIA TECHNOLOGY. Todos os direitos reservados.
      </footer>
    </>
  );
}

export default App;
