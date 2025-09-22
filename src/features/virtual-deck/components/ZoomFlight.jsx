// src/features/virtual-deck/components/ZoomFlight.jsx
import React from "react";
import { createPortal } from "react-dom";
import ImageWithFallback from "./ImageWithFallback";
import { frontCandidates } from "../utils/assetPaths";
import { RATIO } from "../constants";

const DESK_MAX_W = 380;       // десктопный оверлей
const DESK_FRACTION = 0.88;

const MOB_MAX_W = 300;        // МЕНЬШЕ, чем было
const MOB_FRACTION = 0.70;    // МЕНЬШЕ, чем было

// Гарантируем единый portal-root в <body>
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

// Невидимая цель (якорь) в центре текущего viewport'а, строго размера карточки в оверлее
function ensureZoomAnchor() {
  const id = "vd-zoom-anchor";
  let el = document.getElementById(id);

  const vw = window.visualViewport?.width ?? window.innerWidth;
  const isMobile = vw <= 640;

  const maxW = isMobile ? MOB_MAX_W : DESK_MAX_W;
  const frac = isMobile ? MOB_FRACTION : DESK_FRACTION;

  const w = Math.min(vw * frac, maxW);
  const h = w * RATIO;

  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.top = "50%";
    el.style.transform = "translate(-50%, -50%)";
    el.style.pointerEvents = "none";
    el.style.zIndex = "-1";
    el.style.visibility = "hidden";
    document.body.appendChild(el);
  }

  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  return el;
}

export default function ZoomFlight({
  fromEl,
  r = 0,
  card,
  reversed = false,
  deckCfg,
  duration = 420,
  onDone,
}) {
  const portalRoot = ensurePortalRoot();
  const ghostRef = React.useRef(null);

  React.useEffect(() => {
    if (!fromEl || !card) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      onDone?.();
      return;
    }

    const start = fromEl.getBoundingClientRect();

    // цель полёта: реальный rect якоря в центре viewport
    const anchor = ensureZoomAnchor();
    const end = anchor.getBoundingClientRect();

    const ghost = ghostRef.current;
    if (!ghost) return;

    // стартовые габариты "призрачной" карты
    ghost.style.left = `${start.left}px`;
    ghost.style.top = `${start.top}px`;
    ghost.style.width = `${start.width}px`;
    ghost.style.height = `${start.height}px`;

    const sx = end.width / start.width;
    const sy = end.height / start.height;
    const dx = end.left - start.left;
    const dy = end.top - start.top;

    const vh = window.visualViewport?.height ?? window.innerHeight;
    const arcLift = Math.min(vh * 0.08, 80);

    const keyframes = [
      {
        transform: `translate(0px, 0px) scale(1) rotate(0deg)`,
        boxShadow: "0 6px 14px rgba(0,0,0,0.20)",
        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0))",
        offset: 0,
      },
      {
        transform: `translate(${dx * 0.6}px, ${dy * 0.4 - arcLift}px) scale(${sx * 1.06}, ${sy * 1.06}) rotate(${-(r * 0.6)}deg)`,
        boxShadow: "0 14px 30px rgba(0,0,0,0.32)",
        filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.25))",
        offset: 0.6,
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy}) rotate(${-r}deg)`,
        boxShadow: "0 18px 44px rgba(0,0,0,0.38)",
        filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.35))",
        offset: 1,
      },
    ];

    const anim = ghost.animate(keyframes, {
      duration,
      easing: "cubic-bezier(.18,.8,.2,1)",
      fill: "forwards",
    });

    // затемняющая подложка под полёт (в body)
    const underlay = document.createElement("div");
    underlay.style.position = "fixed";
    underlay.style.inset = "0";
    underlay.style.background = "rgba(0,0,0,0)";
    underlay.style.backdropFilter = "blur(0px)";
    underlay.style.zIndex = 2147483600; // гарантированно поверх
    underlay.style.pointerEvents = "none";
    document.body.appendChild(underlay);

    const u = underlay.animate(
      [
        { background: "rgba(0,0,0,0)", backdropFilter: "blur(0px)" },
        { background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" },
      ],
      { duration: Math.min(260, duration - 120), fill: "forwards", easing: "ease-out" }
    );

    anim.onfinish = () => {
      try { u.cancel(); } catch {}
      if (underlay.parentNode) document.body.removeChild(underlay);
      onDone?.();
    };

    return () => {
      try { anim.cancel(); } catch {}
      try { u.cancel(); } catch {}
      if (underlay.parentNode) document.body.removeChild(underlay);
    };
  }, [fromEl, r, card, reversed, deckCfg, duration, onDone]);

  if (!fromEl || !card) return null;

  // через портал, чтобы fixed всегда был к viewport
  return createPortal(
    <div
      ref={ghostRef}
      className="fixed will-change-transform"
      style={{ left: 0, top: 0, width: 0, height: 0, transformOrigin: "top left", zIndex: 2147483600 }}
    >
      <div
        className="w-full h-full rounded-2xl overflow-hidden ring-1 ring-white/20"
        style={{
          width: "100%",
          height: "100%",
          transform: `rotate(${r}deg)`,
          transformOrigin: "top left",
          willChange: "transform",
          boxShadow: "0 6px 14px rgba(0,0,0,0.20)",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        <ImageWithFallback
          candidates={frontCandidates(deckCfg, card)}
          alt=""
          className="w-full h-full object-cover"
          style={{ transform: `rotate(${reversed ? 180 : 0}deg)` }}
          draggable={false}
        />
      </div>
    </div>,
    portalRoot
  );
}
