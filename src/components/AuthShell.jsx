// src/components/AuthShell.jsx
import React from "react";

export default function AuthShell({ title, children }) {
  return (
    <div className="auth-shell">
      <div className="auth-blanket" aria-hidden="true" />
      <div className="auth-container">
        <div className="panel-card auth-card">
          {title && (
            <h1 className="auth-title" style={{ color: "var(--text)" }}>
              {title}
            </h1>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
