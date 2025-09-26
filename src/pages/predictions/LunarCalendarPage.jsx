// src/pages/predictions/LunarCalendarPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft, ChevronRight, CalendarDays,
  Sunrise, Sunset, Sun, Compass, Gauge, Moon as MoonIcon
} from "lucide-react";
import { getLunarDay, getLunarMonth } from "../../api/lunar";
import LunarPhasesInfo from "./LunarPhasesInfo";

/* ====== Фазы и утилиты ====== */
const PHASES = [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
];
const toISODate = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

function phaseKey(raw) {
  if (!raw) return null;
  const s = String(raw).toLowerCase().replace(/\s+/g, "_");
  if (PHASES.includes(s)) return s;
  if (s.includes("full")) return "full_moon";
  if (s.includes("new")) return "new_moon";
  if (s.includes("first") || s.includes("1")) return "first_quarter";
  if (s.includes("last") || s.includes("third") || s.includes("3")) return "last_quarter";
  if (s.includes("waxing") && s.includes("crescent")) return "waxing_crescent";
  if (s.includes("waning") && s.includes("crescent")) return "waning_crescent";
  if (s.includes("waxing")) return "waxing_gibbous";
  if (s.includes("waning")) return "waning_gibbous";
  return null;
}

function PhaseLabel({ k }) {
  const { t } = useTranslation("common");
  const map = {
    new_moon: t("lunar.phase.new_moon"),
    waxing_crescent: t("lunar.phase.waxing_crescent"),
    first_quarter: t("lunar.phase.first_quarter"),
    waxing_gibbous: t("lunar.phase.waxing_gibbous"),
    full_moon: t("lunar.phase.full_moon"),
    waning_gibbous: t("lunar.phase.waning_gibbous"),
    last_quarter: t("lunar.phase.last_quarter"),
    waning_crescent: t("lunar.phase.waning_crescent"),
  };
  return <>{map[k] || "—"}</>;
}

