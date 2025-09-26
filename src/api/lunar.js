// src/api/lunar.js
import { api } from "./client";

function qs(obj = {}) {
  const params = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return params ? `?${params}` : "";
}

const PATHS = {
  day: (dateISO, { tz, lat, lon, refresh } = {}) =>
    `/api/astro/lunar/day/${qs({ date: dateISO, tz, lat, lon, refresh })}`,
  month: (year, month, { tz, lat, lon } = {}) =>
    `/api/astro/lunar/month/${qs({ year, month, tz, lat, lon })}`,
  today: ({ tz, lat, lon } = {}) =>
    `/api/astro/lunar/today/${qs({ tz, lat, lon })}`,
};

async function readJsonOrThrow(res, fallback) {
  if (res.ok) return res.json();
  try {
    const data = await res.json();
    const msg =
      typeof data?.detail === "string"
        ? data.detail
        : (Object.values(data || {}).flat?.().join(" ") || fallback);
    throw new Error(msg || fallback);
  } catch {
    throw new Error(`${fallback} (HTTP ${res.status})`);
  }
}

export async function getLunarDay(dateISO, { tz, lat, lon, refresh } = {}) {
  const res = await api.authFetch(PATHS.day(dateISO, { tz, lat, lon, refresh }));
  return readJsonOrThrow(res, "Failed to load lunar day");
}

export async function getLunarMonth(date, { tz, lat, lon } = {}) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1; // 1-12
  const res = await api.authFetch(PATHS.month(y, m, { tz, lat, lon }));
  return readJsonOrThrow(res, "Failed to load lunar month");
}

export async function getLunarToday({ tz, lat, lon } = {}) {
  const res = await api.authFetch(PATHS.today({ tz, lat, lon }));
  return readJsonOrThrow(res, "Failed to load today's lunar data");
}
