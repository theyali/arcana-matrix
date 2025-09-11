// src/api/profile.js
import { api } from "./client";

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
    const fields = {};
    const messages = [];
    if (data && typeof data === "object") {
      for (const [k, v] of Object.entries(data)) {
        if (!v) continue;
        if (Array.isArray(v)) {
          const msg = v.filter(x => typeof x === "string").join(" ");
          if (msg) { fields[k] = msg; messages.push(msg); }
        } else if (typeof v === "string") {
          fields[k] = v; messages.push(v);
        } else if (typeof v === "object") {
          const flat = Object.values(v).flat().filter(x => typeof x === "string");
          if (flat.length) { const msg = flat.join(" "); fields[k] = msg; messages.push(msg); }
        }
      }
    }
    if (messages.length) return { detail: messages.join(" "), fields };
  } catch {}
  return { detail: fallback };
}

export function getAvatarUrl(avatar) {
  if (!avatar) return "";
  if (typeof avatar !== "string") return "";
  if (/^https?:\/\//i.test(avatar)) return avatar;
  const base = (api.BASE_URL || "").replace(/\/+$/, "");
  const path = avatar.replace(/^\/+/, "");
  return `${base}/${path}`;
}

export function buildDisplayName(u) {
  if (!u) return "пользователь";
  return (
    u.first_name?.trim() ||
    u.username?.trim() ||
    (u.email && String(u.email).includes("@") ? String(u.email).split("@")[0] : "пользователь")
  );
}

export function getPlanName(u) {
  const p = u?.plan;
  return p?.name || p?.slug || "Free";
}

export async function getProfile() {
  const u = await api.me();
  if (!u) return null;
  const avatar = getAvatarUrl(u?.profile?.avatar);
  return {
    ...u,
    name: buildDisplayName(u),
    profile: {
      ...u.profile,
      avatarUrl: avatar,
    },
  };
}

export async function updateProfile({ first_name, last_name, bio, role, avatar } = {}) {
  const hasFile = avatar instanceof Blob || avatar instanceof File;
  let res;
  if (hasFile) {
    const fd = new FormData();
    if (first_name !== undefined) fd.append("first_name", first_name ?? "");
    if (last_name !== undefined)  fd.append("last_name", last_name ?? "");
    if (bio !== undefined)        fd.append("bio", bio ?? "");
    if (role !== undefined)       fd.append("role", role ?? "");
    fd.append("avatar", avatar);
    res = await api.authFetch(`/api/auth/me/`, { method: "PATCH", body: fd });
  } else {
    const payload = {};
    if (first_name !== undefined) payload.first_name = first_name;
    if (last_name !== undefined)  payload.last_name = last_name;
    if (bio !== undefined)        payload.bio = bio;
    if (role !== undefined)       payload.role = role;
    res = await api.authFetch(`/api/auth/me/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  if (!res.ok) {
    let raw = null;
    try { raw = await res.json(); } catch {}
    throw normalizeError(raw, "Не удалось сохранить профиль");
  }
  const user = await res.json();
  // обновим локальный кэш и пошлём событие
  api.cacheProfile(user);
  return {
    ...user,
    name: buildDisplayName(user),
    profile: {
      ...user.profile,
      avatarUrl: getAvatarUrl(user?.profile?.avatar),
    }
  };
}
