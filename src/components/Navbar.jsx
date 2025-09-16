// src/components/Navbar.jsx
import React from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Sparkles, LogIn, UserPlus, User, Settings as SettingsIcon, LogOut, ChevronDown } from "lucide-react";
import { THEMES, THEME_LABELS, applyTheme } from "../theme/themes";
import { api } from "../api/client";
import { useAuthStatus } from "../auth/useAuthStatus";
import { getAvatarUrl } from "../api/profile";

export default function Navbar() {
  const { isAuthed, profile } = useAuthStatus();
  const [theme, setTheme] = React.useState(
    localStorage.getItem("arcana_theme") || (import.meta.env.VITE_DEFAULT_THEME || "theme-mindful-05")
  );
  const [menuOpen, setMenuOpen] = React.useState(false);

  // отдельные стейты для двух дропдаунов
  const [predOpen, setPredOpen] = React.useState(false);
  const [analysisOpen, setAnalysisOpen] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // рефы для аккаунт-меню
  const btnRef = React.useRef(null);
  const menuRef = React.useRef(null);

  // рефы для "Предсказания"
  const predBtnRef = React.useRef(null);
  const predMenuRef = React.useRef(null);

  // рефы для "Анализ"
  const analysisBtnRef = React.useRef(null);
  const analysisMenuRef = React.useRef(null);

  React.useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("arcana_theme", theme);
  }, [theme]);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (menuOpen) {
        if (
          menuRef.current && !menuRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)
        ) setMenuOpen(false);
      }
      if (predOpen) {
        if (
          predMenuRef.current && !predMenuRef.current.contains(e.target) &&
          predBtnRef.current && !predBtnRef.current.contains(e.target)
        ) setPredOpen(false);
      }
      if (analysisOpen) {
        if (
          analysisMenuRef.current && !analysisMenuRef.current.contains(e.target) &&
          analysisBtnRef.current && !analysisBtnRef.current.contains(e.target)
        ) setAnalysisOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setPredOpen(false);
        setAnalysisOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen, predOpen, analysisOpen]);

  const doLogout = () => {
    api.logout();
    setMenuOpen(false);
    navigate("/");
  };

  const closePred = () => setPredOpen(false);
  const closeAnalysis = () => setAnalysisOpen(false);

  const displayName =
    profile?.username ||
    (profile?.email ? profile.email.split("@")[0] : null) ||
    "Аккаунт";
  const avatarUrl = getAvatarUrl(profile?.profile?.avatar) || profile?.profile?.avatarUrl;

  // ---- Подсветка активных групп ----
  const predRoutes = [
    "/predictions/tarot",
    "/predictions/matrix",
    "/predictions/palm",
    "/predictions/coffee",
    "/predictions/horoscope",
  ];
  const analysisRoutes = [
    "/analysis/face",
    "/analysis/handwriting",
    "/analysis/dreams",
  ];
  const isGroupActive = (routes) => routes.some((p) => location.pathname.startsWith(p));
  const predGroupActive = isGroupActive(predRoutes);
  const analysisGroupActive = isGroupActive(analysisRoutes);

  // классы для обычных ссылок и пунктов меню
  const navLinkClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;
  const menuItemClass = ({ isActive }) => `menu-item ${isActive ? "active" : ""}`;

  return (
    <header className="sticky top-0 z-40 navbar">
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between">
      <Link
        to="/"
        className="flex items-center gap-3 font-bold text-lg"
        style={{ color: "var(--text)" }}
      >
        <div
          className="h-8 w-8 rounded-xl grid place-items-center shadow-lg"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--primary))" }}
        >
          <img
            src="/img/logo.svg"
            alt="Tarion"
            className="h-5 w-5 object-contain"
          />
        </div>
        Tarion
      </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {/* --- Предсказания --- */}
          <div className="relative">
            <button
              ref={predBtnRef}
              onClick={() => {
                setPredOpen((o) => {
                  const next = !o;
                  if (next) setAnalysisOpen(false);
                  return next;
                });
              }}
              className={`nav-link inline-flex items-center gap-1 ${predGroupActive ? "active" : ""}`}
              aria-haspopup="menu"
              aria-expanded={predOpen}
            >
              Предсказания <ChevronDown size={14} className="opacity-70" />
            </button>

            {predOpen && (
              <div ref={predMenuRef} role="menu" className="menu-popover min-w-[240px]">
                <NavLink to="/predictions/tarot" role="menuitem" className={menuItemClass} onClick={closePred}>
                  Таро (ИИ)
                </NavLink>
                <NavLink to="/predictions/matrix" role="menuitem" className={menuItemClass} onClick={closePred}>
                  Матрица
                </NavLink>
                <NavLink to="/predictions/palm" role="menuitem" className={menuItemClass} onClick={closePred}>
                  Предсказания по ладони (ИИ)
                </NavLink>
                <NavLink to="/predictions/coffee" role="menuitem" className={menuItemClass} onClick={closePred}>
                  Предсказания по кофе (ИИ)
                </NavLink>
                <NavLink to="/predictions/horoscope" role="menuitem" className={menuItemClass} onClick={closePred}>
                  Гороскопы (ИИ)
                </NavLink>
              </div>
            )}
          </div>

          {/* --- Анализ --- */}
          <div className="relative">
            <button
              ref={analysisBtnRef}
              onClick={() => {
                setAnalysisOpen((o) => {
                  const next = !o;
                  if (next) setPredOpen(false);
                  return next;
                });
              }}
              className={`nav-link inline-flex items-center gap-1 ${analysisGroupActive ? "active" : ""}`}
              aria-haspopup="menu"
              aria-expanded={analysisOpen}
            >
              Анализ <ChevronDown size={14} className="opacity-70" />
            </button>

            {analysisOpen && (
              <div ref={analysisMenuRef} role="menu" className="menu-popover min-w-[240px]">
                <NavLink to="/analysis/face" role="menuitem" className={menuItemClass} onClick={closeAnalysis}>
                  Облик (анализ лица)
                </NavLink>
                <NavLink to="/analysis/handwriting" role="menuitem" className={menuItemClass} onClick={closeAnalysis}>
                  Почерк (анализ письма)
                </NavLink>
                <NavLink to="/analysis/dreams" role="menuitem" className={menuItemClass} onClick={closeAnalysis}>
                  ИИ-толкование сна
                </NavLink>
                <NavLink to="/analysis/compatibility" role="menuitem" className={menuItemClass} onClick={closeAnalysis}>
                  Анализ совместимости (ИИ)
                </NavLink>
              </div>
            )}
          </div>

          <NavLink to="/experts" className={navLinkClass}>Специалисты</NavLink>
          <NavLink to="/forum" className={navLinkClass}>Форум</NavLink>
          <NavLink to="/pricing" className={navLinkClass}>Подписка</NavLink>
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
                {THEME_LABELS[t] || t}
              </option>
            ))}
          </select>

          {!isAuthed ? (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `btn-ghost inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold ${isActive ? "active" : ""}`
                }
              >
                <LogIn size={18} /> Войти
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold ${isActive ? "active" : ""}`
                }
              >
                <UserPlus size={18} /> Регистрация
              </NavLink>
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
                  <NavLink to="/cabinet" role="menuitem" className={menuItemClass} onClick={() => setMenuOpen(false)}>
                    <User size={16} /> Личный кабинет
                  </NavLink>
                  <NavLink to="/settings" role="menuitem" className={menuItemClass} onClick={() => setMenuOpen(false)}>
                    <SettingsIcon size={16} /> Настройки
                  </NavLink>
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
