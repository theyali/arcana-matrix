// src/features/virtual-deck/hooks/useDeckDims.js
import React from "react";
import { RATIO } from "../constants";

/* ================== Размеры колоды (снизу) ================== */
export default function useDeckDims() {
  const [vw, setVw] = React.useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  React.useEffect(() => {
    const on = () => setVw(window.innerWidth);
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("orientationchange", on);
    };
  }, []);

  // базовый размер "карты" для расчётов
  const baseCardW = Math.min(vw * 0.42, 170);
  const baseCardH = Math.round(baseCardW * RATIO);

  // мобильный пресет для стопки
  const MOBILE_MAX_VW = 640;     // примерно tailwind 'sm'
  const MOBILE_DECK_W = 59;
  const MOBILE_DECK_H = 82;

  // размеры стопки (колоды) снизу
  let deckW = Math.round(baseCardW * (130 / 170));
  let deckH = Math.round(baseCardH * (210 / 270));

  if (vw <= MOBILE_MAX_VW) {
    deckW = MOBILE_DECK_W;
    deckH = MOBILE_DECK_H;
  }

  const boardBottomPad = deckH + 32;

  return { vw, deckW, deckH, boardBottomPad };
}
