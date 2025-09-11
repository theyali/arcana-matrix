// src/auth/useAuthStatus.js
import * as React from "react";

const ACCESS_KEY  = "amx_access";
const PROFILE_KEY = "amx_profile";

function readProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuthStatus() {
  const [isAuthed, setIsAuthed] = React.useState(!!localStorage.getItem(ACCESS_KEY));
  const [profile, setProfile] = React.useState(readProfile());

  React.useEffect(() => {
    const onStorage = (e) => {
      if (e.key === ACCESS_KEY)  setIsAuthed(!!e.newValue);
      if (e.key === PROFILE_KEY) setProfile(readProfile());
    };

    const onLogin       = () => setIsAuthed(!!localStorage.getItem(ACCESS_KEY));
    const onRefresh     = () => setIsAuthed(!!localStorage.getItem(ACCESS_KEY));
    const onLogout      = () => { setIsAuthed(false); setProfile(null); };
    const onUserUpdated = (e) => setProfile(e.detail?.user ?? readProfile());

    window.addEventListener("storage", onStorage);
    window.addEventListener("amx:auth-login", onLogin);
    window.addEventListener("amx:auth-refresh", onRefresh);
    window.addEventListener("amx:auth-logout", onLogout);
    window.addEventListener("amx:user-updated", onUserUpdated);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("amx:auth-login", onLogin);
      window.removeEventListener("amx:auth-refresh", onRefresh);
      window.removeEventListener("amx:auth-logout", onLogout);
      window.removeEventListener("amx:user-updated", onUserUpdated);
    };
  }, []);

  return { isAuthed, profile };
}
