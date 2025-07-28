import React from "react";

const AIChatPanelButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    style={{
      position: "fixed",
      right: "2rem",
      bottom: "2rem",
      zIndex: 1000,
      borderRadius: "50%",
      width: "56px",
      height: "56px",
      background: "#4f8cff",
      color: "#fff",
      border: "none",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      fontSize: "2rem",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
    aria-label="Open AI Chat"
    onClick={onClick}
  >
    💬
  </button>
);

export default AIChatPanelButton;