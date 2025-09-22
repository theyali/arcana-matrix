/* ================== Конфиг и константы ================== */
export const base = import.meta.env.BASE_URL || "/";

export const DECKS = {
  light: {
    id: "light",
    label: "Светлая",
    baseUrl: `${base}img/tarot/light`,
    back: `${base}img/tarot/light/_back.png`,
  },
  dark: {
    id: "dark",
    label: "Тёмная",
    baseUrl: `${base}img/tarot/dark`,
    back: `${base}img/tarot/dark/_back.png`,
  },
};

export const RATIO = 270 / 170; // H/W
export const TOPBAR_OFFSET = 72; // место под верхнюю панель на столе
