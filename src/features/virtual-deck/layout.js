// src/features/virtual-deck/layout.js
import { RATIO } from "./constants";

/* ================== Рабочая область ================== */
export function computePlayRect(boardRect, _bottomPad, _spreadId, _deckW) {
  const x0 = 0;
  const y0 = 0; // не учитываем панель, стол уже даёт внутренние паддинги
  const w = boardRect.width;
  const innerPadBottom = 40; // небольшой запас снизу
  const h = Math.max(220, boardRect.height - y0 - innerPadBottom);
  return { x0, y0, w, h };
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Резервируем место под боковые панели внутри стола. */
function reserveRails(play, vw) {
  // правый сайдбар: w-[min(32vw,260px)] + right-3(~12px)
  const rightW = Math.min(vw * 0.32, 260) + 12;

  // левый тулбар (как в TopBar): deckW ≈ baseCardW * (130/170), + левый пад 16 и небольшой буфер
  const baseCardW = Math.min(vw * 0.42, 170);
  const leftBarW = Math.round(baseCardW * (130 / 170));
  const leftW = 16 + leftBarW + 8;

  // на узких экранах не режем сильно область
  const needRight = vw >= 920 && play.w - rightW >= 320;
  const needLeft  = vw >= 920 && play.w - (needRight ? rightW : 0) - leftW >= 320;

  let x0 = play.x0;
  let w  = play.w;
  if (needLeft)  { x0 += leftW;  w -= leftW; }
  if (needRight) {               w -= rightW; }

  return { ...play, x0, w };
}

/** Подобрать размер карты так, чтобы влезли cols×rows и вся сетка была отцентрована */
export function fitCardSize(play, cols, rows, gap, capW = Infinity) {
  const maxW = (play.w - gap * (cols - 1)) / cols;
  const maxH = (play.h - gap * (rows - 1)) / rows;
  const w = Math.min(maxW, maxH / RATIO, capW);
  const h = w * RATIO;

  const layoutW = cols * w + (cols - 1) * gap;
  const layoutH = rows * h + (rows - 1) * gap;
  const startX = play.x0 + (play.w - layoutW) / 2;
  const startY = play.y0 + (play.h - layoutH) / 2;

  return { w, h, startX, startY };
}

/** Главный генератор слотов под выбранный расклад */
export function makeLayout(spreadId, play, vw) {
  const gapBase = Math.max(12, Math.min(22, Math.round(play.w * 0.018)));
  const capSingle = Math.min(vw * 0.42, 170);
  const capRow = capSingle;
  const capDense = 190;
  const capDensest = 185;

  /* ---------- 1 карта ---------- */
  if (spreadId === "single") {
    const { w, h, startX, startY } = fitCardSize(play, 1, 1, gapBase, capSingle);
    return { cardW: w, cardH: h, slots: [{ left: startX, top: startY, r: 0 }] };
  }

  /* ---------- 3 карты в ряд ---------- */
  if (spreadId === "three") {
    const { w, h, startX, startY } = fitCardSize(play, 3, 1, gapBase, capRow);
    return {
      cardW: w,
      cardH: h,
      slots: Array.from({ length: 3 }, (_, i) => ({
        left: startX + i * (w + gapBase),
        top: startY,
        r: 0,
      })),
    };
  }

  /* ---------- «Мои субличности» (4 в ряд, сдвиг от сайдбаров) ---------- */
  if (spreadId === "subpersonalities") {
    const playR = reserveRails(play, vw);
    const gapRow = Math.max(12, Math.min(22, Math.round(playR.w * 0.018)));
    const { w, h, startX, startY } = fitCardSize(playR, 4, 1, gapRow, capRow);
    return {
      cardW: w,
      cardH: h,
      slots: Array.from({ length: 4 }, (_, i) => ({
        left: startX + i * (w + gapRow),
        top: startY,
        r: 0,
      })),
    };
  }

  /* ---------- Партнёрский (Анализ отношений) — 7 карт как на скрине ----------

     Сетка 5 колонок × 3 ряда внутри области, обрезанной под боковые панели:

         c0      c1      c2      c3      c4
      r0         2       1       3
      r1     4                           5
      r2                6       7

     6 и 7 — под центральной картой, между колонками (c1,c2) и (c2,c3).
  */
  if (spreadId === "partnership") {
    const playR = reserveRails(play, vw);

    const gapX = clamp(Math.round(playR.w * 0.045), 18, 120);
    const gapY = clamp(Math.round(playR.h * 0.055), 18, 120);

    // размер карты для 5×3
    const w = Math.min(
      (playR.w - 4 * gapX) / 5,
      ((playR.h - 2 * gapY) / 3) / RATIO,
      capDense
    );
    const h = w * RATIO;

    const totalW = 5 * w + 4 * gapX;
    const totalH = 3 * h + 2 * gapY;
    const startX = playR.x0 + (playR.w - totalW) / 2;
    const startY = playR.y0 + (playR.h - totalH) / 2;

    const X = (i) => startX + i * (w + gapX);
    const y0 = startY;
    const y1 = y0 + h + gapY;
    const y2 = y1 + h + gapY;

    const x6 = (X(1) + X(2)) / 2; // между c1 и c2
    const x7 = (X(2) + X(3)) / 2; // между c2 и c3

    const slots = [
      { left: X(2), top: y0, r: 0 }, // 1 — центр сверху
      { left: X(1), top: y0, r: 0 }, // 2 — слева от центра
      { left: X(3), top: y0, r: 0 }, // 3 — справа от центра
      { left: X(0), top: y1, r: 0 }, // 4 — левый средний
      { left: X(4), top: y1, r: 0 }, // 5 — правый средний
      { left: x6,   top: y2, r: 0 }, // 6 — низ, левее центра
      { left: x7,   top: y2, r: 0 }, // 7 — низ, правее центра
    ];
    return { cardW: w, cardH: h, slots };
  }

  /* ---------- Алхимик (как на скрине): 6 карт, 3 колонки × 4 ряда ---------- */
  if (spreadId === "alchemist") {
    const gapX = clamp(Math.round(play.w * 0.06), 24, 140);
    const gapY = clamp(Math.round(play.h * 0.055), 22, 120);

    const maxW_byWidth  = (play.w - 2 * gapX) / 3;
    const maxW_byHeight = ((play.h - 3 * gapY) / 4) / RATIO;
    const w = Math.min(maxW_byWidth, maxW_byHeight, capDense);
    const h = w * RATIO;

    const totalW = 3 * w + 2 * gapX;
    const totalH = 4 * h + 3 * gapY;
    const startX = play.x0 + (play.w - totalW) / 2;
    const startY = play.y0 + (play.h - totalH) / 2;

    const xL = startX;
    const xC = xL + w + gapX;
    const xR = xC + w + gapX;

    const yT  = startY;
    const yMT = yT + h + gapY;   // middle-top
    const yMB = yMT + h + gapY;  // middle-bottom
    const yB  = yMB + h + gapY;

    const slots = [
      { left: xC, top: yT,  r: 0 }, // 1 — центр сверху
      { left: xL, top: yMB, r: 0 }, // 2 — левый нижний из средних
      { left: xR, top: yMB, r: 0 }, // 3 — правый нижний из средних
      { left: xL, top: yMT, r: 0 }, // 4 — левый верхний из средних
      { left: xR, top: yMT, r: 0 }, // 5 — правый верхний из средних
      { left: xC, top: yB,  r: 0 }, // 6 — центр снизу
    ];
    return { cardW: w, cardH: h, slots };
  }

  /* ---------- Произвольный на 9 карт (бывший «alchemist») ---------- */
  if (spreadId === "grid9") {
    const gapA = Math.max(10, Math.min(18, Math.round(play.w * 0.014)));
    const { w, h, startX, startY } = fitCardSize(play, 3, 3, gapA, capDensest);
    const slots = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        slots.push({ left: startX + c * (w + gapA), top: startY + r * (h + gapA), r: 0 });
      }
    }
    return { cardW: w, cardH: h, slots };
  }

  /* ---------- Кельтский крест ---------- */
  if (spreadId === "celtic") {
    const gapY       = clamp(Math.round(play.h * 0.028), 18, 64);
    const gapCenterX = clamp(Math.round(play.w * 0.045), 24, 180);
    const gapPillarX = Math.max(Math.round(gapCenterX * 2.6), gapCenterX + 32);

    const cols = 4, rows = 4;

    const maxW_byWidth  = (play.w - (2 * gapCenterX + gapPillarX)) / cols;
    const maxW_byHeight = ((play.h - (rows - 1) * gapY) / rows) / RATIO;
    const w = Math.min(maxW_byWidth, maxW_byHeight);
    const h = w * RATIO;

    const totalW = 4 * w + 2 * gapCenterX + gapPillarX;
    const totalH = 4 * h + 3 * gapY;
    const startX = play.x0 + (play.w - totalW) / 2;
    const startY = play.y0 + (play.h - totalH) / 2;

    const x0 = startX;                       // 5
    const x1 = x0 + w + gapCenterX;          // 1..4
    const x2 = x1 + w + gapCenterX;          // 6
    const x3 = x2 + w + gapPillarX;          // 7..10

    const y0 = startY;                       // верх (3,10)
    const y1 = y0 + h + gapY;                // центр (1,2,5,6,9)
    const y2 = y1 + h + gapY;                // низ (4,8)
    const y3 = y2 + h + gapY;                // дно столба (7)

    const labelPadWanted = clamp(Math.round(h * 0.22), 16, 56);
    const extraTop    = Math.min(labelPadWanted, Math.max(6, gapY - 6));
    const extraBottom = Math.min(labelPadWanted, Math.max(6, gapY - 6));
    const desiredShift = Math.round(h * 0.12);
    const centerOffset = Math.min(
      desiredShift,
      Math.max(0, gapY - Math.max(extraTop, extraBottom))
    );

    const y0c = y0 + extraTop + centerOffset;
    const y1c = y1 + centerOffset;
    const y2c = y2 + extraBottom + centerOffset;

    const slots = [
      { left: x1, top: y1c, r: 0  }, // 1 — центр
      { left: x1, top: y1c, r: 90 }, // 2 — поперёк 1
      { left: x1, top: y0c, r: 0  }, // 3 — верх
      { left: x1, top: y2c, r: 0  }, // 4 — низ
      { left: x0, top: y1,  r: 0  }, // 5 — лево
      { left: x2, top: y1,  r: 0  }, // 6 — право
      { left: x3, top: y3,  r: 0  }, // 7
      { left: x3, top: y2,  r: 0  }, // 8
      { left: x3, top: y1,  r: 0  }, // 9
      { left: x3, top: y0,  r: 0  }, // 10
    ];
    return { cardW: w, cardH: h, slots };
  }

  /* ---------- Fallback ---------- */
  const { w, h, startX, startY } = fitCardSize(play, 1, 1, gapBase, capSingle);
  return { cardW: w, cardH: h, slots: [{ left: startX, top: startY, r: 0 }] };
}
