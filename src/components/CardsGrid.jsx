import React from 'react';
import useThemeName from '../hooks/useThemeName';

const IMG_VERSION = '20250919';
const THEMES = { NIGHT: 'theme-mindful-05', DAY: 'theme-mindful-04' };

const preloadCache = new Map();
function preload(url){
  if (!url || preloadCache.has(url)) return Promise.resolve();
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { preloadCache.set(url, true); res(); };
    img.onerror = rej;
    img.src = url;
  });
}

function useOnScreen(ref){
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return visible;
}

function buildWebp(base, mode, n){
  return `${base}img/cards/thumbs/card-${mode}-${n}.webp?v=${IMG_VERSION}`;
}

/** Стадиями монтируем элементы, чтобы не декодить всё сразу */
function useStaggeredLimit(total, first = 3, step = 3, gapMs = 70){
  const [limit, setLimit] = React.useState(first);
  React.useEffect(() => {
    let cancelled = false, timer;
    const tick = () => {
      setLimit(l => {
        if (cancelled || l >= total) return l;
        const n = Math.min(total, l + step);
        if (n < total) timer = setTimeout(tick, gapMs);
        return n;
      });
    };
    timer = setTimeout(tick, gapMs);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [total, first, step, gapMs]);
  return limit;
}

function Card({ index, mode, base }){
  const n = index + 1;
  const ref = React.useRef(null);
  const visible = useOnScreen(ref);

  const [shownMode, setShownMode] = React.useState(mode);
  const [overlaySrc, setOverlaySrc] = React.useState(null);
  const [fading, setFading] = React.useState(false);

  const currentSrc = buildWebp(base, shownMode, n);
  const nextSrc    = buildWebp(base, mode, n);

  const prefersReduced = React.useMemo(
    () => typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );

  React.useEffect(() => {
    if (mode === shownMode || !visible) return;
    let cancelled = false;
    preload(nextSrc).then(() => {
      if (cancelled) return;
      if (prefersReduced) { setShownMode(mode); return; }
      setOverlaySrc(nextSrc); setFading(true);
      const t = setTimeout(() => {
        if (cancelled) return;
        setShownMode(mode); setFading(false); setOverlaySrc(null);
      }, 200);
      return () => clearTimeout(t);
    });
    return () => { cancelled = true; };
  }, [mode, nextSrc, shownMode, visible, prefersReduced]);

  return (
    <div ref={ref} className="amx-card relative aspect-[8/14] rounded-2xl border border-muted overflow-hidden">
      <img
        src={currentSrc}
        alt={`card ${shownMode} #${n}`}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        decoding="async"
        draggable={false}
        fetchpriority={index === 0 ? 'high' : undefined}
      />
      {overlaySrc && (
        <img
          src={overlaySrc}
          alt=""
          aria-hidden="true"
          className={`amx-overlay absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${fading ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      )}
    </div>
  );
}

export default function CardsGrid(){
  const theme = useThemeName();
  const mode  = theme === THEMES.NIGHT ? 'dark' : 'light';
  const base  = import.meta.env.BASE_URL || '/';

  const total = 9;
  const limit = useStaggeredLimit(total, 3, 3, 70); // 3 сразу, потом по 3 каждые ~70мс

  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: total }).map((_, i) =>
        i < limit ? (
          <Card key={i} index={i} mode={mode} base={base}/>
        ) : (
          <div key={i} className="amx-card relative aspect-[8/14] rounded-2xl border border-muted overflow-hidden">
            <div className="amx-skel absolute inset-0 w-full h-full" />
          </div>
        )
      )}
    </div>
  );
}
