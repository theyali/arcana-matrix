import React from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { applyTheme } from "../theme/themes";
import { api } from "../api/client";
import { useAuthStatus } from "../auth/useAuthStatus";
import { getAvatarUrl } from "../api/profile";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitch from "../components/ThemeSwitch";
import { useTranslation } from "react-i18next";
import { LogIn, UserPlus, User, Settings as SettingsIcon, LogOut, ChevronDown, Menu } from "lucide-react";
import MobileDrawer from "./MobileDrawer";

export default function Navbar() {
  const { isAuthed, profile } = useAuthStatus();
  const [theme, setTheme] = React.useState(
    localStorage.getItem("arcana_theme") || (import.meta.env.VITE_DEFAULT_THEME || "theme-mindful-05")
  );
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [predOpen, setPredOpen] = React.useState(false);
  const [analysisOpen, setAnalysisOpen] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("common");

  const LANGS = ["en", "ru", "uk"];
  const rawParts = location.pathname.split("/").filter(Boolean);
  const currentLng = rawParts[0] && LANGS.includes(rawParts[0]) ? rawParts[0] : "en";
  const langPrefix = currentLng !== "en" ? `/${currentLng}` : "";
  const withLang = (path) => `${langPrefix}${path}`;

  const btnRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const predBtnRef = React.useRef(null);
  const predMenuRef = React.useRef(null);
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
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen, predOpen, analysisOpen]);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const doLogout = () => {
    api.logout();
    setMenuOpen(false);
    navigate(langPrefix || "/");
  };

  const closePred = () => setPredOpen(false);
  const closeAnalysis = () => setAnalysisOpen(false);

  const displayName =
    profile?.username ||
    (profile?.email ? profile.email.split("@")[0] : null) ||
    t("nav.cabinet", "Кабинет");

  const avatarUrl = getAvatarUrl(profile?.profile?.avatar) || profile?.profile?.avatarUrl;

  const predRoutes = [
    "/predictions/tarot",
    "/predictions/matrix",
    "/predictions/palm",
    "/predictions/coffee",
    "/predictions/horoscope",
  ].map(withLang);

  const analysisRoutes = [
    "/analysis/face",
    "/analysis/handwriting",
    "/analysis/dreams",
  ].map(withLang);

  const isGroupActive = (routes) => routes.some((p) => location.pathname.startsWith(p));
  const predGroupActive = isGroupActive(predRoutes);
  const analysisGroupActive = isGroupActive(analysisRoutes);

  const navLinkClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;
  const menuItemClass = ({ isActive }) => `menu-item ${isActive ? "active" : ""}`;

  return (
    <header className="sticky top-0 z-40 navbar">
      <div className="container mx-auto px-4 max-w-8xl h-16 flex items-center justify-between">
        <Link
          to={langPrefix || "/"}
          className="flex items-center gap-3 font-bold text-lg"
          style={{ color: "var(--text)" }}
        >
          <div
            className="h-8 w-8 rounded-xl grid place-items-center shadow-lg"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--primary))" }}
          >
            <img
              src="/img/logo.svg"
              alt={t("brand", "Tarion")}
              className="h-5 w-5 object-contain"
            />
          </div>
          {t("brand", "Tarion")}
        </Link>

        {/* desktop nav */}
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
              {t("nav.predictions", "Предсказания")} <ChevronDown size={14} className="opacity-70" />
            </button>

            {predOpen && (
              <div ref={predMenuRef} role="menu" className="menu-popover min-w-[240px]">
                <NavLink to={withLang("/predictions/tarot")} role="menuitem" className={menuItemClass} onClick={closePred}>
                  {t("nav.tarot_ai", "Таро")}
                </NavLink>
                <NavLink to={withLang("/predictions/matrix")} role="menuitem" className={menuItemClass} onClick={closePred}>
                  {t("nav.matrix_ai", "Матрица")}
                </NavLink>
                <NavLink to={withLang("/predictions/palm")} role="menuitem" className={menuItemClass} onClick={closePred}>
                  {t("nav.palm_ai", "Предсказания по ладони (ИИ)")}
                </NavLink>
                <NavLink to={withLang("/predictions/coffee")} role="menuitem" className={menuItemClass} onClick={closePred}>
                  {t("nav.coffee_ai", "Предсказания по кофе (ИИ)")}
                </NavLink>
                <NavLink to={withLang("/predictions/horoscope")} role="menuitem" className={menuItemClass} onClick={closePred}>
                  {t("nav.horoscopes_ai", "Гороскопы (ИИ)")}
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
              {t("nav.analysis", "Анализ")} <ChevronDown size={14} className="opacity-70" />
            </button>

            {analysisOpen && (
              <div ref={analysisMenuRef} role="menu" className="menu-popover min-w-[240px]">
                <NavLink to={withLang("/analysis/face")} role="menuitem" className={menuItemClass} onClick={closeAnalysis}>
                  {t("nav.face", "Облик (анализ лица)")}
                </NavLink>
                <NavLink to={withLang("/analysis/handwriting")} role="menuitem" className={menuItemClass} onClick={closeAnalysis}>
                  {t("nav.handwriting", "Почерк (анализ письма)")}
                </NavLink>
                <NavLink to={withLang("/analysis/dreams")} role="menuitem" className={menuItemClass} onClick={closeAnalysis}>
                  {t("nav.dreams", "ИИ-толкование сна")}
                </NavLink>
                <NavLink to={withLang("/analysis/compatibility")} role="menuitem" className={menuItemClass} onClick={closeAnalysis}>
                  {t("nav.compatibility", "Анализ совместимости (ИИ)")}
                </NavLink>
              </div>
            )}
          </div>
          <NavLink to={withLang("/virtual-decks")} className={navLinkClass}>
            {t("nav.virtual_decks", "Колода")}
          </NavLink>

          <NavLink to={withLang("/experts")} className={navLinkClass}>
            {t("nav.experts", "Эксперты")}
          </NavLink>
          <NavLink to={withLang("/forum")} className={navLinkClass}>
            {t("nav.forum", "Форум")}
          </NavLink>
          <NavLink to={withLang("/pricing")} className={navLinkClass}>
            {t("nav.pricing", "Тарифы")}
          </NavLink>
          <a href="#pricing" className="nav-link">{t("nav.tests", "Тесты")}</a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSwitch className="ml-2" />

          {/* Auth кнопки и аккаунт скрыты на мобилке (перенесены в offcanvas) */}
          {!isAuthed ? (
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-xl border border-muted"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          ) : (
            <div className="relative hidden md:block">
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
                  <NavLink to={withLang("/cabinet")} role="menuitem" className={menuItemClass} onClick={() => setMenuOpen(false)}>
                    <User size={16} /> {t("nav.cabinet", "Кабинет")}
                  </NavLink>
                  <NavLink to={withLang("/settings")} role="menuitem" className={menuItemClass} onClick={() => setMenuOpen(false)}>
                    <SettingsIcon size={16} /> {t("nav.settings", "Настройки")}
                  </NavLink>
                  <button role="menuitem" className="menu-item" onClick={doLogout}>
                    <LogOut size={16} /> {t("nav.logout", "Выйти")}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Бургер для авторизованного пользователя — только на мобилке */}
          {isAuthed && (
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-xl border border-muted"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          )}

          {/* Перенесли LanguageSwitcher в дровер, поэтому на мобилке скрыт */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* mobile offcanvas */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        withLang={withLang}
        t={t}
        isAuthed={isAuthed}
        avatarUrl={avatarUrl}
        displayName={displayName}
        doLogout={doLogout}
      />
    </header>
  );
}
