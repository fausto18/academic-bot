// frontend/src/App.js
import React, { useState } from "react";
import axios from "axios";
import SectionDisplay from "./components/SectionDisplay";

function App() {
  const [file, setFile] = useState(null);
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

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Selecione um arquivo PDF");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
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

  return (
    <><div style={{ ...themeStyles, padding: "20px", fontFamily: "Arial, sans-serif", minHeight: "100vh" }}>
      <h1>Revisão de Trabalhos Acadêmicos</h1>
      <div style={{ marginBottom: "25px" }}>
        <button onClick={() => setTheme("light")} style={{ marginRight: "10px" }}>
          Tema Claro
        </button>
        <button onClick={() => setTheme("dark")}>Tema Escuro</button>
      </div>
      <div>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ marginLeft: "10px" }}>
          Enviar
        </button>
      </div>
      {loading && <p>Processando... Por favor, aguarde.</p>}
      <hr />
      <h2>Texto Extraído</h2>
      <pre style={{ background: themeStyles.backgroundBlockquote, padding: "10px", whiteSpace: "pre-wrap" }}>
        {textoExtraido}
      </pre>
      <hr />
      <h2>Erros Ortográficos</h2>
      <pre style={{ background: themeStyles.backgroundBlockquote, padding: "10px", whiteSpace: "pre-wrap" }}>
        {errosOrtograficos}
      </pre>
      <hr />
      <h2>Parágrafos Mal Elaborados</h2>
      <pre style={{ background: themeStyles.backgroundBlockquote, padding: "10px", whiteSpace: "pre-wrap" }}>
        {paragrafosMalElaborados}
      </pre>
      <hr />
      <SectionDisplay title="Introdução" content={introducao} suggestion={sugestoesIntroducao} themeStyles={themeStyles} />
      <SectionDisplay title="Objetivos" content={objetivos} themeStyles={themeStyles} />
      <SectionDisplay title="Resultados" content={resultados} themeStyles={themeStyles} />
      <SectionDisplay title="Conclusão" content={conclusao} themeStyles={themeStyles} />
      <hr />
      <h2>Avaliação da Convergência entre Objetivos e Resultados</h2>
      <blockquote style={{ background: themeStyles.backgroundBlockquote, padding: "10px" }}>
        {avaliacaoConvergencia || "Não foi possível avaliar a convergência."}
      </blockquote>
      <hr />
      <h2>Avaliação da Conclusão</h2>
      <blockquote style={{ background: themeStyles.backgroundBlockquote, padding: "10px" }}>
        {avaliacaoConclusao || "Não foi possível avaliar a conclusão."}
      </blockquote>
    </div><footer
      style={{
        color: "#000000",
        backgroundColor: "#22D4FD",
        padding: "16px",          
        textAlign: "center",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: "16px",
        fontWeight: 400    
        
      }}
    >
        metanoia 2025
      </footer></>
  );
}

export default App;
