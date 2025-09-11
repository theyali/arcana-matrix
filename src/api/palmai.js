// src/api/palmai.js
import { api } from "./client";

const TOKEN_KEY = "amx_access";
const authHeader = () => {
  const t = localStorage.getItem(TOKEN_KEY);
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// универсальный хелпер: принимает Promise<Response>
async function handle(resPromise) {
  let res;
  try {
    res = await resPromise;           // ← вот это главное
  } catch {
    const err = new Error("Сеть недоступна");
    err.status = 0;
    throw err;
  }

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const payload = await (isJson ? res.json() : res.text()).catch(() => null);

  if (!res.ok) {
    const msg =
      (payload && (payload.detail || payload.error)) ||
      (typeof payload === "string" ? payload : null) ||
      `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return payload;
}

export const predictionsApi = {
  analyzePalm(files, { locale = "ru" } = {}) {
    const form = new FormData();
    files.forEach((f) => form.append("images", f, f.name));
    form.append("locale", locale);
    return handle(
      fetch(`${api.BASE_URL}/api/predictions/palm/analyze`, {
        method: "POST",
        body: form,
        credentials: "include",
        headers: { ...authHeader() },
      })
    );
  },

  analyzeCoffee(files, { locale = "ru" } = {}) {
    const form = new FormData();
    files.forEach((f) => form.append("images", f, f.name));
    form.append("locale", locale);
    return handle(
      fetch(`${api.BASE_URL}/api/predictions/coffee/analyze`, {
        method: "POST",
        body: form,
        credentials: "include",
        headers: { ...authHeader() },
      })
    );
  },

  history(kind = "palm") {
    return handle(
      fetch(`${api.BASE_URL}/api/predictions/history/?kind=${encodeURIComponent(kind)}`, {
        credentials: "include",
        headers: { ...authHeader() },
      })
    );
  },

  get(id) {
    return handle(
      fetch(`${api.BASE_URL}/api/predictions/${id}/`, {
        credentials: "include",
        headers: { ...authHeader() },
      })
    );
  },
};
