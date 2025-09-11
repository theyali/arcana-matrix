// src/auth/useAuth.js
import * as React from "react";
import { api } from "../api/client";

const ACCESS_KEY = "amx_access";

export function useAuth() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const hasToken = React.useMemo(() => Boolean(localStorage.getItem(ACCESS_KEY)), []);
  // isAuthed не экспортируем — Navbar сам решает через navLoading/navAuthed
  // Но оставить можно, если где-то используется:
  const isAuthed = !!user || (loading && hasToken);

  const refresh = React.useCallback(async () => {
    // refresh вызываем только если токен реально есть
    if (!localStorage.getItem(ACCESS_KEY)) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const me = await api.me(); // при 401 внутри почистит токены и вернёт null
      setUser(me);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = React.useCallback(() => {
    api.logout();
    setUser(null);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await api.me();
        if (alive) setUser(me);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  React.useEffect(() => {
    const onStorage = (e) => {
      if (e.key === ACCESS_KEY) {
        const nowHas = Boolean(e.newValue);
        if (!nowHas) {
          setUser(null);
          setLoading(false);
        } else {
          refresh();
        }
      }
    };

    const onLogin = () => { refresh(); };
    const onRefresh = () => { if (!user) refresh(); };
    const onLogout = () => { setUser(null); setLoading(false); };

    window.addEventListener("storage", onStorage);
    window.addEventListener("amx:auth-login", onLogin);
    window.addEventListener("amx:auth-refresh", onRefresh);
    window.addEventListener("amx:auth-logout", onLogout);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("amx:auth-login", onLogin);
      window.removeEventListener("amx:auth-refresh", onRefresh);
      window.removeEventListener("amx:auth-logout", onLogout);
    };
  }, [refresh, user]);

  React.useEffect(() => {
    let cooldown = false;
    const revalidate = () => {
      if (cooldown) return;
      cooldown = true;
      setTimeout(() => (cooldown = false), 800);
      if (localStorage.getItem(ACCESS_KEY)) {
        if (!loading) refresh();
      } else {
        setUser(null);
        setLoading(false);
      }
    };
    const onFocus = () => revalidate();
    const onVisibility = () => { if (document.visibilityState === "visible") revalidate(); };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh, loading]);

  return { user, loading, isAuthed, refresh, logout };
}
