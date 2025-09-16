// API-обёртка для гороскопов (DRF), использует тот же BASE_URL, что и client.js
import { api } from "./client";

// UI → API: преобразование периодов
export const PERIOD_UI2API = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  // yearly: "year",
};

function qs(params = {}) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    u.set(k, v);
  });
  const s = u.toString();
  return s ? `?${s}` : "";
}

// Базовый GET — ОБЯЗАТЕЛЬНО через authFetch, чтобы прилетал Authorization: Bearer <token>
async function GET(path) {
  const res = await api.authFetch(path, { method: "GET" });
  if (!res.ok) {
    let err = { detail: "Ошибка запроса" };
    try { err = await res.json(); } catch {}
    const msg = err?.detail || res.statusText || "Ошибка запроса";
    throw new Error(msg);
  }
  return res.json();
}

// --- Публичные методы ---

export async function getSigns() {
  // GET /api/signs/
  return GET(`/api/signs/`);
}

export async function getSources() {
  // GET /api/sources/
  return GET(`/api/sources/`);
}

export async function getBucket({ period = "day", date, category = "general", lang = "ru", source } = {}) {
  // GET /api/horoscopes/bucket/?period=...&date=...&category=...&lang=...&source=...
  return GET(`/api/horoscopes/bucket/${qs({ period, date, category, lang, source })}`);
}

export async function getLatest({ sign, period = "day", date, category = "general", lang = "ru", source } = {}) {
  // GET /api/horoscopes/latest/?sign=...&period=...&date=...&category=...&lang=...&source=...
  if (!sign) throw new Error("sign обязателен");
  return GET(`/api/horoscopes/latest/${qs({ sign, period, date, category, lang, source })}`);
}

export async function listForecasts(params = {}) {
  return GET(`/api/horoscopes/${qs(params)}`);
}
