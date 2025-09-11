// src/components/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center" style={{color:"var(--text)"}}>
        Загрузка…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
