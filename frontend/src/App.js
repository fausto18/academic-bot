import React, { useState } from "react";
import axios from "axios";
import SectionDisplay from "./components/SectionDisplay";
import VisualizadorPDF from "./components/VisualizadorPDF";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [file, setFile] = useState(null);
  const [showPDF, setShowPDF] = useState(false);
  const [textoExtraido, setTextoExtraido] = useState("");
  const [errosOrtograficos, setErrosOrtograficos] = useState("");
  const [paragrafosMalElaborados, setParagrafosMalElaborados] = useState("");
  const [introducao, setIntroducao] = useState("");
  const [sugestoesIntroducao, setSugestoesIntroducao] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [resultados, setResultados] = useState("");
  const [avaliacaoConvergencia, setAvaliacaoConvergencia] = useState("");
  const [conclusao, setConclusao] = useState("");
  const [avaliacaoConclusao, setAvaliacaoConclusao] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");

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

  const buttonStyle = {
    padding: "10px 20px",
    margin: "5px",
    backgroundColor: "#22D4FD",
    border: "none",
    borderRadius: "5px",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
  };

  const preStyle = {
    background: themeStyles.backgroundBlockquote,
    color: themeStyles.color,
    padding: "10px",
    whiteSpace: "pre-wrap",
    fontFamily: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
    textAlign: "left",
    borderRadius: "6px",
    overflowX: "auto",
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setShowPDF(true);
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
      const data = response.data;
      setTextoExtraido(data.textoExtraido);
      setErrosOrtograficos(data.errosOrtograficos);
      setParagrafosMalElaborados(data.paragrafosMalElaborados);
      setIntroducao(data.introducao);
      setSugestoesIntroducao(data.sugestoesIntroducao);
      setObjetivos(data.objetivos);
      setResultados(data.resultados);
      setAvaliacaoConvergencia(data.avaliacaoConvergencia);
      setConclusao(data.conclusao);
      setAvaliacaoConclusao(data.avaliacaoConclusao);
    } catch (error) {
      console.error(error);
      alert("Erro ao processar o PDF");
    }

    setLoading(false);
  };

  if (!autenticado) {
    return mostrarRegistro ? (
      <Register onVoltar={() => setMostrarRegistro(false)} />
    ) : (
      <Login onLogin={setAutenticado} onRegistrar={() => setMostrarRegistro(true)} />
    );
  }

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <div style={{ ...themeStyles, padding: "20px", fontFamily: "Arial, sans-serif", minHeight: "100vh" }}>
        <h1>Revisão de Trabalhos Acadêmicos</h1>

        <div style={{ marginBottom: "25px" }}>
          <button onClick={() => setTheme("light")} style={buttonStyle}>Tema Claro</button>
          <button onClick={() => setTheme("dark")} style={buttonStyle}>Tema Escuro</button>
        </div>

        <div>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
          <button onClick={handleUpload} style={buttonStyle} disabled={loading}>
            Enviar
          </button>
        </div>

        {showPDF && file && <VisualizadorPDF file={file} />}

        {!loading && textoExtraido && (
          <>
            <hr />
            <h2>Texto Extraído</h2>
            <pre style={preStyle}>{textoExtraido}</pre>

            <hr />
            <h2>Erros Ortográficos</h2>
            <pre style={preStyle}>{errosOrtograficos}</pre>

            <hr />
            <h2>Parágrafos Mal Elaborados</h2>
            <pre style={preStyle}>{paragrafosMalElaborados}</pre>

            <hr />
            <SectionDisplay title="Introdução" content={introducao} suggestion={sugestoesIntroducao} themeStyles={themeStyles} />
            <SectionDisplay title="Objetivos" content={objetivos} themeStyles={themeStyles} />
            <SectionDisplay title="Resultados" content={resultados} themeStyles={themeStyles} />
            <SectionDisplay title="Conclusão" content={conclusao} themeStyles={themeStyles} />

            <hr />
            <h2>Avaliação da Convergência entre Objetivos e Resultados</h2>
            <blockquote style={{
              background: themeStyles.backgroundBlockquote,
              color: themeStyles.color,
              padding: "10px",
              borderRadius: "6px",
              textAlign: "left",
            }}>
              {avaliacaoConvergencia || "Não foi possível avaliar a convergência."}
            </blockquote>

            <hr />
            <h2>Avaliação da Conclusão</h2>
            <blockquote style={{
              background: themeStyles.backgroundBlockquote,
              color: themeStyles.color,
              padding: "10px",
              borderRadius: "6px",
              textAlign: "left",
            }}>
              {avaliacaoConclusao || "Não foi possível avaliar a conclusão."}
            </blockquote>
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
