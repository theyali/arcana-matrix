// src/components/PageTransition.jsx
import React from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();
  // Ключуем только по pathname, чтобы изменения query (например, табы) не триггерили page-enter
  const key = location.pathname;
  return (
    <div key={key} className="page-transition page-enter">
      {children}
    </div>
  );
}
