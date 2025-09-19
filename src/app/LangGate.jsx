// src/app/LangGate.jsx
import React, { useEffect } from "react";
import { Navigate, Outlet, useParams, useLocation } from "react-router-dom";
import i18n from "../i18n";

const ALLOWED = ["en", "ru", "uk"];

export default function LangGate() {
  const { lng } = useParams();
  const location = useLocation();
  const safe = ALLOWED.includes(lng);

  // /en -> редирект на корень без префикса
  if (lng === "en") {
    const rest = location.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
    return <Navigate to={rest + location.search + location.hash} replace />;
  }

  useEffect(() => {
    if (safe && i18n.resolvedLanguage !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng, safe]);

  if (!safe) return <Navigate to="/" replace />;
  return <Outlet />;
}
