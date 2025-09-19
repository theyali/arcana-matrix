// src/components/ThemeSwitch.jsx
import React from "react";
import { applyTheme, THEMES } from "../theme/themes";

const NIGHT = "theme-mindful-05"; // Ночная вселенная (дефолт)
const DAY   = "theme-mindful-04"; // Закат и неон

function ThemeIcon({ type, size = 16 }) {
  // type: 'moon' | 'sun' — SVG лежат в public/img/theme/{type}.svg
  const base = import.meta.env.BASE_URL || "/";
  const src = `${base}img/theme/${type}.svg`;
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={type}
      style={{ display: "block" }}
      onError={(e) => {
        // безопасный фолбэк: если нет файла — просто ничего
        if (!e.currentTarget.dataset.fail) {
          e.currentTarget.dataset.fail = "1";
          e.currentTarget.style.visibility = "hidden";
        }
      }}
    />
  );
}

export default function ThemeSwitch({ className = "" }) {
  const getTheme = () => {
    // 1) активная тема на <html>
    const cls = document.documentElement.classList;
    const active = THEMES.find((t) => cls.contains(t));
    if (active) return active;
    // 2) сохранённая
    const saved = localStorage.getItem("arcana_theme");
    if (THEMES.includes(saved)) return saved;
    // 3) дефолт — ночь
    return NIGHT;
  };

  const [theme, setTheme] = React.useState(getTheme);
  const isNight = theme === NIGHT;

  // нормализуем дефолт к ночи один раз
  React.useEffect(() => {
    if (!THEMES.includes(theme)) {
      applyTheme(NIGHT);
      setTheme(NIGHT);
    }
  }, []); // eslint-disable-line

  const toggle = () => {
    const next = isNight ? DAY : NIGHT;
    applyTheme(next);
    setTheme(next);
  };

  // стили трека под темы
  const trackStyle = isNight
    ? {
        background:
          "linear-gradient(180deg, #133f63 0%, #0f0e25 100%)",
        boxShadow:
          "inset 0 2px 6px rgba(0,0,0,.35), 0 8px 22px rgba(13, 12, 34, .35)"
      }
    : {
        background:
          "linear-gradient(180deg, #fde68a 0%, #facc15 100%)",
        boxShadow:
          "inset 0 2px 6px rgba(255,255,255,.35), 0 8px 22px rgba(250, 204, 21, .35)"
      };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!isNight ? true : false}
      onClick={toggle}
      title={isNight ? "Switch to day theme" : "Switch to night theme"}
      className={`relative inline-flex w-[64px] h-[34px] items-center rounded-full border border-muted shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-[background,box-shadow] ${className}`}
      style={trackStyle}
    >
      {/* Декор ночи — звёзды */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <span
          className="absolute w-1 h-1 rounded-full transition-opacity"
          style={{
            left: 26,
            top: 8,
            background: "#fff",
            opacity: isNight ? 0.95 : 0
          }}
        />
        <span
          className="absolute w-[3px] h-[3px] rounded-full transition-opacity"
          style={{
            left: 40,
            top: 16,
            background: "#fff",
            opacity: isNight ? 0.75 : 0,
            transitionDelay: isNight ? "40ms" : "0ms"
          }}
        />
        <span
          className="absolute w-[2px] h-[2px] rounded-full transition-opacity"
          style={{
            left: 48,
            top: 10,
            background: "#fff",
            opacity: isNight ? 0.6 : 0,
            transitionDelay: isNight ? "80ms" : "0ms"
          }}
        />
        {/* Декор дня — лучи */}
        <span
          className="absolute h-[2px] rounded-full transition-opacity"
          style={{
            width: 10,
            left: 18,
            top: 9,
            background: "rgba(255,255,255,.7)",
            transform: "rotate(35deg)",
            opacity: isNight ? 0 : 1
          }}
        />
        <span
          className="absolute h-[2px] rounded-full transition-opacity"
          style={{
            width: 12,
            left: 14,
            top: 20,
            background: "rgba(255,255,255,.6)",
            transform: "rotate(-25deg)",
            opacity: isNight ? 0 : 1
          }}
        />
      </div>

      {/* Бегунок */}
      <div
        className="relative z-10 grid place-items-center w-[28px] h-[28px] rounded-full shadow-md transition-transform"
        style={{
          transform: isNight ? "translateX(3px)" : "translateX(33px)",
          background: isNight ? "#e6e9ef" : "#ffffff"
        }}
        aria-hidden="true"
      >
        {isNight ? (
          <ThemeIcon type="moon" size={100} />
        ) : (
          <ThemeIcon type="sun" size={100} />
        )}
      </div>
    </button>
  );
}
