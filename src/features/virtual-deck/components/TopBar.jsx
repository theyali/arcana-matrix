// src/features/virtual-deck/components/TopBar.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Shuffle,
  Undo2,
  Eye,
  EyeOff,
  Wand2,
  Zap,
  Sun,
  Moon,
  Hand,       // взять карту
  Eraser,     // очистить стол
  RotateCcw,  // полный сброс
  Layers,     // смена колоды (стопка/«карты»)
  SlidersHorizontal, // для кнопки «Ещё»
  Menu,       // бургер
  X,          // закрыть
} from "lucide-react";

export default function TopBar({
  spread,
  onChangeSpread,
  onTake,
  canDraw,
  onFlipAll,
  onHideAll,
  onUndo,
  onShuffleLeft,
  autoFlip,
  setAutoFlip,
  animMs,
  setAnimMs,
  onClear,
  onResetAll,
  deckLabel,
  onToggleDeck,
}) {
  const { t } = useTranslation();

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

  // геометрия — синхронно с useDeckDims (для десктопной панели слева)
  const RATIO = 270 / 170;
  const baseCardW = Math.min(vw * 0.42, 170);
  const baseCardH = Math.round(baseCardW * RATIO);
  const deckW = Math.round(baseCardW * (130 / 170));
  const deckH = Math.round(baseCardH * (210 / 270));

  // позиционирование панели (десктоп)
  const BOARD_PAD = 16;      // p-4
  const DECK_PAD = 12;       // left-3/bottom-3 у колоды
  const GAP_ABOVE_DECK = 60; // зазор над колодой
  const DECK_LABEL_H = 22;   // «В колоде: N»
  const bottomOffset = deckH + DECK_PAD + GAP_ABOVE_DECK + DECK_LABEL_H;

  const isDarkDeck = /т[её]м|dark/i.test(deckLabel || "");

  const panel =
    "flex h-full flex-col items-stretch gap-2 rounded-2xl border border-white/10 bg-black/35 backdrop-blur px-3 py-3 shadow-[0_8px_24px_rgba(0,0,0,.35)]";
  const hsep = "w-full h-px bg-white/10 my-1";
  const iconBtnBase =
    "inline-flex items-center justify-center h-10 rounded-lg border border-white/10 bg-white/10 hover:bg-white/15 active:bg-white/20 transition w-full";
  const iconGridBtn = `${iconBtnBase} aspect-[1.9/1]`;
  const fullIconBtn = `${iconBtnBase} h-10`;
  const dangerBtn =
    "inline-flex items-center justify-center h-10 rounded-lg border border-red-500/30 bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 transition w-full";

  /* ========== МОБИЛЬНАЯ ВЕРСИЯ: бургер + горизонтальный бар ========== */
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mobileMore, setMobileMore] = React.useState(false);

  React.useEffect(() => {
    if (!isMobile) {
      // на десктопе всегда закрываем мобильные панели
      setMobileOpen(false);
      setMobileMore(false);
    }
  }, [isMobile]);

  if (isMobile) {
    const barBase =
      // Непрозрачный фон
      "rounded-xl border border-white/10 bg-slate-900 shadow-[0_8px_24px_rgba(0,0,0,.35)]";
    const btn =
      "inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 transition flex-none";

    return (
      <div className="absolute top-2 left-2 right-2 z-30 pointer-events-auto">
        {/* Бургер-кнопка (плавающая) */}
        <button
          type="button"
          onClick={() => setMobileOpen((s) => !s)}
          aria-expanded={mobileOpen}
          title={mobileOpen ? t("vd.topbar.close", { defaultValue: "Close" }) : t("vd.topbar.open", { defaultValue: "Open controls" })}
          className="absolute left-0 top-0 w-10 h-10 inline-flex items-center justify-center rounded-lg border border-white/10 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 transition z-40"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Горизонтальный бар — появляется при нажатии бургера */}
        {mobileOpen && (
          <>
            <div className={`${barBase} px-2 py-2 flex items-center gap-2 overflow-x-auto ml-12`}>
              <select
                value={spread}
                onChange={(e) => onChangeSpread(e.target.value)}
                className="h-9 text-[13px] rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 px-2 flex-none min-w-[140px]"
                title={t("vd.topbar.spread_label")}
                aria-label={t("vd.topbar.spread_label")}
              >
                <option value="single">{t("vd.topbar.spread.single")}</option>
                <option value="three">{t("vd.topbar.spread.three")}</option>
                <option value="subpersonalities">
                  {t("vd.topbar.spread.subpersonalities", "Subpersonalities")}
                </option>
                <option value="celtic">{t("vd.topbar.spread.celtic")}</option>
                <option value="partnership">{t("vd.topbar.spread.partnership")}</option>
                <option value="alchemist">{t("vd.topbar.spread.alchemist", "Alchemist")}</option>
                <option value="grid9">{t("vd.topbar.spread.grid9", "9-card Grid")}</option>
              </select>

              <button
                onClick={onTake}
                disabled={!canDraw}
                className={`${btn} ${!canDraw ? "opacity-40 cursor-not-allowed" : ""}`}
                title={t("vd.topbar.take")}
                aria-label={t("vd.topbar.take")}
              >
                <Hand className="h-5 w-5" />
              </button>

              <button
                className={btn}
                onClick={onFlipAll}
                title={t("vd.topbar.flip_all")}
                aria-label={t("vd.topbar.flip_all")}
              >
                <Eye className="h-5 w-5" />
              </button>
              <button
                className={btn}
                onClick={onHideAll}
                title={t("vd.topbar.hide_all")}
                aria-label={t("vd.topbar.hide_all")}
              >
                <EyeOff className="h-5 w-5" />
              </button>
              <button
                className={btn}
                onClick={onUndo}
                title={t("vd.topbar.undo_last")}
                aria-label={t("vd.topbar.undo_last")}
              >
                <Undo2 className="h-5 w-5" />
              </button>
              <button
                className={btn}
                onClick={onShuffleLeft}
                title={t("vd.topbar.shuffle_left")}
                aria-label={t("vd.topbar.shuffle_left")}
              >
                <Shuffle className="h-5 w-5" />
              </button>

              <button
                className={btn}
                onClick={onToggleDeck}
                title={t("vd.topbar.toggle_deck", { deck: deckLabel })}
                aria-label={t("vd.topbar.toggle_deck", { deck: deckLabel })}
              >
                <Layers className="h-5 w-5" />
              </button>

              <button
                className={btn}
                onClick={() => setMobileMore((s) => !s)}
                title={t("vd.topbar.more", { defaultValue: "More" })}
                aria-expanded={mobileMore}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>

            {/* Раскрывающийся блок «Ещё» (также с непрозрачным фоном) */}
            {mobileMore && (
              <div className={`${barBase} mt-2 px-3 py-3 grid grid-cols-1 gap-3 ml-12`}>
                <label className="flex items-center justify-between text-[12px] opacity-90">
                  <span className="inline-flex items-center gap-1.5">
                    <Wand2 className="h-4 w-4" />
                    {t("vd.topbar.auto_flip")}
                  </span>
                  <input
                    type="checkbox"
                    checked={autoFlip}
                    onChange={(e) => setAutoFlip(e.target.checked)}
                    className="scale-110"
                    title={t("vd.topbar.auto_flip")}
                    aria-label={t("vd.topbar.auto_flip")}
                  />
                </label>

                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 opacity-80" />
                  <input
                    type="range"
                    min={260}
                    max={900}
                    step={20}
                    value={animMs}
                    onChange={(e) => setAnimMs(+e.target.value)}
                    className="flex-1 w-full accent-amber-400"
                    title={t("vd.topbar.anim_speed")}
                    aria-label={t("vd.topbar.anim_speed")}
                  />
                  <span className="w-14 text-right text-[12px] tabular-nums opacity-90">
                    {animMs}ms
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={iconBtnBase}
                    onClick={onClear}
                    title={t("vd.topbar.clear_table")}
                    aria-label={t("vd.topbar.clear_table")}
                  >
                    <Eraser className="h-5 w-5" />
                  </button>

                  <button
                    className={dangerBtn}
                    onClick={onResetAll}
                    title={t("vd.topbar.reset")}
                    aria-label={t("vd.topbar.reset")}
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 opacity-80 text-xs">
                  {isDarkDeck ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span className="truncate">{deckLabel}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  /* ========== ДЕСКТОПНАЯ ВЕРСИЯ (как была) ========== */
  return (
    <div
      className="absolute z-30 pointer-events-auto"
      style={{
        left: BOARD_PAD,
        top: BOARD_PAD,
        bottom: bottomOffset,
        width: deckW,
      }}
    >
      <div className={panel}>
        <select
          value={spread}
          onChange={(e) => onChangeSpread(e.target.value)}
          className="h-9 text-[13px] rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 px-2 w-full"
          title={t("vd.topbar.spread_label")}
          aria-label={t("vd.topbar.spread_label")}
        >
          <option value="single">{t("vd.topbar.spread.single")}</option>
          <option value="three">{t("vd.topbar.spread.three")}</option>
          <option value="subpersonalities">
            {t("vd.topbar.spread.subpersonalities", "Subpersonalities")}
          </option>
          <option value="celtic">{t("vd.topbar.spread.celtic")}</option>
          <option value="partnership">{t("vd.topbar.spread.partnership")}</option>
          <option value="alchemist">{t("vd.topbar.spread.alchemist", "Alchemist")}</option>
          <option value="grid9">{t("vd.topbar.spread.grid9", "9-card Grid")}</option>
        </select>

        <button
          onClick={onTake}
          disabled={!canDraw}
          className={`${fullIconBtn} ${!canDraw ? "opacity-40 cursor-not-allowed" : ""}`}
          title={t("vd.topbar.take")}
          aria-label={t("vd.topbar.take")}
        >
          <Hand className="h-5 w-5" />
          <span className="sr-only">{t("vd.topbar.take")}</span>
        </button>

        <div className={hsep} />

        <div className="side-bar-left-deck grid grid-cols-2 gap-2">
          <button
            className={iconGridBtn}
            onClick={onFlipAll}
            title={t("vd.topbar.flip_all")}
            aria-label={t("vd.topbar.flip_all")}
          >
            <Eye className="h-5 w-5" />
            <span className="sr-only">{t("vd.topbar.flip_all")}</span>
          </button>
          <button
            className={iconGridBtn}
            onClick={onHideAll}
            title={t("vd.topbar.hide_all")}
            aria-label={t("vd.topbar.hide_all")}
          >
            <EyeOff className="h-5 w-5" />
            <span className="sr-only">{t("vd.topbar.hide_all")}</span>
          </button>
          <button
            className={iconGridBtn}
            onClick={onUndo}
            title={t("vd.topbar.undo_last")}
            aria-label={t("vd.topbar.undo_last")}
          >
            <Undo2 className="h-5 w-5" />
            <span className="sr-only">{t("vd.topbar.undo_last")}</span>
          </button>
          <button
            className={iconGridBtn}
            onClick={onShuffleLeft}
            title={t("vd.topbar.shuffle_left")}
            aria-label={t("vd.topbar.shuffle_left")}
          >
            <Shuffle className="h-5 w-5" />
            <span className="sr-only">{t("vd.topbar.shuffle_left")}</span>
          </button>
        </div>

        <div className={hsep} />

        <label className="flex items-center justify-between text:[12px] text-[12px] opacity-90 select-none">
          <span className="inline-flex items-center gap-1.5">
            <Wand2 className="h-4 w-4" />
          </span>
          <input
            type="checkbox"
            checked={autoFlip}
            onChange={(e) => setAutoFlip(e.target.checked)}
            className="scale-110"
            title={t("vd.topbar.auto_flip")}
            aria-label={t("vd.topbar.auto_flip")}
          />
        </label>

        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <Zap className="h-4 w-4 opacity-80" />
          <input
            type="range"
            min={260}
            max={900}
            step={20}
            value={animMs}
            onChange={(e) => setAnimMs(+e.target.value)}
            className="flex-1 w-full max-w-full min-w-0 accent-amber-400"
            title={t("vd.topbar.anim_speed")}
            aria-label={t("vd.topbar.anim_speed")}
          />
          <span className="w-12 text-right text-[12px] tabular-nums opacity-90">
            {animMs}ms
          </span>
        </div>

        <div className={hsep} />

        <button
          onClick={onToggleDeck}
          className={fullIconBtn}
          title={t("vd.topbar.toggle_deck", { deck: deckLabel })}
          aria-label={t("vd.topbar.toggle_deck", { deck: deckLabel })}
        >
          <Layers className="h-5 w-5 mr-1" />
          {isDarkDeck ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className="sr-only">
            {t("vd.topbar.toggle_deck", { deck: deckLabel })}
          </span>
        </button>

        <div className={hsep} />

        <button
          className={fullIconBtn}
          onClick={onClear}
          title={t("vd.topbar.clear_table")}
          aria-label={t("vd.topbar.clear_table")}
        >
          <Eraser className="h-5 w-5" />
          <span className="sr-only">{t("vd.topbar.clear_table")}</span>
        </button>

        <button
          className={dangerBtn}
          onClick={onResetAll}
          title={t("vd.topbar.reset")}
          aria-label={t("vd.topbar.reset")}
        >
          <RotateCcw className="h-5 w-5" />
          <span className="sr-only">{t("vd.topbar.reset")}</span>
        </button>

        <div className="flex-1" />
      </div>
    </div>
  );
}
