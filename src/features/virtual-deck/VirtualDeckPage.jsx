// src/features/virtual-deck/VirtualDeckPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import cardsData from "./cards.json";

import { DECKS } from "./constants";
import { backCandidates } from "./utils/assetPaths";
import { shuffle } from "./utils/array";
import useDeckDims from "./hooks/useDeckDims";
import { computePlayRect, makeLayout } from "./layout";
import { Search } from "lucide-react";

import TopBar from "./components/TopBar";
import CardZoomOverlay from "./components/CardZoomOverlay";
import ReadingSidebar from "./components/ReadingSidebar";
import BoardArea from "./components/BoardArea";
import DeckPile from "./components/DeckPile";
import Flights from "./components/Flights";
import FlyingCard from "./components/FlyingCard";
import HelpFooter from "./components/HelpFooter";

import useReadingItems from "./hooks/useReadingItems";
import useClickDelay from "./hooks/useClickDelay";

// 🔒 защита авторизацией
import AuthGate from "../../components/auth/AuthGate";

// 💳 квоты для виртуальной колоды
import {
  getDeckQuota,
  startSpreadOncePerSession,
  completeSpread,
  getActiveSpreadId,
  completeSpreadBeacon,
} from "../../api/virtualDeck";

export default function VirtualDeckPage() {
  const { t, i18n } = useTranslation();
  const lng = (i18n.language || "en").slice(0, 2);
  const tPick = (obj) => (obj && typeof obj === "object" ? obj[lng] ?? obj.en ?? "" : obj ?? "");
  const nameOf = (card) => (lng === "ru" ? card.ru : lng === "uk" ? card.uk : card.en);

  const { vw, deckW, deckH, boardBottomPad } = useDeckDims();
  const CARDS = cardsData;

  const [deckId, setDeckId] = React.useState("light");
  const deckCfg = DECKS[deckId];
  const deckLabel = deckCfg.label;

  const [spread, setSpread] = React.useState("single");
  const [stack, setStack] = React.useState(() => shuffle(CARDS.map((c) => c.id)));
  const [drawn, setDrawn] = React.useState([]); // [{id, faceUp, reversed}]
  const [selected, setSelected] = React.useState(null);

  // === КВОТА: данные с бэка ===
  const [quota, setQuota] = React.useState(null); // { limit, remaining, period, periodEndsAt } | null (гость/ошибка)
  const [quotaLoading, setQuotaLoading] = React.useState(true);
  const [quotaErr, setQuotaErr] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setQuotaLoading(true);
        const q = await getDeckQuota();
        if (mounted) {
          setQuota(q);
          setQuotaErr(null);
        }
      } catch (e) {
        if (mounted) {
          setQuota(null);
          setQuotaErr(e?.message || "quota-failed");
        }
      } finally {
        if (mounted) setQuotaLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Intro overlay: показываем, пока пользователь ещё не тянул карту
  const [introShown, setIntroShown] = React.useState(true);
  const [introMounted, setIntroMounted] = React.useState(true);
  React.useEffect(() => {
    if (!introShown) {
      const t = setTimeout(() => setIntroMounted(false), 500); // совпадает с duration-500
      return () => clearTimeout(t);
    }
  }, [introShown]);
  const introText =
    lng === "ru"
      ? "Кликните по колоде, чтобы начать"
      : lng === "uk"
      ? "Клацніть по колоді, щоб почати"
      : "Click the deck to start";

  // Zoom Overlay (для обратного полёта)
  const [zoom, setZoom] = React.useState(null); // { card, reversed, deckId, fromEl, r }

  // Полёты зума
  const [flight, setFlight] = React.useState(null);
  const [flightBack, setFlightBack] = React.useState(null);

  // визуальный размер стопки
  const [deckVisualCount, setDeckVisualCount] = React.useState(stack.length);
  React.useEffect(() => setDeckVisualCount(stack.length), [stack.length]);

  // верхняя панель
  const [autoFlip, setAutoFlip] = React.useState(false);
  const [animMs, setAnimMs] = React.useState(460);

  // refs
  const boardRef = React.useRef(null);
  const deckRef = React.useRef(null);
  const slotRefs = React.useRef([]);

  // летящая карта при раздаче
  const [fly, setFly] = React.useState(null);
  const [animating, setAnimating] = React.useState(false);

  // single vs double click (делитель)
  const clickDelayApi = useClickDelay(250);

  // отслеживаем размер борда
  const [boardRect, setBoardRect] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    if (!boardRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const cr = e.contentRect;
        setBoardRect({ width: cr.width, height: cr.height });
      }
    });
    ro.observe(boardRef.current);
    return () => ro.disconnect();
  }, []);

  // игровое поле и расклад
  const playRect = computePlayRect(boardRect, boardBottomPad, spread);
  const { cardW, cardH, slots } = React.useMemo(
    () => makeLayout(spread, playRect, vw),
    [spread, playRect, vw]
  );

  const backSrcs = backCandidates(deckCfg);
  const spreadLimit = slots.length;

  // подписи скрываем для Кельтского креста
  const showCardName = spread !== "celtic";

  // данные для сайдбара
  const readingItems = useReadingItems(drawn, CARDS, nameOf, tPick, lng);

  // === Активный расклад в этой вкладке ===
  const [activeSpreadId, setActiveSpreadId] = React.useState(() => getActiveSpreadId());
  const sessionStarted = React.useMemo(() => Boolean(activeSpreadId), [activeSpreadId]);

  // Завершение расклада (настроечная обёртка)
  const completeActive = React.useCallback(
    async (reason = "unknown") => {
      if (!activeSpreadId) return;
      const payload = {
        reason,
        spread_code: spread,
        deck_id: deckId,
        lang: lng,
        cards_drawn: drawn.length,
        faceup_count: drawn.filter((x) => x.faceUp).length,
        reversed_count: drawn.filter((x) => x.reversed).length,
        ts_end: Date.now(),
      };
      try {
        await completeSpread(activeSpreadId, payload);
      } catch (e) {
        console.warn("complete spread failed:", e);
      } finally {
        setActiveSpreadId(null);
      }
    },
    [activeSpreadId, spread, deckId, lng, drawn]
  );

  // === Верхняя панель — обработчики
  const flipAll = () => setDrawn((prev) => prev.map((x) => ({ ...x, faceUp: true })));
  const hideAll = () => setDrawn((prev) => prev.map((x) => ({ ...x, faceUp: false })));
  const clearTable = async () => {
    if (drawn.length > 0) await completeActive("clear");
    setDrawn([]);
    setSelected(null);
  };
  const undoLast = () => {
    setDrawn((prev) => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      setStack((s) => [last.id, ...s]);
      setDeckVisualCount((v) => v + 1);
      setSelected(null);
      return prev.slice(0, -1);
    });
  };
  const changeSpread = async (id) => {
    if (drawn.length > 0) await completeActive("change-spread");
    setSpread(id);
    setDrawn([]);
    setSelected(null);
    setStack(shuffle(CARDS.map((c) => c.id)));
    setDeckVisualCount(CARDS.length);
  };
  const resetAll = React.useCallback(
    async () => {
      if (drawn.length > 0) await completeActive("reset");
      setStack(shuffle(CARDS.map((c) => c.id)));
      setDrawn([]);
      setSelected(null);
      setDeckVisualCount(CARDS.length);
    },
    [CARDS, drawn.length, completeActive]
  );
  const toggleDeck = React.useCallback(() => {
    setDeckId((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  // можно ли вообще тянуть карту с учётом анимации/лимита/слотов
  const baseCanDraw = stack.length > 0 && drawn.length < spreadLimit && !animating;
  const quotaAllows =
    // если квоты нет (гость/ошибка) — не блокируем, но AuthGate внизу всё равно закроет гостям
    quota == null ? true : quota.remaining > 0 || sessionStarted;
  const canDraw = baseCanDraw && quotaAllows;

  const takeFromDeck = async () => {
    if (!canDraw) return;

    // списать 1 попытку при ПЕРВОЙ карте на пустом столе
    if (!sessionStarted && drawn.length === 0) {
      try {
        const res = await startSpreadOncePerSession({
          spread_code: spread,
          deck_id: deckId,
          lang: lng,
        });
        setQuota((q) => (q ? { ...q, remaining: res.remaining } : q));
        if (res.spreadId) setActiveSpreadId(res.spreadId);
      } catch (e) {
        console.warn("startSpread failed:", e?.message || e);
        return;
      }
    }

    if (introShown) setIntroShown(false);

    const nextId = stack[0];
    const isReversed = Math.random() * 100 < 50;

    const br = boardRef.current?.getBoundingClientRect();
    const dr = deckRef.current?.getBoundingClientRect();
    const targetEl = slotRefs.current[drawn.length];
    const tr = targetEl?.getBoundingClientRect();
    if (!br || !dr || !tr) return;

    const startRect = { x: dr.left - br.left, y: dr.top - br.top, w: dr.width, h: dr.height };
    const endRect = { x: tr.left - br.left, y: tr.top - br.top, w: tr.width, h: tr.height };
    const rotateDeg = (Math.random() * 6 - 3).toFixed(2);

    setAnimating(true);
    setDeckVisualCount((v) => Math.max(0, v - 1));

    setFly({
      startRect,
      endRect,
      candidates: backSrcs,
      rotateDeg,
      onDone: () => {
        setStack((prev) => prev.slice(1));
        setDrawn((prev) => [...prev, { id: nextId, faceUp: autoFlip, reversed: isReversed }]);
        setSelected(nextId);
        setFly(null);
        setAnimating(false);
      },
    });
  };

  // === Переворот карты по индексу (для BoardArea)
  const onFlipIndex = React.useCallback((idx) => {
    setDrawn((prev) => prev.map((x, i) => (i === idx ? { ...x, faceUp: !x.faceUp } : x)));
  }, []);

  // === Запуск полёта/зум по индексу (для BoardArea и сайдбара)
  const onDoubleIndex = React.useCallback(
    (idx, r) => {
      const placed = drawn[idx];
      if (!placed) return;
      const card = CARDS.find((c) => c.id === placed.id);
      const slotEl = slotRefs.current[idx];
      if (!card || !slotEl || flight) return;
      setFlight({ fromEl: slotEl, r: r || 0, card, reversed: placed.reversed, deckId });
    },
    [drawn, CARDS, flight, deckId]
  );

  // Переворот карты по id (используется сайдбаром)
  const toggleCardById = React.useCallback((id) => {
    setDrawn((prev) => prev.map((x) => (x.id === id ? { ...x, faceUp: !x.faceUp } : x)));
    setSelected(id);
  }, []);

  // Запуск зума из сайдбара (эмулируем double-click)
  const zoomFromSidebar = React.useCallback(
    (id) => {
      const idx = drawn.findIndex((x) => x.id === id);
      if (idx === -1) return;
      clickDelayApi.cancel(idx);
      const r = slots[idx]?.r || 0;
      onDoubleIndex(idx, r);
    },
    [drawn, slots, onDoubleIndex, clickDelayApi]
  );

  // === Закрыть zoom (обратный полёт)
  const handleCloseZoom = () => {
    if (!zoom) return;
    const { fromEl, r, card, reversed, deckId: zDeck } = zoom;
    setZoom(null);
    if (fromEl && document.body.contains(fromEl)) {
      setFlightBack({ toEl: fromEl, r: r || 0, card, reversed, deckId: zDeck || deckId });
    }
  };

  // Завершение при уходе со страницы/разгрузке вкладки
  React.useEffect(() => {
    const onUnload = () => {
      if (activeSpreadId && drawn.length > 0) {
        completeSpreadBeacon(activeSpreadId, {
          reason: "unload",
          spread_code: spread,
          deck_id: deckId,
          lang: lng,
          cards_drawn: drawn.length,
        });
      }
    };
    window.addEventListener("pagehide", onUnload);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("pagehide", onUnload);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [activeSpreadId, drawn.length, spread, deckId, lng]);

  // бейдж с квотой (если есть данные)
  const quotaBadge =
    quota && !quotaLoading ? (
      <span className="ml-2 align-[2px] rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs tabular-nums">
        {t("vd.quota.badge", "{{remaining}} / {{limit}} free this {{period}}", {
          remaining: quota.remaining ?? 0,
          limit: quota.limit ?? 0,
          period: quota.period || "week",
        })}
      </span>
    ) : null;

  return (
    <div className="virtual-deck-page">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="h1 mb-2">
          {t("vd.title", "Virtual Deck")}
          {quotaBadge}
        </h1>
        <p className="text-base opacity-80 mb-8">
          {t("vd.subtitle", "A free tool to shuffle and lay out virtual tarot cards for readings.")}
        </p>

        {/* ====== СТОЛ (под AuthGate) ====== */}
        <AuthGate
          className=""
          overlayClassName="text-white"
          title={t("vd.auth.title", "Log in to use the Virtual Deck")}
          description={t("vd.auth.desc", "This feature is available to authorized users only.")}
          lock="🔒"
        >
          <div
            ref={boardRef}
            className="relative rounded-2xl overflow-hidden p-4 shadow-xl ring-1 ring-white/10"
            style={{ paddingBottom: 0 }}
          >
            {/* Верхняя панель */}
            <TopBar
              spread={spread}
              onChangeSpread={changeSpread}
              onTake={takeFromDeck}
              canDraw={canDraw}
              onFlipAll={flipAll}
              onHideAll={hideAll}
              onUndo={undoLast}
              onShuffleLeft={() => setStack((p) => shuffle(p))}
              autoFlip={autoFlip}
              setAutoFlip={setAutoFlip}
              animMs={animMs}
              setAnimMs={setAnimMs}
              onClear={clearTable}
              onResetAll={resetAll}
              deckLabel={deckLabel}
              onToggleDeck={toggleDeck}
            />

            {/* Декоративный слой */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)] z-0" />

            {/* Интро-плейсхолдер в центре (пока не вытянули карту) */}
            {introMounted && (
              <div
                className={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
                  introShown ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="text-center select-none">
                  <img
                    src="/img/logo.svg"
                    alt="Tarion"
                    className="mx-auto mb-4 w-28 h-28 object-contain opacity-95"
                    draggable={false}
                  />
                  <div className="text-sm text-white/80">{introText}</div>
                </div>
              </div>
            )}

            {/* Абсолютная раскладка (вынесена в компонент) */}
            <BoardArea
              slots={slots}
              cardW={cardW}
              cardH={cardH}
              drawn={drawn}
              cards={CARDS}
              deckCfg={deckCfg}
              deckId={deckId}
              spread={spread}
              selectedId={selected}
              setSelected={setSelected}
              slotRefs={slotRefs}
              onFlipIndex={onFlipIndex}
              onDoubleIndex={onDoubleIndex}
              nameOf={nameOf}
              showCardName={showCardName}
              clickDelayApi={clickDelayApi}
            />

            {/* Летящая карта при раздаче */}
            {fly && (
              <FlyingCard
                startRect={fly.startRect}
                endRect={fly.endRect}
                candidates={backSrcs}
                rotateDeg={parseFloat(fly.rotateDeg)}
                duration={animMs}
                onDone={fly.onDone}
              />
            )}

            {/* ====== КОЛОДА СНИЗУ ====== */}
            <DeckPile
              deckCfg={deckCfg}
              deckW={deckW}
              deckH={deckH}
              deckVisualCount={deckVisualCount}
              stackLen={stack.length}
              animating={animating}
              onTake={takeFromDeck}
              deckRef={deckRef}
            />

            {/* === Правый сайдбар — внутри стола === */}
            <div
              className="absolute right-3 top-3 bottom-3 z-20 pointer-events-none w-0 min-w-0
                         md:pointer-events-auto md:w-[min(32vw,260px)] md:min-w-[260px]">
              <ReadingSidebar
                items={readingItems}
                selectedId={selected || null}
                onSelect={(id) => setSelected(id)}
                onToggle={toggleCardById}
                onZoom={zoomFromSidebar}
                onInterpret={async () => {
                  // «завершение» по действию интерпретации (аналитика)
                  if (drawn.length > 0) await completeActive("interpret");
                }}
              />
            </div>
         {/* === Мобильная лупа — прямо «на столе», правый верхний угол === */}
            <div className="absolute right-3 top-3 z-30 md:hidden pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  if (!selected) return;
                  zoomFromSidebar(selected);
                }}
                disabled={!selected}
                className={`inline-flex items-center justify-center w-11 h-11 rounded-full border shadow-[0_8px_24px_rgba(0,0,0,.35)]
                            ${selected
                              ? "border-white/20 bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-700"
                              : "border-white/10 bg-slate-800/70 text-white/70 opacity-60 cursor-not-allowed"}`}
                title={selected ? "Zoom" : "Select a card first"}
                aria-label="Zoom"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </AuthGate>

        {/* Подсказки и описание действий/иконок */}
        <HelpFooter quotaRemaining={quota?.remaining ?? null} />
      </div>

      {/* === Полёты зума (вынесены) === */}
      <Flights
        flight={flight}
        onForwardDone={() => {
          const z = {
            card: flight.card,
            reversed: flight.reversed,
            deckId: flight.deckId,
            fromEl: flight.fromEl,
            r: flight.r,
          };
          setFlight(null);
          setZoom(z);
        }}
        flightBack={flightBack}
        onBackDone={() => setFlightBack(null)}
      />

      {/* === Оверлей просмотра карты === */}
      <CardZoomOverlay
        open={!!zoom}
        card={zoom?.card || null}
        reversed={zoom?.reversed || false}
        deckCfg={DECKS[zoom?.deckId || deckId]}
        nameOf={nameOf}
        onClose={handleCloseZoom}
      />
    </div>
  );
}