/* ====== Вспомогательное ====== */
function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-3xl p-5 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,.25)] border border-white/10 ${className}`}
      style={{ background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))", backdropFilter: "blur(8px)", ...style }}
    >
      {children}
    </div>
  );
}
function useLocale() { const { i18n } = useTranslation(); return i18n.language || "en"; }

/* ====== Выпадающий выбор TZ ====== */
const CIS_TZ = [
  // Russia
  "Europe/Kaliningrad","Europe/Moscow","Europe/Samara",
  "Asia/Yekaterinburg","Asia/Omsk","Asia/Novosibirsk","Asia/Barnaul","Asia/Tomsk","Asia/Novokuznetsk",
  "Asia/Krasnoyarsk","Asia/Irkutsk","Asia/Chita","Asia/Yakutsk","Asia/Khandyga",
  "Asia/Vladivostok","Asia/Sakhalin","Asia/Magadan","Asia/Srednekolymsk","Asia/Kamchatka","Asia/Anadyr",
  // Belarus
  "Europe/Minsk",
  // Azerbaijan
  "Asia/Baku",
  // Armenia
  "Asia/Yerevan",
  // Kazakhstan
  "Asia/Almaty","Asia/Aqtobe","Asia/Aqtau","Asia/Atyrau","Asia/Oral","Asia/Qostanay","Asia/Qyzylorda",
  // Kyrgyzstan
  "Asia/Bishkek",
  // Tajikistan
  "Asia/Dushanbe",
  // Uzbekistan
  "Asia/Tashkent","Asia/Samarkand",
  // Turkmenistan
  "Asia/Ashgabat",
  // Moldova
  "Europe/Chisinau",
];

function TimezoneSelect({ value, onChange }) {
  const zones = React.useMemo(() => {
    const base = Array.from(new Set(CIS_TZ));
    // если текущее значение не из СНГ — добавим его, чтобы не ломать controlled select
    const top = value && !base.includes(value) ? [value] : [];
    // отсортируем по алфавиту, но оставим top в начале
    const sorted = base.slice().sort((a, b) => a.localeCompare(b));
    return [...top, ...sorted];
  }, [value]);

  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm"
      title="Time Zone"
    >
      {zones.map((z) => (
        <option key={z} value={z}>{z}</option>
      ))}
    </select>
  );
}

/* ====== Небольшой спиннер ====== */
function Spinner({ size = 28 }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-white/30 border-t-white/90"
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
}

/* ====== Страница ====== */
export default function LunarCalendarPage() {
  const { t } = useTranslation("common");
  const locale = useLocale();

  const [date, setDate] = React.useState(() => new Date());
  const [day, setDay] = React.useState(null);
  const [month, setMonth] = React.useState({ days: [], meta: {} });
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [coords, setCoords] = React.useState({ lat: null, lon: null });
  const [tz, setTz] = React.useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);

  const dateISO = toISODate(date);

  // Геолокация (мягкая) — один раз
  React.useEffect(() => {
    try {
      if (navigator?.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setCoords({
            lat: Number(pos.coords.latitude?.toFixed(2)),
            lon: Number(pos.coords.longitude?.toFixed(2))
          }),
          () => setCoords((c) => c ?? { lat: null, lon: null }),
          { enableHighAccuracy: false, timeout: 3000 }
        );
      }
    } catch {}
  }, []);

  const load = React.useCallback(async (d) => {
    setLoading(true); setErr("");
    try {
      const opts = { tz, lat: coords.lat, lon: coords.lon };
      const [monthData, dayData] = await Promise.all([
        getLunarMonth(d, opts),
        getLunarDay(toISODate(d), opts),
      ]);
      setMonth({
        days: Array.isArray(monthData?.days) ? monthData.days : (monthData || []),
        meta: monthData?.meta || {}
      });
      setDay(dayData || null);
    } catch (e) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [tz, coords.lat, coords.lon]);

  // Один-единственный загрузчик данных
  React.useEffect(() => { load(date); }, [load, date]);

  const phaseK = phaseKey(day?.phase_key || day?.phase || day?.phase_name) || "full_moon";
  const prev = () => setDate((d) => addDays(d, -1));
  const next = () => setDate((d) => addDays(d, +1));
  const monthName = date.toLocaleDateString(locale, { month: "long", year: "numeric" });

  const timeFmt = (s) => {
    if (!s) return "—";
    if (/\d{2}:\d{2}/.test(s) && !/T/.test(s)) return s;
    const dt = new Date(s); return isNaN(dt) ? s : dt.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  };
  const deg = (v, p=1) => (v === null || v === undefined) ? "—" : `${Number(v).toFixed(p)}°`;
  const num = (v, p=1) => (v === null || v === undefined) ? "—" : Number(v).toFixed(p);
  const km = (v) => (v === null || v === undefined) ? "—" : Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(v);
  const cap = (s) => (typeof s === "string" && s.length) ? (s[0].toUpperCase() + s.slice(1)) : "—";
  const intervalsFmt = (pairs) =>
    Array.isArray(pairs) && pairs.length
      ? pairs.map(([a,b], i) => <div key={i} className="text-sm">{timeFmt(a)} — {timeFmt(b)}</div>)
      : <div className="text-sm opacity-70">—</div>;

  // === Путь к PNG по номеру лунного дня ===
  const base = import.meta.env.BASE_URL || "/";
  const lunarDay = Math.max(1, Math.min(30, Number(day?.lunar_day || 1)));
  const moonImgSrc = `${base}img/moon/moon-${String(lunarDay).padStart(2, "0")}.png`;

  return (
    <div className="min-h-[calc(100vh-64px)] relative overflow-hidden" style={{ color: "var(--text, #fff)" }}>
      <div className="container mx-auto px-4 max-w-7xl py-10 md:py-14">
        {/* Заголовок + выбор TZ */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{t("lunar.title")}</h1>
            <p className="opacity-80">{t("lunar.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3 opacity-90">
            <CalendarDays /> <span className="text-sm">{monthName}</span>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <TimezoneSelect value={tz} onChange={setTz} />
          </div>
        </div>

        {/* Три колонки: слева — календарь, центр — карточка дня, справа — доп.данные */}
        <div className="grid md:grid-cols-[minmax(280px,1fr)_minmax(340px,420px)_minmax(280px,1fr)] gap-4 md:gap-6 items-start">
          {/* LEFT: Month grid (desktop) */}
          <Card className="hidden md:block">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">{monthName}</div>
              <CalendarDays className="opacity-80" />
            </div>
            <MonthGrid
              monthDays={month?.days || []}
              selectedISO={dateISO}
              onSelect={(iso) => setDate(new Date(iso))}
              locale={locale}
              meta={month?.meta}
            />
            <MonthExtras
              meta={month?.meta}
              days={month?.days || []}
              locale={locale}
              onJump={(iso) => setDate(new Date(iso))}
              t={t}
            />
          </Card>

          {/* CENTER: Основной день */}
          <Card className="relative">
            <div className="flex items-center justify-between mb-2">
              <button onClick={prev} className="rounded-2xl p-2 border border-white/10 hover:bg-white/5 transition"><ChevronLeft /></button>
              <div className="text-center">
                <div className="text-sm opacity-80">{date.toLocaleDateString(locale, { weekday: "long" })}</div>
                <div className="text-2xl font-bold"><PhaseLabel k={phaseK} /></div>
                <div className="opacity-80">{date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
              <button onClick={next} className="rounded-2xl p-2 border border-white/10 hover:bg-white/5 transition"><ChevronRight /></button>
            </div>

            {/* Большая картинка луны из /public/img/moon */}
            <div className="grid place-items-center my-3 md:my-5">
              <img
                src={moonImgSrc}
                alt={`Lunar day ${lunarDay}`}
                width={186}
                height={186}
                className="rounded-full block"
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* Rise/Set */}
            <div className="grid grid-cols-2 gap-3 md:gap-6 text-sm mt-4">
              <InfoPill icon={<Sunrise />} label={t("lunar.moonrise")} value={timeFmt(day?.moonrise || day?.next_moonrise)} />
              <InfoPill icon={<Sunset />}  label={t("lunar.moonset")}  value={timeFmt(day?.moonset || day?.next_moonset)} />
            </div>

            {/* Числа кратко */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="text-center">
                <div className="text-4xl font-extrabold">{day?.lunar_day ?? "—"}</div>
                <div className="text-xs opacity-70">{t("lunar.lunar_day")}</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-semibold">{Math.round((day?.illumination ?? 0) * 100)}%</div>
                <div className="text-xs opacity-70">{t("lunar.illumination")}</div>
              </div>
            </div>

            {err && !loading && (<div className="mt-4 text-center text-red-300 text-sm">{err}</div>)}
          </Card>

          {/* RIGHT: Компактные карточки */}
          <div className="hidden md:flex flex-col gap-4">
            <Card>
              <div className="grid grid-cols-1 gap-3">
                <StatCard title={t("lunar.culmination")} icon={<ArrowUp />} value={timeFmt(day?.culmination_time)} />
                <StatCard title={t("lunar.alt_az_at", { time: "21:00" })} icon={<Compass />} value={`${deg(day?.moon_alt_21)} / ${deg(day?.moon_az_21)}`} />
                <StatCard title={t("lunar.sunrise_sunset")} icon={<Sun />} value={`${timeFmt(day?.sunrise)} / ${timeFmt(day?.sunset)}`} />
                <StatCard title={t("lunar.lunar_day_bounds")} icon={<CalendarDays />} value={`${timeFmt(day?.lunar_day_start)} — ${timeFmt(day?.lunar_day_end)}`} />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 opacity-80"><Gauge /> <span>{t("lunar.night_visibility")}</span></div>
                <div className="font-semibold">
                  {day?.night_illumination_score != null ? `${Math.round(day.night_illumination_score * 100)}%` : "—"}
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-white/70"
                  style={{ width: `${Math.max(0, Math.min(100, Math.round((day?.night_illumination_score || 0) * 100)))}%` }}
                />
              </div>
              <div className="mt-2 text-xs opacity-75">
                {t("lunar.night_alt_max")}: <strong>{deg(day?.night_moon_alt_max)}</strong>
              </div>
            </Card>

            <Card>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoPill icon={<MoonIcon />} label={t("lunar.moon_sign")} value={cap(day?.moon_sign)} />
                <InfoPill icon={<CalendarDays />} label={t("lunar.zodiac_change")} value={timeFmt(day?.zodiac_change_at)} />
                <InfoPill icon={<Compass />} label="RA / Dec" value={`${num(day?.ra, 2)}h / ${deg(day?.dec, 1)}`} />
                <InfoPill icon={<Compass />} label="Ecl. Lon/Lat" value={`${deg(day?.ecl_lon, 1)} / ${deg(day?.ecl_lat, 1)}`} />
                <InfoPill icon={<Gauge />} label={t("lunar.distance")} value={`${km(day?.distance_km)} km`} />
                <InfoPill icon={<Gauge />} label={t("lunar.angular_size")} value={`${num(day?.ang_diam_arcmin, 1)}′`} />
              </div>
            </Card>

            <Card>
              <div className="text-sm font-semibold mb-1">{t("lunar.visibility_intervals")}</div>
              {intervalsFmt(day?.visibility)}
            </Card>
          </div>
        </div>

        {/* Мобильные версии: сетка месяца + доп.карточки ниже основного блока */}
        <div className="md:hidden mt-5 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">{monthName}</div>
              <CalendarDays className="opacity-80" />
            </div>
            <MonthGrid
              monthDays={month?.days || []}
              selectedISO={dateISO}
              onSelect={(iso) => setDate(new Date(iso))}
              locale={locale}
              meta={month?.meta}
            />
            <MonthExtras
              meta={month?.meta}
              days={month?.days || []}
              locale={locale}
              onJump={(iso) => setDate(new Date(iso))}
              t={t}
            />
          </Card>

          <Card>
            <div className="grid grid-cols-1 gap-3">
              <StatCard title={t("lunar.culmination")} icon={<ArrowUp />} value={timeFmt(day?.culmination_time)} />
              <StatCard title={t("lunar.alt_az_at", { time: "21:00" })} icon={<Compass />} value={`${deg(day?.moon_alt_21)} / ${deg(day?.moon_az_21)}`} />
              <StatCard title={t("lunar.sunrise_sunset")} icon={<Sun />} value={`${timeFmt(day?.sunrise)} / ${timeFmt(day?.sunset)}`} />
              <StatCard title={t("lunar.lunar_day_bounds")} icon={<CalendarDays />} value={`${timeFmt(day?.lunar_day_start)} — ${timeFmt(day?.lunar_day_end)}`} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 opacity-80"><Gauge /> <span>{t("lunar.night_visibility")}</span></div>
              <div className="font-semibold">
                {day?.night_illumination_score != null ? `${Math.round(day.night_illumination_score * 100)}%` : "—"}
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-white/70"
                style={{ width: `${Math.max(0, Math.min(100, Math.round((day?.night_illumination_score || 0) * 100)))}%` }}
              />
            </div>
            <div className="mt-2 text-xs opacity-75">
              {t("lunar.night_alt_max")}: <strong>{deg(day?.night_moon_alt_max)}</strong>
            </div>
          </Card>

          <Card>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoPill icon={<MoonIcon />} label={t("lunar.moon_sign")} value={cap(day?.moon_sign)} />
              <InfoPill icon={<CalendarDays />} label={t("lunar.zodiac_change")} value={timeFmt(day?.zodiac_change_at)} />
              <InfoPill icon={<Compass />} label="RA / Dec" value={`${num(day?.ra, 2)}h / ${deg(day?.dec, 1)}`} />
              <InfoPill icon={<Compass />} label="Ecl. Lon/Lat" value={`${deg(day?.ecl_lon, 1)} / ${deg(day?.ecl_lat, 1)}`} />
              <InfoPill icon={<Gauge />} label={t("lunar.distance")} value={`${km(day?.distance_km)} km`} />
              <InfoPill icon={<Gauge />} label={t("lunar.angular_size")} value={`${num(day?.ang_diam_arcmin, 1)}′`} />
            </div>
          </Card>

          <Card>
            <div className="text-sm font-semibold mb-1">{t("lunar.visibility_intervals")}</div>
            {intervalsFmt(day?.visibility)}
          </Card>
        </div>

        {/* === Общий информационный блок про фазы Луны === */}
        <div className="mt-6 md:mt-10">
          <LunarPhasesInfo />
        </div>
      </div>
    </div>
  );
}

/* ====== Календарная сетка ====== */
function MonthGrid({ monthDays, selectedISO, onSelect, locale, meta }) {
  const base = (monthDays && monthDays[0]?.date)
    ? new Date(monthDays[0].date)
    : (selectedISO ? new Date(selectedISO) : new Date());

  const y = base.getFullYear();
  const m = base.getMonth();

  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstDowMon0 = ((new Date(y, m, 1).getDay() + 6) % 7); // пн=0..вс=6

  const byIso = new Map();
  (monthDays || []).forEach((d) => { if (d?.date) byIso.set(d.date, d); });

  const padStart = firstDowMon0;
  const rows = Math.ceil((padStart + daysInMonth) / 7);
  const padEnd = rows * 7 - (padStart + daysInMonth);
  const cells = [];

  for (let i = 0; i < padStart; i++) cells.push({ _pad: true, key: `lead-${i}` });
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISODate(new Date(y, m, day));
    const merged = byIso.get(iso) || { date: iso };
    cells.push({ ...merged, key: iso });
  }
  for (let i = 0; i < padEnd; i++) cells.push({ _pad: true, key: `tail-${i}` });

  const dow = Array.from({ length: 7 }, (_, i) =>
    new Date(2020, 5, 8 + i).toLocaleDateString(locale, { weekday: "short" }).replace(".", "")
  );

  const todayISO = toISODate(new Date());

  const peaks = meta?.phase_peaks || {};
  const signChangeDays = new Set((meta?.sign_change_days || []).map(Number));
  const peakSet = {
    new_moon: new Set((peaks?.new_moon || []).map(String)),
    first_quarter: new Set((peaks?.first_quarter || []).map(String)),
    full_moon: new Set((peaks?.full_moon || []).map(String)),
    last_quarter: new Set((peaks?.last_quarter || []).map(String)),
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-xs opacity-70 mb-2">
        {dow.map((d) => (<div key={d} className="text-center">{d}</div>))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d) =>
          d._pad ? (
            <div key={d.key} className="h-12 rounded-xl bg-transparent" />
          ) : (
            <button
              key={d.key}
              onClick={() => onSelect(d.date)}
              aria-selected={d.date === selectedISO}
              className={[
                "h-12 rounded-xl border transition flex flex-col items-center justify-center gap-0.5",
                d.date === selectedISO ? "border-white/40 bg-white/10" : "border-white/10 hover:bg-white/5",
                (d.date === todayISO && d.date !== selectedISO) ? "ring-1 ring-white/20" : ""
              ].join(" ")}
              title={d.lunar_day ? `Lunar day ${d.lunar_day}` : d.date}
            >
              <div className="text-sm">
                {new Date(d.date).toLocaleDateString(locale, { day: "numeric" })}
              </div>
              <SmallMoon phase={phaseKey(d.phase_key || d.phase || d.phase_name) || "full_moon"} />
              <div className="flex gap-1 mt-0.5">
                {peakSet.new_moon.has(d.date) && <Dot className="bg-white/80" title="New Moon" />}
                {peakSet.first_quarter.has(d.date) && <Dot className="bg-white/60" title="First Quarter" />}
                {peakSet.full_moon.has(d.date) && <Dot className="bg-white" title="Full Moon" />}
                {peakSet.last_quarter.has(d.date) && <Dot className="bg-white/60" title="Last Quarter" />}
              </div>
              {signChangeDays.has(new Date(d.date).getDate()) && (
                <div className="text-[10px] mt-0.5 opacity-70">↻♑︎</div>
              )}
            </button>
          )
        )}
      </div>
    </div>
  );
}

function MonthExtras({ meta, days, locale, onJump, t }) {
  const peaks = meta?.phase_peaks || {};
  const listFrom = (arr) => Array.isArray(arr) ? arr.map(String) : [];

  // --- Highlights: даты пиков фаз (даты без времени)
  const highlights = [
    { phase: "new_moon",        label: t("lunar.phase.new_moon"),        dates: listFrom(peaks?.new_moon) },
    { phase: "first_quarter",   label: t("lunar.phase.first_quarter"),    dates: listFrom(peaks?.first_quarter) },
    { phase: "full_moon",       label: t("lunar.phase.full_moon"),        dates: listFrom(peaks?.full_moon) },
    { phase: "last_quarter",    label: t("lunar.phase.last_quarter"),     dates: listFrom(peaks?.last_quarter) },
  ].filter(x => x.dates.length);

  // --- Dark nights: топ-5 с минимальной освещённостью
  const dark = [...(Array.isArray(days) ? days : [])]
    .filter(d => typeof d?.illumination === "number")
    .sort((a,b) => a.illumination - b.illumination)
    .slice(0, 5);

  const fmtDay = (iso) =>
    new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short" });

  if (!highlights.length && !dark.length) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wide opacity-70 mb-2">
            {t("lunar.highlights", "Highlights this month")}
          </div>
          <div className="flex flex-wrap gap-2">
            {highlights.map(group =>
              group.dates.map((iso) => (
                <button
                  key={`${group.phase}-${iso}`}
                  onClick={() => onJump?.(iso)}
                  className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  title={`${group.label} · ${iso}`}
                >
                  <SmallMoon phase={group.phase} size={14} />
                  <span className="opacity-90">{group.label}</span>
                  <span className="opacity-70">· {fmtDay(iso)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Dark nights */}
      {dark.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wide opacity-70 mb-2">
            {t("lunar.dark_nights", "Dark nights (best for stargazing)")}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {dark.map((d) => (
              <button
                key={d.date}
                onClick={() => onJump?.(d.date)}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                title={`${d.date}`}
              >
                <div className="flex items-center gap-2">
                  <SmallMoon phase={phaseKey(d.phase_key)} size={14} />
                  <span className="text-sm">{fmtDay(d.date)}</span>
                </div>
                <span className="text-sm opacity-80">{Math.round(d.illumination * 100)}%</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Dot({ className="", title="" }) {
  return <span title={title} className={`inline-block w-1.5 h-1.5 rounded-full ${className}`} />;
}

function SmallMoon({ phase, size = 14 }) {
  const R = size / 2, CX = R, CY = R;
  const offMap = {
    waxing_crescent:  +R * 0.70,
    waxing_gibbous:   -R * 0.70,
    waning_gibbous:   +R * 0.70,
    waning_crescent:  -R * 0.70,
  };
  const off = offMap[phase];
  const isFull = phase === "full_moon";
  const isNew = phase === "new_moon";
  const isQuarter = phase === "first_quarter" || phase === "last_quarter";
  const rid = (typeof React !== "undefined" && React.useId) ? React.useId() : Math.random().toString(36).slice(2, 8);
  const id = (x) => `${x}-${rid}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ display: "inline-block", verticalAlign: "middle" }}>
      <defs>
        <mask id={id("disc")}><rect width={size} height={size} fill="black" /><circle cx={CX} cy={CY} r={R} fill="white" /></mask>
        <mask id={id("lit")}><rect width={size} height={size} fill="black" />{!isNew && <circle cx={CX} cy={CY} r={R} fill="white" />}{!isFull && !isNew && (isQuarter ? (<rect x={phase === "first_quarter" ? CX : 0} y={0} width={R} height={size} fill="black" />) : (<circle cx={CX + off} cy={CY} r={R} fill="black" />))}</mask>
      </defs>
      <circle cx={CX} cy={CY} r={R - 0.5} fill={isNew ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.18)"} stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
      {!isNew && (<g mask={`url(#${id("lit")})`}><circle cx={CX} cy={CY} r={R - 0.5} fill="#ffffff" /></g>)}
    </svg>
  );
}

