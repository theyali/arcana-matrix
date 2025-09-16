// src/api/history.js
import { api } from "./client";

function qs(params = {}) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    u.set(k, v);
  });
  const s = u.toString();
  return s ? `?${s}` : "";
}

function normalizeError(data, fallback = "Ошибка запроса") {
  try {
    if (!data) return { detail: fallback };
    if (typeof data === "string") return { detail: data };
    if (Object.prototype.hasOwnProperty.call(data, "detail")) {
      const d = data.detail;
      if (Array.isArray(d)) return { detail: d.join(" ") };
      if (d && typeof d === "object") {
        const flat = Object.values(d).flat().filter(x => typeof x === "string");
        if (flat.length) return { detail: flat.join(" ") };
      }
      return { detail: String(d || fallback) };
    }
  } catch {}
  return { detail: fallback };
}

export async function listHistory({ page = 1, kind } = {}) {
  const res = await api.authFetch(`/api/predictions/history/${qs({ page, kind })}`);
  if (!res.ok) {
    let raw = null;
    try { raw = await res.json(); } catch {}
    throw normalizeError(raw, "Не удалось загрузить историю");
  }
  return res.json();
}

