import React from "react";
import { Link } from "react-router-dom";

// маленький прогресс-бар
export function StatBar({ label, value = 0 }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs opacity-70 mb-1">
        <span>{label}</span><span>{v}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full"
          style={{ width: `${v}%`, background: "linear-gradient(90deg, var(--accent), var(--primary))" }}
        />
      </div>
    </div>
  );
}

export function LuckyRow({ stats }) {
  if (!stats) return null;
  const hasColor = stats.lucky_color || stats.lucky_color_code;
  const hasNums = stats.lucky_numbers && stats.lucky_numbers.length;
  if (!hasColor && !hasNums) return null;

  return (
    <div className="flex flex-col gap-2 text-sm mt-3">
      {hasColor && (
        <div className="flex items-center gap-2">
          <span className="opacity-70">Счастливый цвет:</span>
          {stats.lucky_color_code ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-md border border-white/20"
                style={{ background: stats.lucky_color_code }}
                aria-label={stats.lucky_color || stats.lucky_color_code}
              />
              <code className="opacity-90">{stats.lucky_color || stats.lucky_color_code}</code>
            </span>
          ) : (
            <span className="opacity-90">{stats.lucky_color}</span>
          )}
        </div>
      )}
      {hasNums && (
        <div className="flex items-center gap-2">
          <span className="opacity-70">Счастливые числа:</span>
          <span className="opacity-90">{stats.lucky_numbers.join(", ")}</span>
        </div>
      )}
    </div>
  );
}

function LockOverlay({ text = "Войдите, чтобы открыть все метрики", to = "/login" }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="backdrop-blur-sm bg-black/20 rounded-xl border border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span aria-hidden>🔒</span>
          <span className="opacity-90">{text}</span>
          <Link className="btn-primary rounded-xl px-3 py-1 text-xs ml-2" to={to}>
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Красивый сайдбар с метриками.
 * Публично: всегда показываем "Итоговый балл" и блок "Счастливый цвет/числа".
 * Остальные метрики блюрим с замком.
 */
export default function ForecastStatsSidebar({
  forecast,     // объект Forecast из API (ожидаем forecast.stats внутри)
  isGuest,      // boolean
  loginPath = "/login",
}) {
  const stats = forecast?.stats;
  if (!stats) return null;

  const loginTo = `${loginPath}?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;

  return (
    <aside className="">
      <div className="rounded-2xl p-5 border border-white/10 bg-white/5 lg:sticky lg:top-6 h-fit">
        <h2 className="font-semibold mb-3">Метрики</h2>

        {/* Итоговый балл — всегда доступен */}
        <StatBar label="Итоговый балл" value={stats.total_score} />

        {/* Остальные — блюр + замок для гостей */}
        <div className="relative mt-3">
          <div className={isGuest ? "pointer-events-none filter blur-[2px] select-none" : ""}>
            <div className="grid grid-cols-2 gap-3">
              <StatBar label="Финансы" value={stats.finances} />
              <StatBar label="Карьера" value={stats.career} />
              <StatBar label="Отношения" value={stats.relationship} />
              <StatBar label="Здоровье" value={stats.health} />
              <StatBar label="Семья" value={stats.family} />
              <StatBar label="Друзья" value={stats.friends} />
              <StatBar label="Путешествия" value={stats.travel} />
              <StatBar label="Форма" value={stats.physique} />
              <StatBar label="Статус" value={stats.status} />
            </div>
          </div>
          {isGuest && <LockOverlay to={loginTo} />}
        </div>

        {/* Счастливые: доступны всем */}
        <LuckyRow stats={stats} />
      </div>

      <div className="rounded-2xl p-5 border border-white/10 bg-white/5 lg:sticky lg:top-6 h-fit mt-6">
        <h2 className="font-semibold mb-3">Что такое метрики?</h2>
        {/* Пояснение к метрикам */}
        <div className="mt-6 text-xs leading-relaxed opacity-80 space-y-2 mt-4">
          <p><strong>Финансы</strong> — отражает уровень материальной стабильности и перспектив заработка.</p>
          <p><strong>Карьера</strong> — динамика профессионального роста, успехи в работе и учебе.</p>
          <p><strong>Отношения</strong> — качество взаимодействия с партнёром и окружением.</p>
          <p><strong>Здоровье</strong> — физическое и эмоциональное состояние, ресурсность.</p>
          <p><strong>Семья</strong> — гармония в семье и поддержка со стороны близких.</p>
          <p><strong>Друзья</strong> — уровень доверия и общения с друзьями.</p>
          <p><strong>Путешествия</strong> — возможности для поездок, перемещений, новых впечатлений.</p>
          <p><strong>Форма</strong> — внутренний тонус, энергия, способность поддерживать активность.</p>
          <p><strong>Статус</strong> — социальное признание, авторитет и влияние на других.</p>
          <p className="mt-2">Чем выше показатель (ближе к 100), тем более сильная и благоприятная энергия в этой сфере. 
            Баллы ниже 50 указывают на зоны, требующие внимания.</p>
        </div>
      </div>


    </aside>
  );
}
