// src/features/virtual-deck/components/FlyingCard.jsx
import React from "react";
import ImageWithFallback from "./ImageWithFallback";

/* Летящая карта (анимируем контейнер) */
export default function FlyingCard({
  startRect,
  endRect,
  candidates,
  duration = 450,
  rotateDeg = 0,
  onDone,
}) {
  const [go, setGo] = React.useState(false);

  const style = React.useMemo(() => {
    if (!startRect || !endRect) return {};

    // снапим к целым, чтобы избежать субпиксельной мыльности
    const sX = Math.round(startRect.x);
    const sY = Math.round(startRect.y);
    const sW = Math.round(startRect.w);
    const sH = Math.round(startRect.h);
    const eX = Math.round(endRect.x);
    const eY = Math.round(endRect.y);
    const eW = Math.round(endRect.w);
    const eH = Math.round(endRect.h);

    const dx = eX - sX;
    const dy = eY - sY;
    const s = eW / sW;

    return {
      position: "absolute",
      left: `${sX}px`,
      top: `${sY}px`,
      width: `${sW}px`,
      height: `${sH}px`,
      transformOrigin: "top left",
      transform: go
        ? `translate(${dx}px, ${dy}px) scale(${s}) rotate(${rotateDeg}deg)`
        : "translate(0,0) scale(1) rotate(0deg)",
      transition: `transform ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
      willChange: "transform",
      pointerEvents: "none",
      zIndex: 50,
    };
  }, [startRect, endRect, go, rotateDeg, duration]);

  React.useEffect(() => {
    const r = requestAnimationFrame(() => setGo(true));
    return () => cancelAnimationFrame(r);
  }, []);

  return (
    <div
      style={style}
      className="shadow-2xl"
      onTransitionEnd={(e) => e.propertyName === "transform" && onDone?.()}
    >
      <ImageWithFallback
        candidates={candidates}
        alt="card"
        className="w-full h-full rounded-xl border border-white/10"
      />
    </div>
  );
}
