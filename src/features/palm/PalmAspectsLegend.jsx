// src/features/palm/PalmAspectsLegend.jsx
import React from "react";
import { PALM_ASPECTS } from "./aspects.data";

/**
 * Легенда аспектов: слева объяснения для каждого номера, справа — рисунок из /public.
 *
 * props:
 * - imageSrc: путь в /public (например, "/img/palm-numbered.png")
 * - focus: массив id из result.result_json.focus (подсветка приоритета)
 * - items: массив { id, text } из result.result_json.items (покажем «ИИ: …» под базовым описанием)
 * - collapsedHeight: высота левой колонки в «свернутом» состоянии (px), по умолчанию 560
 */
export default function PalmAspectsLegend({
  imageSrc = "/img/palm-numbered.png",
  focus = [],
  items = [],
  collapsedHeight = 560,
}) {
  const aiMap = React.useMemo(() => {
    const m = new Map();
    (items || []).forEach(({ id, text }) => m.set(id, text));
    return m;
  }, [items]);

  const focusSet = React.useMemo(() => new Set(focus || []), [focus]);

  // pro-бейдж с щитом: все, кроме N-1..N-3
  const isProOnly = (id) => !["N-1", "N-2", "N-3"].includes(id);

  // Группируем по group, но выводим сперва выбранные focus (если есть)
  const groups = React.useMemo(() => {
    const g = new Map();
    PALM_ASPECTS.forEach((a) => {
      if (!g.has(a.group)) g.set(a.group, []);
      g.get(a.group).push(a);
    });
    for (const arr of g.values()) {
      arr.sort((a, b) => {
        const af = focusSet.has(a.id) ? 0 : 1;
        const bf = focusSet.has(b.id) ? 0 : 1;
        if (af !== bf) return af - bf;
        const anum = parseInt(a.id.replace("N-", ""), 10);
        const bnum = parseInt(b.id.replace("N-", ""), 10);
        if (Number.isNaN(anum) && Number.isNaN(bnum)) return a.id.localeCompare(b.id);
        if (Number.isNaN(anum)) return 1;
        if (Number.isNaN(bnum)) return -1;
        return anum - bnum;
      });
    }
    return g;
  }, [focusSet]);

  // ——— коллапс/разворот левой колонки
  const leftRef = React.useRef(null);
  const [expanded, setExpanded] = React.useState(false);
  const [showToggle, setShowToggle] = React.useState(false);

  const recomputeOverflow = React.useCallback(() => {
    const el = leftRef.current;
    if (!el) return;
    setShowToggle(el.scrollHeight > collapsedHeight + 4);
  }, [collapsedHeight]);

  React.useEffect(() => {
    recomputeOverflow();
  }, [recomputeOverflow, items, focus, groups]);

  React.useEffect(() => {
    const onResize = () => recomputeOverflow();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recomputeOverflow]);

  return (
    <section className="mt-10 lg:mt-14 rounded-3xl border border-white/10 bg-white/5 p-6 lg:p-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-semibold">Обозначения на схеме ладони</h3>
        <div className="hidden sm:flex items-center gap-2 text-xs opacity-75">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-400/40 bg-amber-500/10 text-amber-300">
            {/* pro-щит */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                 aria-hidden="true" className="inline-block">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
            </svg>
            PRO
          </span>
          <span>— доступно в тарифах Pro/Expert</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Левая колонка — объяснения (коллапсируемая) */}
        <div className="space-y-4">
          <div
            ref={leftRef}
            className="relative transition-all"
            style={{
              maxHeight: expanded ? "none" : `${collapsedHeight}px`,
              overflow: expanded ? "visible" : "hidden",
            }}
          >
            {/* контент групп */}
            <div className="space-y-6">
              {[...groups.keys()].map((groupName) => (
                <div key={groupName}>
                  <h4 className="text-sm uppercase tracking-wide opacity-70 mb-2">{groupName}</h4>
                  <ul className="space-y-3">
                    {groups.get(groupName).map((a) => {
                      const aiText = aiMap.get(a.id);
                      const highlighted = focusSet.has(a.id);
                      const pro = isProOnly(a.id);
                      return (
                        <li
                          key={a.id}
                          className={`rounded-xl p-3 border ${
                            highlighted
                              ? "border-[var(--primary)]/50 bg-[color-mix(in_srgb,_var(--primary)_10%,_transparent)]"
                              : "border-white/10 bg-white/5"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="inline-flex h-6 min-w-6 px-2 rounded-md text-xs font-semibold bg-black/30 border border-white/10 items-center justify-center">
                              {a.id}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="font-medium">{a.name}</div>
                                {pro && (
                                  <span
                                    title="Доступно в тарифах Pro/Expert"
                                    className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md border border-amber-400/40 bg-amber-500/10 text-amber-300"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                         aria-hidden="true" className="inline-block -mt-[1px]">
                                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                                    </svg>
                                    PRO
                                  </span>
                                )}
                              </div>

                              <p className="text-sm opacity-85">{a.def}</p>

                              {aiText && (
                                <p className="text-sm mt-1 opacity-90">
                                  <span className="font-semibold">ИИ:&nbsp;</span>
                                  {aiText}
                                </p>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {/* градиентная «затемнялка» при свернутом состоянии */}
            {!expanded && showToggle && (
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-16"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.0))",
                }}
              />
            )}
          </div>

          {/* Кнопка «Показать больше / Свернуть» */}
          {showToggle && (
            <div>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="rounded-xl px-4 py-2 text-sm font-semibold border border-white/15 bg-white/10 hover:bg-white/15 transition"
                aria-expanded={expanded}
              >
                {expanded ? "Свернуть" : "Показать больше"}
              </button>
            </div>
          )}
        </div>

        {/* Правая колонка — картинка (из public) */}
        <div className="lg:pl-4">
          <div className="lg:sticky lg:top-6">
            <figure className="rounded-2xl overflow-hidden border border-white/10 bg-black/10">
              <img
                src={imageSrc}
                alt="Схема ладони с номерами линий"
                className="w-full h-auto"
                loading="lazy"
              />
              <figcaption className="text-xs opacity-70 px-3 py-2">
                Схема: номера соответствуют списку слева
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      {/* мини-легенда для мобильных */}
      <div className="sm:hidden mt-3 text-[11px] opacity-70">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-400/40 bg-amber-500/10 text-amber-300 mr-1 align-middle">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               aria-hidden="true" className="-mt-[1px]">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
          </svg>
          PRO
        </span>
        — доступно в тарифах Pro/Expert
      </div>
    </section>
  );
}
