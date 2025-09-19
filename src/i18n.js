// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

const SUPPORTED = ["en", "ru", "uk"];

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: SUPPORTED,
    ns: ["common"],
    defaultNS: "common",
    load: "languageOnly",
    debug: false,
    detection: {
      // порядок детекта: параметр ?lng=, <html lang>, localStorage, navigator
      order: ["querystring", "htmlTag", "localStorage", "navigator"],
      caches: ["localStorage"],
      lookupQuerystring: "lng"
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json"
    },
    interpolation: { escapeValue: false }
  });

/** Синхронизируем атрибут <html lang="..."> */
i18n.on("languageChanged", (lng) => {
  document.documentElement.setAttribute("lang", lng || "en");
});

export default i18n;
