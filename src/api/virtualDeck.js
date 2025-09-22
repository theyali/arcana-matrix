// src/api/virtualDeck.js
import { api } from "./client";

const PATHS = {
  quota: "/api/vd/quota/",
  start: "/api/vd/spreads/start/",
  complete: "/api/vd/spreads/complete/",
};

// Ключи состояния активного расклада в текущей вкладке
const ACTIVE_KEY = "vd_spread_active";
const ID_KEY = "vd_spread_id";
const TS_KEY = "vd_spread_ts";

export const VIRTUAL_DECK_API_PATHS = PATHS;

export async function getDeckQuota() {
  const res = await api.authFetch(PATHS.quota, { method: "GET" });
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) return null;

  const data = await res.json();
  const p = data?.primary || null;
  if (!p) return null;

  return {
    limit: Number(p.limit ?? 0),
    remaining: Number(p.remaining ?? 0),
    period: String(p.period ?? "weekly"),
    periodEndsAt: data.period_ends_at || data.periodEndsAt || null,
  };
}

/** Текущий активный spreadId (если расклад уже начат в этой вкладке) */
export function getActiveSpreadId() {
  return sessionStorage.getItem(ID_KEY);
}

/** Очистить флаги активного расклада */
export function clearActiveSpreadFlag() {
  sessionStorage.removeItem(ACTIVE_KEY);
  sessionStorage.removeItem(ID_KEY);
  sessionStorage.removeItem(TS_KEY);
}

/**
 * Старт расклада: списывает попытку ТОЛЬКО один раз на вкладку,
 * возвращает { ok, remaining, spreadId, cached? }.
 * Можно передать meta: { spread_code, deck_id, lang, ... }.
 */
export async function startSpreadOncePerSession(meta = {}) {
  const existingId = getActiveSpreadId();
  if (sessionStorage.getItem(ACTIVE_KEY) === "1" && existingId) {
    const q = await getDeckQuota();
    return { ok: true, remaining: q?.remaining ?? 0, spreadId: existingId, cached: true };
  }

  const res = await api.authFetch(PATHS.start, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "virtual-deck", ts: Date.now(), ...meta }),
  });

  if (res.status === 401 || res.status === 403) throw new Error("unauthorized");
  if (!res.ok) {
    let msg = "Failed to start spread";
    try {
      const j = await res.json();
      msg = (j && (j.detail || j.error)) || msg;
    } catch {}
    throw new Error(msg);
  }

  const data = await res.json();
  const p = data?.primary || null;
  const remaining = p ? Number(p.remaining ?? 0) : 0;
  const spreadId =
    data?.spread_id || data?.spreadId || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));

  sessionStorage.setItem(ACTIVE_KEY, "1");
  sessionStorage.setItem(ID_KEY, String(spreadId));
  sessionStorage.setItem(TS_KEY, String(Date.now()));

  return { ok: true, remaining, spreadId };
}

/** Совместимость со старым именем */
export function resetSessionFlag() {
  clearActiveSpreadFlag();
}

/**
 * Завершить расклад (аналитика/логирование). Флаги активного расклада очищаются всегда.
 * payload может включать: { reason, spread_code, deck_id, lang, cards_drawn, ... }
 */
export async function completeSpread(spreadId, payload = {}) {
  if (!spreadId) return { ok: false, error: "no-spread-id" };
  try {
    const res = await api.authFetch(PATHS.complete, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spread_id: spreadId, ...payload }),
    });
    clearActiveSpreadFlag();
    if (!res.ok) return { ok: false, status: res.status };
    return { ok: true };
  } catch (e) {
    clearActiveSpreadFlag();
    return { ok: false, error: e?.message || "complete-failed" };
  }
}

/**
 * Завершение «на выгрузке» — без ожидания ответа.
 * Пытается использовать navigator.sendBeacon, иначе fetch с keepalive.
 */
export function completeSpreadBeacon(spreadId, payload = {}) {
  if (!spreadId) return false;
  try {
    const body = JSON.stringify({ spread_id: spreadId, ...payload, _beacon: true });
    const blob = new Blob([body], { type: "application/json" });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const ok = navigator.sendBeacon(PATHS.complete, blob);
      clearActiveSpreadFlag();
      return ok;
    }

    // Фолбэк: best-effort
    fetch(PATHS.complete, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "include",
    }).catch(() => {});
  } catch {}
  clearActiveSpreadFlag();
  return true;
}
