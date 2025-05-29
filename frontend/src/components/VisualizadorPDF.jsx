import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.entry";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

function VisualizadorPDF({ file }) {
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div style={{ margin: "20px 0" }}>
      <h2>Visualização Completa do PDF</h2>
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={600}
          />
        ))}
      </Document>
    </div>
  );
}

export default VisualizadorPDF;