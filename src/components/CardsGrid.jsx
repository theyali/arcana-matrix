// src/components/CardsGrid.jsx
import React from 'react';
import useThemeName from '../hooks/useThemeName';

const IMG_VERSION = '20250919';
const THEMES = {
  NIGHT: 'theme-mindful-05', // dark
  DAY:   'theme-mindful-04', // light
};

const preloadCache = new Map();
function preload(src) {
  if (!src || preloadCache.has(src)) return Promise.resolve();
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { preloadCache.set(src, true); res(); };
    img.onerror = rej;
    img.src = src;
  });
}

function useOnScreen(ref) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return visible;
}

function buildPng(base, mode, n) {
  return `${base}cards/card-${mode}-${n}.png?v=${IMG_VERSION}`;
}
// если хочешь вернуть webp-ветку — добавь buildWebp() и <picture> аналогично

function Card({ index, mode, base }) {
  const n = index + 1;
  const ref = React.useRef(null);
  const visible = useOnScreen(ref);

  // что показано сейчас
  const [shownMode, setShownMode] = React.useState(mode);
  const [fading, setFading] = React.useState(false);

  const currentSrc = buildPng(base, shownMode, n);
  const nextSrc    = buildPng(base, mode, n);

  // уменьшаем движение по запросу пользователя
  const prefersReduced = React.useMemo(
    () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // при смене темы: плавно перейти только когда карточка на экране и новое изображение загружено
  React.useEffect(() => {
    if (mode === shownMode || !visible) return;

    let cancelled = false;
    preload(nextSrc).then(() => {
      if (cancelled) return;
      if (prefersReduced) { // мгновенная замена без анимации
        setShownMode(mode);
        return;
      }
      setFading(true);
      // короткий фейд (180–220ms)
      const t = setTimeout(() => {
        setShownMode(mode);
        setFading(false);
      }, 200);
      return () => clearTimeout(t);
    });

    return () => { cancelled = true; };
  }, [mode, nextSrc, shownMode, visible, prefersReduced]);

  return (
    <div
      ref={ref}
      className="relative aspect-[8/14] rounded-2xl border border-muted overflow-hidden"
      style={{ background: 'color-mix(in srgb, var(--text) 4%, transparent)' }}
    >
      {/* Нижний слой — текущее изображение */}
      <img
        src={currentSrc}
        alt={`card ${shownMode} #${n}`}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      {/* Верхний слой — будущий кадр, проявляем при фейде */}
      <img
        src={nextSrc}
        alt="" aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 will-change-opacity ${fading ? 'opacity-100' : 'opacity-0'}`}
        loading="eager" // но реальный запрос произойдет только после preload()
        decoding="async"
        draggable={false}
      />
    </div>
  );
}

export default function CardsGrid() {
  const theme = useThemeName();
  const mode  = theme === THEMES.NIGHT ? 'dark' : 'light';
  const base  = import.meta.env.BASE_URL || '/';

  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} index={i} mode={mode} base={base} />
      ))}
    </div>
  );
}
