// src/features/virtual-deck/components/ZoomFlightBack.jsx
import React from "react";
import ImageWithFallback from "./ImageWithFallback";
import { frontCandidates } from "../utils/assetPaths";
import { RATIO } from "../constants";

/**
 * Обратный полёт: из центра (размер как в Overlay) к исходному слоту.
 *
 * props:
 *  - toEl: HTMLElement — контейнер слота (уже повернут на r)
 *  - r: number (обычно 0 или 90) — угол поворота контейнера
 *  - card, reversed, deckCfg — как в ZoomFlight
 *  - duration: number(ms)
 *  - overlayWidthVW: доля ширины экрана (как в CardZoomOverlay) — по умолчанию 0.88
 *  - overlayMaxW: максимум ширины (как в CardZoomOverlay) — по умолчанию 380
 *  - onDone: ()=>void
 */
export default function ZoomFlightBack({
  toEl,
  r = 0,
  card,
  reversed = false,
  deckCfg,
  duration = 420,
  overlayWidthVW = 0.88,
  overlayMaxW = 380,
  onDone,
}) {
  const ghostRef = React.useRef(null);

  React.useEffect(() => {
    if (!toEl || !card) {
      onDone?.();
      return;
    }

    // Уважение prefers-reduced-motion
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      onDone?.();
      return;
    }

    // Конечная геометрия (слот)
    const end = toEl.getBoundingClientRect();

    // Старт — центр экрана (как в Overlay)
    const startW = Math.min(window.innerWidth * overlayWidthVW, overlayMaxW);
    const startH = startW * RATIO;
    const startLeft = (window.innerWidth - startW) / 2;
    const startTop = (window.innerHeight - startH) / 2;

    // Подготовка «призрака»
    const ghost = ghostRef.current;
    if (!ghost) {
      onDone?.();
      return;
    }
    ghost.style.left = `${startLeft}px`;
    ghost.style.top = `${startTop}px`;
    ghost.style.width = `${startW}px`;
    ghost.style.height = `${startH}px`;

    const sx = end.width / startW;
    const sy = end.height / startH;
    const dx = end.left - startLeft;
    const dy = end.top - startTop;

    // Дуговая траектория (в начале немного вверх, затем к цели)
    const arcLift = Math.min(window.innerHeight * 0.08, 80);

    const keyframes = [
      {
        transform: `translate(0px, 0px) scale(1) rotate(0deg)`,
        boxShadow: "0 18px 44px rgba(0,0,0,0.38)",
        filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.35))",
        offset: 0,
      },
      {
        // середина: легкий undershoot масштаба и выход на дугу
        transform: `translate(${dx * 0.4}px, ${dy * 0.6 - arcLift}px) scale(${sx * 0.96}, ${sy * 0.96}) rotate(${r * 0.4}deg)`,
        boxShadow: "0 12px 26px rgba(0,0,0,0.28)",
        filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.22))",
        offset: 0.6,
      },
      {
        // финиш: совпасть со слотом и принять его поворот
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy}) rotate(${r}deg)`,
        boxShadow: "0 6px 14px rgba(0,0,0,0.20)",
        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.10))",
        offset: 1,
      },
    ];

    const anim = ghost.animate(keyframes, {
      duration,
      easing: "cubic-bezier(.18,.8,.2,1)",
      fill: "forwards",
    });

    // Подложка: начинаем с затемнённого состояния и уводим в ноль
    const underlay = document.createElement("div");
    underlay.style.position = "fixed";
    underlay.style.inset = "0";
    underlay.style.background = "rgba(0,0,0,0.45)";
    underlay.style.backdropFilter = "blur(2px)";
    underlay.style.zIndex = 998;
    underlay.style.pointerEvents = "none";
    document.body.appendChild(underlay);

    const u = underlay.animate(
      [
        { background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" },
        { background: "rgba(0,0,0,0)", backdropFilter: "blur(0px)" },
      ],
      { duration: Math.min(260, duration - 120), fill: "forwards", easing: "ease-in" }
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
  }, [toEl, r, card, reversed, deckCfg, duration, overlayWidthVW, overlayMaxW, onDone]);

  if (!toEl || !card) return null;

  return (
    <div
      ref={ghostRef}
      className="fixed z-[999] will-change-transform"
      style={{ left: 0, top: 0, width: 0, height: 0, transformOrigin: "top left" }}
    >
      {/* Внутренняя обёртка повернута как слот примет в конце; внешняя анимация добивает до -r */}
      <div
        className="w-full h-full rounded-2xl overflow-hidden ring-1 ring-white/20"
        style={{
          width: "100%",
          height: "100%",
          transform: `rotate(0deg)`, // стартуем вертикально (как в центре)
          transformOrigin: "top left",
          willChange: "transform",
          boxShadow: "0 18px 44px rgba(0,0,0,0.38)",
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
    </div>
  );
}
