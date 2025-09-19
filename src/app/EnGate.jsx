// src/app/EnGate.jsx
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import i18n from "../i18n";

/** Принудительно включает английский для ветки БЕЗ языкового префикса */
export default function EnGate() {
  useEffect(() => {
    if (i18n.resolvedLanguage !== "en") {
      i18n.changeLanguage("en");
    }
  }, []);
  return <Outlet />;
}
