// src/features/virtual-deck/components/BoardArea.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import ImageWithFallback from "./ImageWithFallback";
import { frontCandidates, backCandidates } from "../utils/assetPaths";

export default function BoardArea({
  slots, cardW, cardH, drawn, cards, deckCfg, deckId, spread,
  selectedId, setSelected, slotRefs, onFlipIndex, onDoubleIndex,
  nameOf, showCardName, clickDelayApi
}){
  const { t } = useTranslation();

  return (
    <div className="relative virtual-deck">
      {slots.map((slot, i) => {
        const placed = drawn[i];
        const card = placed ? cards.find(c=>c.id===placed.id) : null;
        const r = slot.r || 0;
        const frontSrcs = card ? frontCandidates(deckCfg, card) : null;
        return (
          <div key={`slot-${i}-${Math.round(slot.left)}-${Math.round(slot.top)}`}
               ref={(el)=> (slotRefs.current[i]=el)}
               className="absolute"
               style={{ left:slot.left, top:slot.top, width:cardW, height:cardH,
                        zIndex:slot.z ?? i+1, transform:`rotate(${r}deg)`,
                        transformOrigin:"center center", willChange:"transform" }}>
            {placed && selectedId===placed.id && (
              <div className="absolute -inset-1 rounded-[14px] ring-2 ring-amber-400/80 pointer-events-none"/>
            )}
            {placed && card ? (
              <button
                onDoubleClick={(e)=>{ e.stopPropagation(); clickDelayApi.cancel(i); onDoubleIndex(i, r); }}
                onClick={(e)=>{
                  if (spread==="celtic" && i===1 && e.altKey && drawn[0]) {
                    onFlipIndex(0); setSelected(drawn[0].id); return;
                  }
                  clickDelayApi.schedule(i, ()=>{ onFlipIndex(i); setSelected(card.id); });
                }}
                className="group [perspective:1000px] [--dur:300ms] w-full h-full"
                title={t("vd.board.zoom_title", { name: nameOf(card) })}
              >
                <div className={`relative w-full h-full transition-transform duration-[var(--dur)] [transform-style:preserve-3d] ${placed.faceUp?"[transform:rotateY(180deg)]":""}`}>
                  <ImageWithFallback candidates={backCandidates(deckCfg)} alt="back"
                    className="absolute inset-0 w-full h-full rounded-xl border border-white/10 [backface-visibility:hidden]" draggable={false}/>
                  <ImageWithFallback candidates={frontSrcs} alt={nameOf(card)}
                    className="absolute inset-0 w-full h-full rounded-xl border border-amber-500/40 shadow-xl [backface-visibility:hidden]"
                    style={{ transform:`rotateY(180deg) rotate(${placed.reversed?180:0}deg)` }} draggable={false}/>
                </div>
                {showCardName && (
                  <div className="card-name text-center text-sm opacity-80 mobile-d-none">
                    {placed.faceUp ? nameOf(card) : t("vd.board.click_to_flip")}
                    {placed.faceUp && placed.reversed && <span className="ml-2 text-amber-300/80 uppercase text-xs">↑↓</span>}
                  </div>
                )}
              </button>
            ) : <div className="w-full h-full opacity-0 pointer-events-none" />}
          </div>
        );
      })}
    </div>
  );
}
