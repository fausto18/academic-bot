// frontend/src/components/SectionDisplay.jsx

import React from "react";

const SectionDisplay = ({ title, content, suggestion, themeStyles }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>{title}</h2>
      {content ? (
        <>
          <blockquote style={{ background: themeStyles.backgroundBlockquote, padding: "10px" }}>
            {content}
          </blockquote>
          {suggestion && (
            <>
              <h3>Sugestões:</h3>
              <blockquote style={{ background: themeStyles.suggestionBlockquote, padding: "10px" }}>
                {suggestion}
              </blockquote>
            </>
          )}
        </>
      ) : (
        <p>{title} não encontrada.</p>
      )}
    </div>
  );
};

export default SectionDisplay;