// src/features/virtual-deck/components/DebugPlayRect.jsx
import React from "react";

export default function DebugPlayRect({ play }) {
  if (!play?.w || !play?.h) return null;
  return (
    <div
      aria-hidden
      className="absolute rounded-xl"
      style={{
        left: `${play.x0}px`,
        top: `${play.y0}px`,
        width: `${play.w}px`,
        height: `${play.h}px`,
        background:
          "repeating-linear-gradient(45deg, rgba(0,200,255,0.08), rgba(0,200,255,0.08) 10px, rgba(0,200,255,0.12) 10px, rgba(0,200,255,0.12) 20px)",
        outline: "2px dashed rgba(0,200,255,0.6)",
        boxShadow: "inset 0 0 0 1px rgba(0,200,255,0.3)",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <div
        className="absolute right-2 top-2 text-[11px]"
        style={{
          color: "rgba(0,200,255,0.9)",
          background: "rgba(0,0,0,0.45)",
          padding: "2px 6px",
          borderRadius: 8,
          backdropFilter: "blur(2px)",
        }}
      >
        playRect: {Math.round(play.w)}×{Math.round(play.h)} px
      </div>
    </div>
  );
}
