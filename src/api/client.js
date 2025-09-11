// src/api/client.js
const BASE_URL = (window.__ENV?.API_URL) || import.meta.env.VITE_API_URL || "http://localhost:8000";

const ACCESS_KEY  = "amx_access";
const REFRESH_KEY = "amx_refresh";
const PROFILE_KEY = "amx_profile";

// ---- helpers: события авторизации в текущей вкладке ----
function emitAuth(type, detail) {
  try { window.dispatchEvent(new CustomEvent(type, { detail })); } catch {}
}

function getAccess()  { return localStorage.getItem(ACCESS_KEY)  || ""; }
function getRefresh() { return localStorage.getItem(REFRESH_KEY) || ""; }

function setProfile(user) {
  if (user) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(PROFILE_KEY);
  }
  emitAuth("amx:user-updated", { user: user || null });
}

function setTokens({ access, refresh }) {
  if (access)  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  emitAuth(refresh ? "amx:auth-login" : "amx:auth-refresh", { hasRefresh: !!refresh });
}

function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(PROFILE_KEY);
  emitAuth("amx:user-updated", { user: null });
  emitAuth("amx:auth-logout");
}

async function refreshAccess() {
  const refresh = getRefresh();
  if (!refresh) throw new Error("no-refresh");
  const r = await fetch(`${BASE_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh })
  });
  if (!r.ok) throw new Error("refresh-failed");
  const data = await r.json();
  setTokens({ access: data.access }); // сгенерит amx:auth-refresh
  return data.access;
}

async function request(path, opts = {}, retry = true) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  const access = getAccess();
  if (access) headers.Authorization = `Bearer ${access}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers });

  if (res.status === 401 && retry && getRefresh()) {
    try {
      await refreshAccess();
      return request(path, opts, false);
    } catch {
      clearTokens();
    }
  }
  return res;
}

function normalizeApiError(data, fallback = "Ошибка запроса") {
  // Всегда возвращаем объект вида { detail: string, fields?: Record<string,string> }
  try {
    if (!data) return { detail: fallback };

    if (typeof data === "string") return { detail: data };

    // DRF-style { detail: "..." }
    if (Object.prototype.hasOwnProperty.call(data, "detail")) {
      const d = data.detail;
      if (Array.isArray(d)) return { detail: d.join(" ") };
      if (d && typeof d === "object") {
        const flat = Object.values(d).flat().filter(x => typeof x === "string");
        if (flat.length) return { detail: flat.join(" ") };
      }
      return { detail: String(d || fallback) };
    }

    // DRF field errors: { field: ["msg1", "msg2"], ... }
    const fields = {};
    const messages = [];
    if (data && typeof data === "object") {
      for (const [key, val] of Object.entries(data)) {
        if (!val) continue;
        if (Array.isArray(val)) {
          const msg = val.filter(v => typeof v === "string").join(" ");
          if (msg) { fields[key] = msg; messages.push(msg); }
        } else if (typeof val === "string") {
          fields[key] = val; messages.push(val);
        } else if (typeof val === "object") {
          const flat = Object.values(val).flat().filter(x => typeof x === "string");
          if (flat.length) { const msg = flat.join(" "); fields[key] = msg; messages.push(msg); }
        }
      }
    }
    if (messages.length) return { detail: messages.join(" "), fields };
  } catch {}
  return { detail: fallback };
}

export const api = {
  BASE_URL,
  setTokens,
  clearTokens,
  // Доступ к кэшу профиля (обновить localStorage + событие)
  cacheProfile: setProfile,

  // Универсальная авторизованная загрузка без навязанного Content-Type
  async authFetch(path, opts = {}, retry = true) {
    const headers = { ...(opts.headers || {}) };
    const access = getAccess();
    if (access && !headers.Authorization) headers.Authorization = `Bearer ${access}`;
    const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers });
    if (res.status === 401 && retry && getRefresh()) {
      try {
        await refreshAccess();
        return this.authFetch(path, opts, false);
      } catch {
        clearTokens();
      }
    }
    return res;
  },

  async register({ email, password, username }) {
    const res = await request(`/api/auth/register/`, {
      method: "POST",
      body: JSON.stringify({ email, password, username })
    }, false);
    if (!res.ok) {
      let raw = null;
      try { raw = await res.json(); } catch {}
      throw normalizeApiError(raw, "Ошибка регистрации");
    }
    const data = await res.json();
    setTokens({ access: data.access, refresh: data.refresh }); // amx:auth-login
    if (data.user) setProfile(data.user); // сразу кэшируем
    return data.user;
  },

  async login({ identifier, password }) {
    const username = identifier.includes("@") ? identifier.split("@")[0] : identifier;
    const res = await request(`/api/auth/login/`, {
      method: "POST",
      body: JSON.stringify({ username, password })
    }, false);
    if (!res.ok) {
      let raw = null;
      try { raw = await res.json(); } catch {}
      throw normalizeApiError(raw, "Ошибка входа");
    }
    const data = await res.json();
    setTokens({ access: data.access, refresh: data.refresh }); // amx:auth-login
    // профиль может подтянуться где-то позже через api.me(); здесь не дёргаем /me
    return true;
  },

  async me() {
    if (!getAccess()) return null;

    // даём шансу авто-рефрешу
    const res = await request(`/api/auth/me/`); // retry=true по умолчанию

    if (res.status === 401) {
      clearTokens();
      return null;
    }
    if (!res.ok) return null;

    const user = await res.json();   // ✅ было: uer
    setProfile(user);                // ✅ не user → ReferenceError
    return user;
  },

  logout() { clearTokens(); 

  }
};
