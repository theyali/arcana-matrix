// src/features/virtual-deck/utils/assetPaths.js
/* ================== Пути к ассетам карт ================== */
function stripExt(path) {
  const i = path.lastIndexOf(".");
  return i === -1 ? path : path.slice(0, i);
}

export function frontCandidates(deckCfg, card) {
  const basePath = `${deckCfg.baseUrl}/${card.slug}`;
  return [`${basePath}.webp`, `${basePath}.png`, `${basePath}.jpg`];
}

export function backCandidates(deckCfg) {
  const basePath = stripExt(deckCfg.back || `${deckCfg.baseUrl}/_back`);
  return [`${basePath}.webp`, `${basePath}.png`, `${basePath}.jpg`];
}
