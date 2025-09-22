// src/features/virtual-deck/components/ReadingSidebar.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

/**
 * Правый сайдбар со списком карт и аккордеоном значений (desktop).
 * На мобайле показываем только отдельную кнопку-лупу в правом верхнем углу.
 *
 * props:
 *  - items: [{ index, id, name, faceUp, reversed, meaning|null }]
 *  - onInterpret: ()=>void
 *  - onSelect: (id:string)=>void
 *  - onToggle: (id:string)=>void
 *  - onZoom:   (id:string)=>void
 *  - selectedId?: string
 */
export default function ReadingSidebar({
  items = [],
  onInterpret,
  onSelect,
  onToggle,
  onZoom,
  selectedId = null,
}) {
  const { t } = useTranslation("common");

  // Один открытый элемент (аккордеон) — desktop
  const [openId, setOpenId] = React.useState(null);

  React.useEffect(() => {
    if (selectedId) setOpenId(selectedId);
  }, [selectedId]);

  const hasAnyFaceUp = items.some((x) => x.faceUp);

  // ======= Мобильная ветка: только плавающая лупа в правом верхнем углу =======
  const [vw, setVw] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  React.useEffect(() => {
    const on = () => setVw(window.innerWidth);
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("orientationchange", on);
    };
  }, []);
  const isMobile = vw <= 640;

  // Мобайл: сам сайдбар не показываем — кнопку-лупу рисуем в VirtualDeckPage внутри стола.
  if (isMobile) return null;

  // ======= Десктопная ветка: полный сайдбар =======
  return (
    <aside
      className="
        h-full flex flex-col rounded-xl overflow-hidden
        bg-white/5 backdrop-blur-sm ring-1 ring-white/10 shadow-xl
        text-white
      "
    >
      {/* Заголовок */}
      <div className="px-4 py-3 border-b border-white/10 text-white/90 font-semibold">
        {t("vd.sidebar.title", { defaultValue: "Card meanings" })}
      </div>

      {/* Содержимое со скроллом */}
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="text-white/80 text-sm">
            {t("vd.sidebar.empty", { defaultValue: "No cards on the table yet." })}
          </div>
        ) : (
          items.map((it) => {
            const isOpen = openId === it.id;
            const showLabel = it.faceUp
              ? t("vd.sidebar.hide", { defaultValue: "Hide" })
              : t("vd.sidebar.show", { defaultValue: "Show" });

            return (
              <div
                key={it.id + "-" + it.index}
                className={`
                  rounded-lg border transition
                  ${selectedId === it.id ? "border-amber-400/70 bg-white/10" : "border-white/10 bg-white/5"}
                `}
              >
                {/* Шапка элемента */}
                <button
                  type="button"
                  onClick={() => {
                    onSelect?.(it.id);
                    onToggle?.(it.id);
                    setOpenId(it.faceUp ? null : it.id);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-left"
                >
                  <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-white/15 text-xs">
                    {it.index}
                  </span>

                  <span className="truncate text-sm font-medium">{it.name}</span>

                  {it.faceUp && it.reversed ? (
                    <span className="ml-auto text-[10px] uppercase opacity-90">
                      {t("vd.sidebar.reversed", { defaultValue: "Reversed" })}
                    </span>
                  ) : (
                    <span className="ml-auto text-[10px] uppercase opacity-70">{showLabel}</span>
                  )}

                  {/* Лупа — не <button>, чтобы избежать вложенных кнопок */}
                  <span className="pl-2">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect?.(it.id);
                        onZoom?.(it.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          onSelect?.(it.id);
                          onZoom?.(it.id);
                        }
                      }}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md
                                 bg-white/10 hover:bg-white/20 transition cursor-pointer"
                      title={t("vd.sidebar.zoom", { defaultValue: "Zoom" })}
                      aria-label={t("vd.sidebar.zoom", { defaultValue: "Zoom" })}
                    >
                      <Search className="w-4 h-4" />
                    </span>
                  </span>
                </button>

                {/* Аккордеон */}
                {isOpen && (
                  <div className="px-3 pb-3 -mt-1 text-[13px] leading-snug">
                    {it.faceUp ? (
                      <div className="opacity-90 whitespace-pre-wrap break-words">
                        {it.meaning || ""}
                      </div>
                    ) : (
                      <div className="opacity-70 italic">
                        {t("vd.sidebar.closed", { defaultValue: "Click the card to reveal" })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Кнопка ИИ */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onInterpret}
          disabled={!hasAnyFaceUp}
          className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition
            ${hasAnyFaceUp
              ? "bg-white text-slate-900 hover:bg-white/90"
              : "bg-white/50 text-slate-900/60 cursor-not-allowed"}`}
        >
          {t("vd.sidebar.ai", { defaultValue: "Get AI interpretation" })}
        </button>
      </div>
    </aside>
  );
}
