import { useMemo } from "react";
export default function useReadingItems(drawn, cards, nameOf, tPick, lng){
  return useMemo(() =>
    drawn.map((d, idx) => {
      const card = cards.find((c)=>c.id===d.id);
      if(!card) return null;
      return {
        index: idx+1, id: d.id, name: nameOf(card),
        faceUp: d.faceUp, reversed: d.reversed,
        meaning: d.faceUp ? (d.reversed ? tPick(card.reversed_meaning) : tPick(card.meaning)) : null,
      };
    }).filter(Boolean),
  [drawn, cards, lng]);
}
