// src/features/virtual-deck/components/DeckPile.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import ImageWithFallback from "./ImageWithFallback";
import { backCandidates } from "../utils/assetPaths";

export default function DeckPile({
  deckCfg, deckW, deckH, deckVisualCount, stackLen, animating, onTake, deckRef
}){
  const { t } = useTranslation();

  const canClick = stackLen > 0 && !animating;
  const title = canClick ? t("vd.deck.take_title_available") : t("vd.deck.take_title_unavailable");

  return (
    <div className="absolute left-3 bottom-3 flex flex-col items-start gap-2 select-none">
      <div
        onClick={onTake}
        ref={deckRef}
        className={`relative cursor-pointer transition-transform ${canClick ? "hover:-translate-y-1" : "opacity-50 cursor-not-allowed"}`}
        style={{ width: deckW, height: deckH }}
        aria-label={t("vd.deck.take_aria")}
        title={title}
      >
        {Array.from({ length: Math.min(deckVisualCount, 24) }).map((_, i) => {
          const z = i, dy = i * 2, dx = (i % 3) - 1, rot = (i % 5) - 2;
          return (
            <div
              key={i}
              className="absolute left-0 bottom-0 w-full h-full"
              style={{ transform: `translate(${dx}px, -${dy}px) rotate(${rot}deg)`, zIndex: z }}
            >
              <ImageWithFallback
                candidates={backCandidates(deckCfg)}
                alt="deck"
                className="w-full h-full rounded-xl border border-white/10 shadow-[0_3px_0px_rgba(0,0,0,0.45)]"
                draggable={false}
              />
            </div>
          );
        })}
        <div className="absolute inset-0 rounded-xl ring-1 ring-white/10 pointer-events-none transition-opacity opacity-0 hover:opacity-100" />
      </div>
      <div className="text-xs opacity-70">
        {t("vd.deck.in_deck", { n: stackLen })}
      </div>
    </div>
  );
}
