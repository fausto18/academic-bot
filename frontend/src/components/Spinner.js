// components/Spinner.js
import React from "react";

const Spinner = () => (
  <div style={{ textAlign: "center", marginTop: "20px" }}>
    <div className="spinner" style={{
      border: "5px solid #f3f3f3",
      borderTop: "5px solid #22D4FD",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      animation: "spin 1s linear infinite",
      margin: "auto"
    }} />
    <style>
      {`@keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }`}
    </style>
  </div>
);

export default Spinner;
