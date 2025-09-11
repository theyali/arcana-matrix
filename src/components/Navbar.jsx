// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, LogIn, UserPlus, User, Settings as SettingsIcon, LogOut, ChevronDown } from "lucide-react";
import { THEMES, applyTheme } from "../theme/themes";
import { api } from "../api/client";
import { useAuthStatus } from "../auth/useAuthStatus";
import { getAvatarUrl } from "../api/profile";

export default function Navbar() {
  const { isAuthed, profile } = useAuthStatus(); // ⚡ только локальный статус/кэш
  const [theme, setTheme] = React.useState(
    localStorage.getItem("arcana_theme") || (import.meta.env.VITE_DEFAULT_THEME || "theme-mindful-03")
  );
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [predOpen, setPredOpen] = React.useState(false);
  const navigate = useNavigate();
  const btnRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const predBtnRef = React.useRef(null);
  const predMenuRef = React.useRef(null);

  React.useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("arcana_theme", theme);
  }, [theme]);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (menuOpen) {
        if (menuRef.current && !menuRef.current.contains(e.target) &&
            btnRef.current && !btnRef.current.contains(e.target)) setMenuOpen(false);
      }
      if (predOpen) {
        if (predMenuRef.current && !predMenuRef.current.contains(e.target) &&
            predBtnRef.current && !predBtnRef.current.contains(e.target)) setPredOpen(false);
      }
    };
    const onEsc = (e) => { if (e.key === "Escape") { setMenuOpen(false); setPredOpen(false); } };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen, predOpen]);

  const doLogout = () => {
    api.logout(); // шлёт amx:auth-logout и чистит кэш
    setMenuOpen(false);
    navigate("/");
  };

  const closePred = () => setPredOpen(false);

  const displayName =
    profile?.username ||
    (profile?.email ? profile.email.split("@")[0] : null) ||
    "Аккаунт";
  const avatarUrl = getAvatarUrl(profile?.profile?.avatar) || profile?.profile?.avatarUrl;

  return (
    <header className="sticky top-0 z-40 navbar">
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 font-bold text-lg" style={{ color: "var(--text)" }}>
          <div
            className="h-8 w-8 rounded-xl grid place-items-center shadow-lg"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--primary))" }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          Tarion
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <div className="relative">
            <button
              ref={predBtnRef}
              onClick={() => setPredOpen((o) => !o)}
              className="nav-link inline-flex items-center gap-1"
              aria-haspopup="menu"
              aria-expanded={predOpen}
            >
              Предсказания <ChevronDown size={14} className="opacity-70" />
            </button>

            {predOpen && (
              <div ref={predMenuRef} role="menu" className="menu-popover min-w-[240px]">
                <Link to="/predictions/tarot" role="menuitem" className="menu-item" onClick={closePred}>
                  Таро (ИИ)
                </Link>
                <Link to="/predictions/matrix" role="menuitem" className="menu-item" onClick={closePred}>
                  Матрица
                </Link>
                <Link to="/predictions/palm" role="menuitem" className="menu-item" onClick={closePred}>
                  Предсказания по ладони (ИИ)
                </Link>
                <Link to="/predictions/coffee" role="menuitem" className="menu-item" onClick={closePred}>
                  Предсказания по кофе (ИИ)
                </Link>
                <Link to="/predictions/horoscope" role="menuitem" className="menu-item" onClick={closePred}>
                  Гороскопы (ИИ)
                </Link>
              </div>
            )}
          </div>

          <Link to="/experts" className="nav-link">Специалисты</Link>
          <Link to="/forum" className="nav-link">Форум</Link>
          <Link to="/pricing" className="nav-link">Подписка</Link>
          <a href="#pricing" className="nav-link">Тесты</a>
        </nav>

        <div className="flex items-center gap-3">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="btn-ghost rounded-2xl px-3 py-2 text-sm"
          >
            {THEMES.map((t) => (
              <option key={t} value={t}>
                {t.replace("theme-", "")}
              </option>
            ))}
          </select>

          {!isAuthed ? (
            <>
              <Link
                to="/login"
                className="btn-ghost inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold"
              >
                <LogIn size={18} /> Войти
              </Link>
              <Link
                to="/register"
                className="btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold"
              >
                <UserPlus size={18} /> Регистрация
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                ref={btnRef}
                onClick={() => setMenuOpen((o) => !o)}
                className="btn-ghost inline-flex items-center gap-2 rounded-2xl px-3 py-2"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <div
                    className="h-6 w-6 rounded-full"
                    style={{ background: "linear-gradient(135deg,var(--primary),var(--accent))" }}
                  />
                )}
                <span className="text-sm opacity-90" style={{ color: "var(--text)" }}>
                  {displayName}
                </span>
                <ChevronDown size={16} className="opacity-70" />
              </button>

              {menuOpen && (
                <div ref={menuRef} role="menu" className="menu-popover">
                  <Link to="/cabinet" role="menuitem" className="menu-item" onClick={() => setMenuOpen(false)}>
                    <User size={16} /> Личный кабинет
                  </Link>
                  <Link to="/settings" role="menuitem" className="menu-item" onClick={() => setMenuOpen(false)}>
                    <SettingsIcon size={16} /> Настройки
                  </Link>
                  <button role="menuitem" className="menu-item" onClick={doLogout}>
                    <LogOut size={16} /> Выход
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
