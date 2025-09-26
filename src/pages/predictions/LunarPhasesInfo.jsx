// src/pages/predictions/LunarPhasesInfo.jsx
import React from "react";

/**
 * Общий инфоблок: что такое фазы Луны, как читать календарь,
 * и краткие описания каждой фазы. Можно переиспользовать на любых страницах.
 */

const PHASES = [
  { key: "new_moon",        title: "Новолуние",           desc: "Луна находится между Землёй и Солнцем, видимый диск почти не освещён. Точка «нуля» лунного цикла. Часто выбирают для постановки намерений и стартов, требующих тишины и фокуса." },
  { key: "waxing_crescent", title: "Растущий серп",       desc: "Тонкий освещённый край расширяется день ото дня. Время собирать ресурсы, пробовать идеи, делать первые шаги." },
  { key: "first_quarter",   title: "Первая четверть",     desc: "Видна половина лунного диска. Период решений и корректировок: где усилить усилия, что изменить, чтобы план двигался." },
  { key: "waxing_gibbous",  title: "Растущая выпуклая",   desc: "Освещено больше половины диска, скоро полнолуние. Доведение до ума, «полировка», доработки перед выходом на максимум." },
  { key: "full_moon",       title: "Полнолуние",          desc: "Максимальная освещённость диска. Пик цикла: ясность, проявленность, завершения и результаты." },
  { key: "waning_gibbous",  title: "Убывающая выпуклая",  desc: "После пика энергия спадает. Анализ, сбор обратной связи, благодарность, спокойное продвижение." },
  { key: "last_quarter",    title: "Последняя четверть",  desc: "Снова видна половина диска. Отсечение лишнего, упрощение, наведение порядка." },
  { key: "waning_crescent", title: "Старый серп",         desc: "Тонкий убывающий серп перед новолунием. Отдых, восстановление, завершение незакрытых дел, отпускание." },
];

/** Мини-иконка фазы (упрощённая) — автономна, без зависимостей от страницы */
function TinyMoon({ phase, size = 18 }) {
  const R = size / 2;
  const CX = R, CY = R;
  const off = {
    waxing_crescent:  +R * 0.70,
    waxing_gibbous:   -R * 0.70,
    waning_gibbous:   +R * 0.70,
    waning_crescent:  -R * 0.70,
  }[phase];

  const isFull    = phase === "full_moon";
  const isNew     = phase === "new_moon";
  const isQuarter = phase === "first_quarter" || phase === "last_quarter";

  // стабильный id для масок
  const rid = (typeof React !== "undefined" && React.useId) ? React.useId() : Math.random().toString(36).slice(2, 8);
  const id = (x) => `${x}-${rid}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ flex: "0 0 auto" }}>
      <defs>
        <mask id={id("lit")}>
          <rect width={size} height={size} fill="black" />
          {!isNew && <circle cx={CX} cy={CY} r={R} fill="white" />}
          {!isFull && !isNew && (
            isQuarter ? (
              <rect x={phase === "first_quarter" ? CX : 0} y={0} width={R} height={size} fill="black" />
            ) : (
              <circle cx={CX + off} cy={CY} r={R} fill="black" />
            )
          )}
        </mask>
      </defs>

      <circle cx={CX} cy={CY} r={R - 0.6} fill={isNew ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.18)"} stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" />
      {!isNew && (
        <g mask={`url(#${id("lit")})`}>
          <circle cx={CX} cy={CY} r={R - 0.6} fill="#fff" />
        </g>
      )}
    </svg>
  );
}

export default function LunarPhasesInfo() {
  return (
    <section
      className="rounded-3xl p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,.25)] border border-white/10"
      style={{ background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))", backdropFilter: "blur(8px)" }}
    >
      <div className="grid gap-6 md:gap-8">
        {/* Что такое фаза Луны */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: "var(--text,#fff)" }}>
            Что такое «фаза Луны»?
          </h2>
          <p className="opacity-85 leading-relaxed">
            Фаза Луны — это видимая из Земли освещённая часть лунного диска. По мере движения Луны по орбите угол освещения меняется,
            поэтому мы видим серпы, половины диска, «выпуклые» (gibbous) формы и полнолуние. Полный цикл от новолуния до следующего новолуния
            длится примерно 29.5 суток.
          </p>
        </div>

        {/* Как читать календарь */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">Как читать этот календарь</h3>
          <ul className="list-disc pl-5 space-y-2 opacity-90">
            <li><strong>Название фазы</strong> указано сверху основной карточки дня, а мини-иконки фаз показаны в сетке месячных дат.</li>
            <li><strong>% освещённости</strong> — доля видимой яркой части диска (0% ≈ новолуние, 100% ≈ полнолуние).</li>
            <li><strong>Лунный день</strong> — счётчик дней внутри текущего лунного месяца (примерно от 1 до 29/30).</li>
            <li><strong>Восход/заход Луны</strong> — ориентировочные локальные моменты появления/исчезновения Луны над горизонтом.</li>
            <li>Клик по дате в сетке открывает подробности на выбранный день.</li>
          </ul>
        </div>

        {/* Краткие описания фаз */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-3">Фазы Луны — кратко</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {PHASES.map((p) => (
              <div
                key={p.key}
                className="rounded-2xl p-4 border border-white/10 bg-white/5 flex gap-3 items-start"
              >
                <TinyMoon phase={p.key} />
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm opacity-85 leading-relaxed">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Примечание */}
        <div className="text-xs opacity-70 leading-relaxed">
          Примечание: визуальная «сторона» освещения (с какой стороны серп) может восприниматься по-разному в зависимости от широты и ориентации наблюдателя.
          Мы используем унифицированные иконки для единообразия интерфейса.
        </div>
      </div>
    </section>
  );
}
