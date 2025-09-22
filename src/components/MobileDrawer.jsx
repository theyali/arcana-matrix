import React from "react";
import { NavLink } from "react-router-dom";
import {
  X, ChevronDown, LogIn, UserPlus, User, Settings as SettingsIcon, LogOut,
  Home, BookOpen, Grid3x3, Hand, Coffee, Sparkles, Brain, Smile, PenLine,
  Moon, HeartHandshake, Layers, Users, MessageSquare, CreditCard, Globe,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function MobileDrawer({
  open,
  onClose,
  withLang,
  t,
  isAuthed,
  avatarUrl,
  displayName,
  doLogout,
}) {
  const [predOpen, setPredOpen] = React.useState(false);
  const [analysisOpen, setAnalysisOpen] = React.useState(false);

  // Esc для закрытия
  React.useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // ЛОК скролла страницы, скроллим только дровер
  React.useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlPad = html.style.paddingRight;

    if (open) {
      // компенсация полосы прокрутки на десктопе
      const scrollbar = window.innerWidth - html.clientWidth;
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`;
    }
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.paddingRight = prevHtmlPad;
    };
  }, [open]);

  const item = (to, icon, label, props = {}) => (
    <NavLink
      to={withLang(to)}
      onClick={onClose}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10"
      style={{ color: "var(--text)" }}
      {...props}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );

  const subItem = (to, icon, label) => (
    <NavLink
      to={withLang(to)}
      onClick={onClose}
      className="flex items-center gap-2 px-6 py-2 rounded-lg hover:bg-white/10"
      style={{ color: "var(--text)" }}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );

  const I = {
    home:        <Home size={16} className="opacity-80" />,
    tarot:       <BookOpen size={16} className="opacity-80" />,
    matrix:      <Grid3x3 size={16} className="opacity-80" />,
    palm:        <Hand size={16} className="opacity-80" />,
    coffee:      <Coffee size={16} className="opacity-80" />,
    horoscope:   <Sparkles size={16} className="opacity-80" />,
    analysis:    <Brain size={16} className="opacity-80" />,
    face:        <Smile size={16} className="opacity-80" />,
    handwriting: <PenLine size={16} className="opacity-80" />,
    dreams:      <Moon size={16} className="opacity-80" />,
    compat:      <HeartHandshake size={16} className="opacity-80" />,
    decks:       <Layers size={16} className="opacity-80" />,
    experts:     <Users size={16} className="opacity-80" />,
    forum:       <MessageSquare size={16} className="opacity-80" />,
    pricing:     <CreditCard size={16} className="opacity-80" />,
    tests:       <BookOpen size={16} className="opacity-80" />,
    login:       <LogIn size={18} />,
    register:    <UserPlus size={18} />,
    cabinet:     <User size={16} />,
    settings:    <SettingsIcon size={16} />,
    logout:      <LogOut size={16} />,
    globe:       <Globe size={16} className="opacity-80" />,
  };

  return (
    <>
      {/* overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity backdrop-blur-sm ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background:
            "radial-gradient(1200px 800px at 70% 10%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 60%), rgba(6,8,12,.65)"
        }}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* panel */}
      <aside
        className={`fixed right-0 top-0 z-[60] w-80 max-w-[90vw] border-l border-muted shadow-2xl rounded-l-2xl overflow-hidden
                    transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"} flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--bg,#0b0b0f) 97%, black 3%), color-mix(in srgb, var(--bg,#0b0b0f) 97%, black 3%))",
          color: "var(--text)",
          height: "100dvh",           // ВСЯ высота экрана (с учётом мобильных адресных строк)
          maxHeight: "100dvh",
          overscrollBehavior: "contain",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* мягкая подсветка */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--accent) 20%, transparent) 0%, transparent 70%)",
            filter: "blur(38px)",
            opacity: 0.7
          }}
        />

        {/* header */}
        <div className="relative flex items-center justify-between p-4 border-b border-muted/80">
          <span className="text-sm font-semibold">{t("nav.menu", "Меню")}</span>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
            <X size={18} />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* scrollable content */}
        <div className="relative p-2 flex-1 overflow-y-auto">
          {item("/", I.home, t("nav.home", "Главная"))}

          {/* Предсказания */}
          <button
            className="w-full mt-1 px-3 py-2 rounded-lg hover:bg-white/10 flex items-center justify-between"
            onClick={() => setPredOpen((v) => !v)}
            aria-expanded={predOpen}
            style={{ color: "var(--text)" }}
          >
            <span className="flex items-center gap-2">
              {I.tarot}
              {t("nav.predictions", "Предсказания")}
            </span>
            <ChevronDown size={16} className={`transition-transform ${predOpen ? "rotate-180" : ""}`} />
          </button>
          <div className={`overflow-hidden transition-[grid-template-rows] grid ${predOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="min-h-0">
              {subItem("/predictions/tarot", I.tarot, t("nav.tarot_ai", "Таро"))}
              {subItem("/predictions/matrix", I.matrix, t("nav.matrix_ai", "Матрица"))}
              {subItem("/predictions/palm", I.palm, t("nav.palm_ai", "Предсказания по ладони (ИИ)"))}
              {subItem("/predictions/coffee", I.coffee, t("nav.coffee_ai", "Предсказания по кофе (ИИ)"))}
              {subItem("/predictions/horoscope", I.horoscope, t("nav.horoscopes_ai", "Гороскопы (ИИ)"))}
            </div>
          </div>

          {/* Анализ */}
          <button
            className="w-full mt-1 px-3 py-2 rounded-lg hover:bg-white/10 flex items-center justify-between"
            onClick={() => setAnalysisOpen((v) => !v)}
            aria-expanded={analysisOpen}
            style={{ color: "var(--text)" }}
          >
            <span className="flex items-center gap-2">
              {I.analysis}
              {t("nav.analysis", "Анализ")}
            </span>
            <ChevronDown size={16} className={`transition-transform ${analysisOpen ? "rotate-180" : ""}`} />
          </button>
          <div className={`overflow-hidden transition-[grid-template-rows] grid ${analysisOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="min-h-0">
              {subItem("/analysis/face", I.face, t("nav.face", "Облик (анализ лица)"))}
              {subItem("/analysis/handwriting", I.handwriting, t("nav.handwriting", "Почерк (анализ письма)"))}
              {subItem("/analysis/dreams", I.dreams, t("nav.dreams", "ИИ-толкование сна"))}
              {subItem("/analysis/compatibility", I.compat, t("nav.compatibility", "Анализ совместимости (ИИ)"))}
            </div>
          </div>

          {item("/virtual-decks", I.decks, t("nav.virtual_decks", "Колода"))}
          {item("/experts", I.experts, t("nav.experts", "Эксперты"))}
          {item("/forum", I.forum, t("nav.forum", "Форум"))}
          {item("/pricing", I.pricing, t("nav.pricing", "Тарифы"))}
          <a
            href="#pricing"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10"
            style={{ color: "var(--text)" }}
          >
            {I.tests}
            <span>{t("nav.tests", "Тесты")}</span>
          </a>

          <div className="mt-4 border-t border-muted pt-3">
            {/* Язык */}
            <div className="flex items-center gap-2 px-3 py-2" style={{ color: "var(--text)" }}>
              {I.globe}
              <span className="text-sm opacity-80">{t("nav.language", "Язык")}</span>
            </div>
            <div className="px-3 pb-2">
              <LanguageSwitcher className="w-full" onChanged={onClose} />
            </div>

            {!isAuthed ? (
              <div className="grid gap-2 px-2">
                <NavLink to={withLang("/login")} onClick={onClose} className="btn-ghost inline-flex items-center gap-2 rounded-2xl px-4 py-3" style={{ color: "var(--text)" }}>
                  {I.login} {t("nav.login", "Войти")}
                </NavLink>
                <NavLink to={withLang("/register")} onClick={onClose} className="btn-primary inline-flex items-center gap-2 rounded-2xl px-4 py-3" style={{ color: "var(--text)" }}>
                  {I.register} {t("nav.register", "Регистрация")}
                </NavLink>
              </div>
            ) : (
              <div className="grid gap-2 px-2" style={{ color: "var(--text)" }}>
                <div className="flex items-center gap-3 px-3 py-2">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full" style={{ background: "linear-gradient(135deg,var(--primary),var(--accent))" }} />
                  )}
                  <div className="text-sm opacity-90">{displayName}</div>
                </div>
                <NavLink to={withLang("/cabinet")} onClick={onClose} className="menu-item inline-flex items-center gap-2">
                  {I.cabinet} {t("nav.cabinet", "Кабинет")}
                </NavLink>
                <NavLink to={withLang("/settings")} onClick={onClose} className="menu-item inline-flex items-center gap-2">
                  {I.settings} {t("nav.settings", "Настройки")}
                </NavLink>
                <button onClick={() => { doLogout(); onClose(); }} className="menu-item inline-flex items-center gap-2">
                  {I.logout} {t("nav.logout", "Выйти")}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