/* ====== Маленькие утилитарные компоненты ====== */

function InfoPill({ icon, label, value }) {
  const { t } = useTranslation();

  // переводим ТОЛЬКО знак зодиака в value, если есть соответствующий ключ
  const translatedValue = (() => {
    if (typeof value !== "string") return value;

    const map = {
      aries: "aries",
      taurus: "taurus",
      gemini: "gemini",
      cancer: "cancer",
      leo: "leo",
      virgo: "virgo",
      libra: "libra",
      scorpio: "scorpio",
      sagittarius: "sagittarius",
      capricorn: "capricorn",
      aquarius: "aquarius",
      pisces: "pisces",
    };

    const key = value.trim().toLowerCase();
    const z = map[key];
    if (!z) return value; // не зодиак — оставляем как есть

    const tr = t(`zodiac.${z}`, { defaultValue: value });
    return tr || value; // если перевода нет — оставить как есть
  })();

  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl p-3 border border-white/10 bg-white/5">
      {icon} <span className="opacity-80">{label}</span> <strong>{translatedValue}</strong>
    </div>
  );
}
function StatCard({ title, icon, value }) {
  return (
    <div className="rounded-2xl p-3 border border-white/10 bg-white/5">
      <div className="flex items-center gap-2 text-sm opacity-80 mb-1">{icon}{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
function ArrowUp(props){ return <svg {...props} width="18" height="18" viewBox="0 0 24 24" className="inline"><path fill="currentColor" d="M12 3l6 6h-4v9h-4V9H6z"/></svg>; }
