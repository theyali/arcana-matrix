import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Check } from "lucide-react";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "uk", label: "UK" }
];

function CircleFlag({ code, size = 16 }) {
  const safe = ["en", "ru", "uk"].includes(code) ? code : "en";
  const base = import.meta.env.BASE_URL || "/";
  const src = `${base}img/lang/${safe}.svg`;
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={safe.toUpperCase()}
      style={{ display: "block" }}
      onError={(e) => {
        if (!e.currentTarget.dataset.fallback) {
          e.currentTarget.dataset.fallback = "1";
          e.currentTarget.src = `${base}img/lang/en.svg`;
        }
      }}
    />
  );
}

/**
 * LanguageSwitcher
 * - Работает и на десктопе, и внутри offcanvas
 * - onChanged() вызывается после смены языка (удобно, чтобы закрыть дровер)
 */
export default function LanguageSwitcher({ className = "", onChanged }) {
  const { i18n } = useTranslation();

  const raw = i18n.resolvedLanguage || i18n.language || "en";
  const baseLang = String(raw).split("-")[0];
  const cur = ["en", "ru", "uk"].includes(baseLang) ? baseLang : "en";

  const navigate = useNavigate();
  const location = useLocation();
  const detailsRef = React.useRef(null);

  const SUPPORTED = LANGS.map((l) => l.code);

  React.useEffect(() => {
    if (!i18n.language) i18n.changeLanguage("en");
  }, [i18n]);

  function switchTo(code) {
    if (code === cur) {
      detailsRef.current?.removeAttribute("open");
      return;
    }
    i18n.changeLanguage(code);

    // ru/uk — добавляем префикс, en — убираем
    const parts = location.pathname.split("/").filter(Boolean);
    if (code === "en") {
      if (SUPPORTED.includes(parts[0])) parts.shift();
    } else {
      if (SUPPORTED.includes(parts[0])) parts[0] = code;
      else parts.unshift(code);
    }

    const nextPath = "/" + parts.join("/");
    const next = (nextPath === "//" ? "/" : nextPath) + location.search + location.hash;
    navigate(next, { replace: true });

    detailsRef.current?.removeAttribute("open");
    onChanged?.(); // оповестим родителя (например, закрыть дровер)
  }

  const currentLang = LANGS.find((l) => l.code === cur) || LANGS[0];

  return (
    <details ref={detailsRef} className={`relative ${className}`}>
      <summary
        className="inline-flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-muted cursor-pointer select-none hover:bg-muted/40"
        style={{ color: "var(--text)" }}
        aria-label="Change language"
      >
        <span className="inline-flex items-center gap-2">
          <span className="inline-grid place-items-center w-5 h-5 rounded-full overflow-hidden">
            <CircleFlag code={currentLang.code} />
          </span>
          <span className="text-sm font-semibold">{currentLang.label}</span>
        </span>
        <ChevronDown size={16} className="opacity-70 ml-auto" aria-hidden="true" />
      </summary>

      <ul
        className="absolute right-0 mt-2 w-44 p-1 rounded-xl border border-muted shadow-xl z-50 backdrop-blur-sm menu-popover bg-[color-mix(in_srgb,var(--text)_4%,transparent)]"
        role="menu"
        aria-label="Select language"
      >
        {LANGS.map((l) => (
          <li key={l.code}>
            <button
              onClick={() => switchTo(l.code)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-muted/40 text-sm"
              role="menuitem"
              aria-pressed={cur === l.code}
              style={{ color: "var(--text)" }}
            >
              <span className="inline-flex items-center gap-2">
                <span className="inline-grid place-items-center w-5 h-5 rounded-full overflow-hidden">
                  <CircleFlag code={l.code} />
                </span>
                <span className="font-medium">{l.label}</span>
              </span>
              {cur === l.code ? <Check size={16} className="opacity-80" /> : null}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
