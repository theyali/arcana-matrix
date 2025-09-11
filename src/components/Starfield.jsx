// src/components/Starfield.jsx
import React from 'react';

function easeInOutSine(t){ return 0.5 - 0.5*Math.cos(Math.PI*t); }
function easeOutCubic(t){ const p=1-Math.max(0,Math.min(1,t)); return 1-p*p*p; }
const rnd = (a,b)=> a + Math.random()*(b-a);
const clamp01 = (x)=> Math.max(0, Math.min(1, x));

export default function Starfield({
  maxStars = 160,
  // главное: абсолютный внутри .app-bg, а не fixed с отрицательным z-index
  className = 'pointer-events-none absolute inset-0 z-0',
  // --- новые настройки комет ---
  enableComets = true,
  maxComets = 2,
  cometMinIntervalMs = 6000,
  cometMaxIntervalMs = 14000,
}) {
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(0);
  const starsRef = React.useRef([]);
  const cometsRef = React.useRef([]);
  const sizeRef = React.useRef({ w: 0, h: 0, dpr: 1 });
  const lastTimeRef = React.useRef(0);
  const nextCometAtRef = React.useRef(0);

  const reduceMotion = React.useMemo(
    () => typeof window !== 'undefined'
      ? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      : false,
    []
  );

  const scheduleNextComet = React.useCallback(() => {
    const now = performance.now();
    nextCometAtRef.current = now + rnd(cometMinIntervalMs, cometMaxIntervalMs);
  }, [cometMinIntervalMs, cometMaxIntervalMs]);

  const resize = React.useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = c.parentElement?.clientWidth || window.innerWidth;
    const h = c.parentElement?.clientHeight || window.innerHeight;
    sizeRef.current = { w, h, dpr };
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    c.style.width = w + 'px';
    c.style.height = h + 'px';
  }, []);

  const makeStar = React.useCallback(() => {
    const { w, h } = sizeRef.current;
    const baseR = 0.6 + Math.random()*1.8;
    const life = 7 + Math.random()*10;        // в секундах
    const phase = Math.random()*Math.PI*2;
    const tw = 1 + Math.random()*1.6;
    const drift = (Math.random()*0.6 + 0.2) * (Math.random()<0.5?-1:1);
    return {
      x: Math.random()*w,
      y: Math.random()*h,
      // скорости заданы "на кадр при 60 FPS" — ниже нормируем через f = dt*60
      vx: drift * 0.06,
      vy: (Math.random()*0.08 + 0.02),
      r: baseR,
      t: Math.random()*life,
      life,
      phase,
      tw,
    };
  }, []);

  const makeComet = React.useCallback(() => {
    // спаун из верхнего левого или правого сектора, полёт по диагонали вниз
    const { w, h } = sizeRef.current;
    const fromLeft = Math.random() < 0.5;

    const margin = 40;
    const startX = fromLeft ? rnd(-margin, w*0.25) : rnd(w*0.75, w + margin);
    const startY = rnd(-margin, h*0.25);

    // угол 18–35 градусов, скорость ~ 7–10 px/кадр на 60 FPS
    const deg = rnd(18, 35) * (fromLeft ? 1 : -1);
    const ang = (deg * Math.PI) / 180;
    const baseSpeed = rnd(7.0, 10.0);      // px/кадр @ 60fps; в draw умножим на f
    const vx = Math.cos(ang) * baseSpeed;
    const vy = Math.sin(Math.abs(ang)) * baseSpeed * 0.9 + 4.0;

    const tail = rnd(120, 220);            // длина хвоста (px)
    const width = rnd(1.2, 2.2);           // толщина хвоста
    const life = rnd(1.6, 2.8);            // секунды, для плавного fade

    return {
      x: startX,
      y: startY,
      vx,
      vy,
      len: tail,
      w: width,
      t: 0,
      life,
      // лёгкое мерцание головы
      phase: Math.random()*Math.PI*2,
      tw: rnd(0.8, 1.4),
      // небольшая бело-голубая температура вблизи головы
      tint: Math.random()<0.5 ? [255,255,255] : [200,220,255],
    };
  }, []);

  const drawComet = (ctx, cmt, dpr, f) => {
    // позиция и время
    cmt.t += (f/60); // в секундах
    cmt.x += cmt.vx * f;
    cmt.y += cmt.vy * f;

    // голова (радиус чуть больше ширины хвоста)
    const headR = (cmt.w * 2.6) * dpr;
    const twinkle = 0.9 + 0.1*Math.sin(cmt.phase + cmt.t*cmt.tw*6.0);
    const fade = easeInOutSine(clamp01(cmt.t / cmt.life));
    const alphaHead = clamp01(0.85 * twinkle * (1 - 0.25*fade));

    // направление для хвоста
    const vx = cmt.vx, vy = cmt.vy;
    const mag = Math.max(1e-3, Math.hypot(vx, vy));
    const ux = vx / mag, uy = vy / mag;

    // конец хвоста — назад от головы вдоль направления
    const ex = (cmt.x - ux * cmt.len);
    const ey = (cmt.y - uy * cmt.len);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // хвост (градиент от прозрачного → мягкого свечения у головы)
    const lg = ctx.createLinearGradient(ex*dpr, ey*dpr, cmt.x*dpr, cmt.y*dpr);
    const tailAlpha = clamp01(0.55 * (1 - fade));
    const [r,g,b] = cmt.tint;
    lg.addColorStop(0, `rgba(${r},${g},${b},0)`);
    lg.addColorStop(0.7, `rgba(${r},${g},${b},${tailAlpha*0.35})`);
    lg.addColorStop(1, `rgba(${r},${g},${b},${tailAlpha})`);

    ctx.strokeStyle = lg;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = cmt.w * dpr;

    ctx.beginPath();
    ctx.moveTo(ex*dpr, ey*dpr);
    ctx.lineTo(cmt.x*dpr, cmt.y*dpr);
    ctx.stroke();

    // лёгкое «ореольное» свечение на голове
    const rg = ctx.createRadialGradient(cmt.x*dpr, cmt.y*dpr, 0, cmt.x*dpr, cmt.y*dpr, headR);
    rg.addColorStop(0, `rgba(${r},${g},${b},${0.95*alphaHead})`);
    rg.addColorStop(0.45, `rgba(${r},${g},${b},${0.45*alphaHead})`);
    rg.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(cmt.x*dpr, cmt.y*dpr, headR, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
  };

  const draw = React.useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const { dpr, w, h } = sizeRef.current;

    // dt (сек), f = множитель под 60 FPS
    const now = performance.now();
    const prev = lastTimeRef.current || now;
    const dt = Math.min(0.05, (now - prev) / 1000); // clamp, чтобы не прыгало при таб-свитче
    const f = dt * 60;
    lastTimeRef.current = now;

    ctx.clearRect(0, 0, c.width, c.height);

    // --- Звёзды ---
    const arr = starsRef.current;
    while (arr.length < maxStars) arr.push(makeStar());

    for (let i=0;i<arr.length;i++){
      const s = arr[i];
      s.t += dt;
      if (s.t >= s.life) { arr[i] = makeStar(); continue; }

      const p = clamp01(s.t / s.life);
      const scale = 0.25 + 0.75*easeOutCubic(p);
      const fade = easeInOutSine(p);
      const twinkle = 0.85 + 0.15*Math.sin(s.phase + s.t * s.tw * 4.0);

      s.x += s.vx * f; s.y += s.vy * f;
      if (s.x < -8) s.x = w+8;
      if (s.x > w+8) s.x = -8;
      if (s.y > h+8) s.y = -8;

      const R = s.r * scale * dpr;
      const alpha = clamp01(fade * twinkle);

      const g = ctx.createRadialGradient(s.x*dpr, s.y*dpr, 0, s.x*dpr, s.y*dpr, R);
      g.addColorStop(0, `rgba(255,255,255,${0.95*alpha})`);
      g.addColorStop(0.5, `rgba(255,255,255,${0.45*alpha})`);
      g.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x*dpr, s.y*dpr, R, 0, Math.PI*2);
      ctx.fill();
    }

    // --- Кометы (по расписанию) ---
    if (enableComets && !reduceMotion) {
      if (now >= nextCometAtRef.current && cometsRef.current.length < maxComets) {
        cometsRef.current.push(makeComet());
        scheduleNextComet();
      }

      // рисуем и фильтруем активные
      const list = cometsRef.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const cm = list[i];
        drawComet(ctx, cm, dpr, f);

        const off =
          cm.x < -cm.len - 80 || cm.x > w + cm.len + 80 ||
          cm.y > h + cm.len + 80;
        if (off || cm.t > cm.life) {
          list.splice(i, 1);
        }
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [maxStars, makeStar, enableComets, maxComets, reduceMotion, scheduleNextComet, makeComet]);

  React.useEffect(() => {
    resize();

    if (reduceMotion) {
      // статичная «звёздная пыль», без анимации и без комет
      const c = canvasRef.current;
      const ctx = c.getContext('2d');
      const { dpr } = sizeRef.current;
      starsRef.current = Array.from({length: Math.floor(maxStars*0.66)}, makeStar);
      for (const s of starsRef.current) {
        const R = s.r * dpr;
        const g = ctx.createRadialGradient(s.x*dpr, s.y*dpr, 0, s.x*dpr, s.y*dpr, R);
        g.addColorStop(0, `rgba(255,255,255,0.9)`);
        g.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x*dpr, s.y*dpr, R, 0, Math.PI*2);
        ctx.fill();
      }
      return;
    }

    lastTimeRef.current = performance.now();
    scheduleNextComet();

    rafRef.current = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(canvasRef.current.parentElement || document.body);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      ro.disconnect();
    };
  }, [draw, resize, reduceMotion, maxStars, makeStar, scheduleNextComet]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
