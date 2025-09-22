// src/features/virtual-deck/components/CardZoomOverlay.jsx
import React from "react";
import { createPortal } from "react-dom";
import ImageWithFallback from "./ImageWithFallback";
import { frontCandidates } from "../utils/assetPaths";
import { X } from "lucide-react";

const DESK_MAX_W = 380;
const DESK_FRACTION = 0.88;

const MOB_MAX_W = 300;     // МЕНЬШЕ, чем было
const MOB_FRACTION = 0.50; // МЕНЬШЕ, чем было

function ensurePortalRoot() {
  const id = "vd-portal-root";
  let root = document.getElementById(id);
  if (!root) {
    root = document.createElement("div");
    root.id = id;
    document.body.appendChild(root);
  }
  return root;
}

// best-effort локализация
function lang2() {
  const l =
    (typeof document !== "undefined" && document.documentElement?.lang) ||
    (typeof navigator !== "undefined" && navigator.language) ||
    "en";
  return l.slice(0, 2);
}
const LABELS = {
  en: { reversed: "Reversed", meaning: "Meaning" },
  ru: { reversed: "ПЕРЕВЕРНУТО", meaning: "Значение" },
  uk: { reversed: "ПЕРЕВЕРНУТО", meaning: "Значення" },
};
function tLabel(key) {
  const l = lang2();
  const pack = LABELS[l] || LABELS.en;
  return pack[key];
}
function pickLocalized(obj) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  const l = lang2();
  if (typeof obj[l] === "string") return obj[l];
  for (const k of ["text", "value", "meaning", "desc", "upright", "reversed"]) {
    const v = obj[k];
    if (!v) continue;
    if (typeof v === "string") return v;
    if (typeof v?.[l] === "string") return v[l];
  }
  for (const k of Object.keys(obj)) {
    if (k.endsWith(`_${l}`) && typeof obj[k] === "string") return obj[k];
  }
  return obj.en || obj.text || obj.value || obj.meaning || obj.desc || "";
}
function meaningOf(card, reversed) {
  const uprightCandidates = [
    card?.meaning,
    card?.upright,
    card?.desc,
    card?.description,
    card?.text,
    card?.keywords,
  ];
  const reversedCandidates = [
    card?.meaningRev,
    card?.reversed,
    card?.reversed_meaning,
    card?.rev,
    card?.inverted,
  ];
  const u = uprightCandidates.map(pickLocalized).find((s) => s && s.trim());
  const r = reversedCandidates.map(pickLocalized).find((s) => s && s.trim());
  return reversed ? r || u || "" : u || r || "";
}

export default function CardZoomOverlay({ open, card, reversed, deckCfg, nameOf, onClose }) {
  const [mounted, setMounted] = React.useState(false);
  const [vw, setVw] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const isMobile = vw <= 640;
  const portalRoot = ensurePortalRoot();

  React.useEffect(() => {
    const on = () => setVw(window.innerWidth);
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("orientationchange", on);
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setMounted(true);

    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      setMounted(false);
    };
  }, [open, onClose]);

  if (!open || !card) return null;

  const candidates = frontCandidates(deckCfg, card);
  const widthStyle = {
    width: isMobile
      ? `min(${Math.round(MOB_FRACTION * 100)}vw, ${MOB_MAX_W}px)`
      : `min(${Math.round(DESK_FRACTION * 100)}vw, ${DESK_MAX_W}px)`,
  };
  const meaningText = meaningOf(card, reversed);

  // ===== Desktop (как было) =====
  if (!isMobile) {
    return createPortal(
      <div
        className="fixed inset-0 flex items-center justify-center"
        aria-modal="true"
        role="dialog"
        style={{ zIndex: 2147483640 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_50%,transparent,rgba(0,0,0,0.5))]" />

        <button
          onClick={onClose}
          className="fixed rounded-xl bg-white/10 hover:bg-white/20 text-white p-2 shadow-lg backdrop-blur-sm"
          aria-label="Close"
          style={{
            top: "calc(env(safe-area-inset-top, 0px) + 16px)",
            right: "calc(env(safe-area-inset-right, 0px) + 16px)",
            zIndex: 2147483641,
          }}
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className={`relative transition-all duration-300 ease-out ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          style={widthStyle}
        >
          <figure className="pointer-events-auto select-none relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20">
              <ImageWithFallback
                candidates={candidates}
                alt={nameOf(card)}
                className="w-full h-auto block"
                style={{
                  transform: `rotate(${reversed ? 180 : 0}deg)`,
                  transformOrigin: "center center",
                }}
                draggable={false}
              />
            </div>

            <figcaption className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+12px)] text-center text-white/90 w-max max-w-[min(88vw,380px)]">
              <div className="text-base font-semibold">{nameOf(card)}</div>
              {reversed ? (
                <div className="text-[10px] uppercase tracking-wide text-amber-200/90 mt-0.5">
                  {tLabel("reversed")}
                </div>
              ) : null}
              {meaningText ? (
                <div className="mt-2 text-sm opacity-90 max-w-prose whitespace-pre-wrap">
                  {meaningText}
                </div>
              ) : null}
            </figcaption>
          </figure>
        </div>
      </div>,
      portalRoot
    );
  }

  // ===== Mobile modal: скролл + меньшая карта =====
  return createPortal(
    <div
      className="fixed inset-0"
      aria-modal="true"
      role="dialog"
      style={{ zIndex: 2147483640, background: "rgba(2,6,23,0.96)" }}
    >
      {/* ВНУТРЕННЯЯ СКРОЛЛ-ОБЛАСТЬ */}
      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full flex flex-col">
          {/* Шапка со sticky-кнопкой закрытия */}
          <div
            className="sticky top-0 z-[1] flex items-center justify-end px-3 py-3"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)", background: "rgba(2,6,23,0.96)" }}
          >
            <button
              onClick={onClose}
              className="rounded-xl bg-white/10 hover:bg-white/20 text-white p-2 shadow-lg backdrop-blur-sm"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Карточка сверху (уменьшенная) */}
          <div className="flex items-start justify-center px-4">
            <div
              className={`transition-all duration-300 ease-out ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              }`}
              style={widthStyle}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20">
                <ImageWithFallback
                  candidates={candidates}
                  alt={nameOf(card)}
                  className="w-full h-auto block"
                  style={{
                    transform: `rotate(${reversed ? 180 : 0}deg)`,
                    transformOrigin: "center center",
                  }}
                  draggable={false}
                />
              </div>
            </div>
          </div>

          {/* Текстовый блок (скроллится вместе со страницей) */}
          <div className="mt-4 px-4 pb-6 text-white">
            <div className="text-center">
              <div className="text-lg font-semibold">{nameOf(card)}</div>
              {reversed ? (
                <div className="text-[10px] uppercase tracking-wide text-amber-200/90 mt-0.5">
                  {tLabel("reversed")}
                </div>
              ) : null}
            </div>

            {meaningText ? (
              <div className="mt-3">
                <div className="text-xs uppercase tracking-wide text-white/70 mb-1">
                  {tLabel("meaning")}
                </div>
                <div className="text-[15px] leading-snug opacity-95 whitespace-pre-wrap">
                  {meaningText}
                </div>
              </div>
            ) : null}

            {/* безопасная нижняя зона */}
            <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
          </div>
        </div>
      </div>
    </div>,
    portalRoot
  );
}
