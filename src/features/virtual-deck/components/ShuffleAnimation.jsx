// src/features/virtual-deck/components/ShuffleAnimation.jsx
import React from "react";
import ImageWithFallback from "./ImageWithFallback";
import { backCandidates } from "../utils/assetPaths";
import "./shuffleAnimation.css";

/**
 * Lightweight overlay that plays a short "shuffle" vignette above the deck.
 * Keeps everything presentational (aria-hidden) so screen readers remain quiet.
 */
export default function ShuffleAnimation({ active, deckCfg, deckW, deckH }) {
  const candidates = React.useMemo(() => backCandidates(deckCfg), [deckCfg]);

  if (!active) return null;

  const cardW = Math.max(typeof deckW === "number" && deckW > 0 ? deckW : 160, 96);
  const cardH = Math.max(typeof deckH === "number" && deckH > 0 ? deckH : 230, 140);

  const style = {
    width: cardW,
    height: cardH,
    "--shuffle-card-w": `${cardW}px`,
    "--shuffle-card-h": `${cardH}px`,
  };

  return (
    <div className="shuffle-animation" style={style} aria-hidden="true">
      <div className="shuffle-animation__glow" />
      <div className="shuffle-animation__trail" />
      <div className="shuffle-animation__card shuffle-animation__card--left">
        <ImageWithFallback
          candidates={candidates}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      </div>
      <div className="shuffle-animation__card shuffle-animation__card--right">
        <ImageWithFallback
          candidates={candidates}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      </div>
      <div className="shuffle-animation__card shuffle-animation__card--top">
        <ImageWithFallback
          candidates={candidates}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      </div>
    </div>
  );
}
