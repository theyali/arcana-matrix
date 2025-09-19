// src/features/matrix.jsx
import React from "react";
import Section from "../components/Section";
import { Star, Crown, Lock, BadgeCheck, Loader2, Sparkles, Users } from "lucide-react";
import { useAuthStatus } from "../auth/useAuthStatus";

// Табы
import Tarot22Tab from "./matrix-tabs/Tarot22Tab";
import PythagorTab from "./matrix-tabs/PythagorTab";

/* ------------------------
 * Вспомогательные: тариф/бэйдж
 * ------------------------ */
function planFromProfile(profile) {
  const raw =
    profile?.tariff?.code ||
    profile?.tariff?.slug ||
    profile?.tariff?.name ||
    profile?.plan?.code ||
    profile?.plan?.slug ||
    profile?.plan?.name ||
    profile?.subscription?.plan ||
    profile?.role ||
    "";
  const s = String(raw).toLowerCase();
  if (s.includes("expert") || s.includes("эксперт")) return "expert";
  if (s.includes("pro")) return "pro";
  return "free";
}

function PlanBadge({ plan }) {
  if (plan === "expert") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "color-mix(in srgb, var(--text) 10%, transparent)", color: "var(--text)" }}>
        <Crown className="w-4 h-4" /> Expert
      </span>
    );
  }
  if (plan === "pro") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "color-mix(in srgb, var(--text) 10%, transparent)", color: "var(--text)" }}>
        <Sparkles className="w-4 h-4" /> Pro
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold opacity-80"
          style={{ background: "color-mix(in srgb, var(--text) 8%, transparent)", color: "var(--text)" }}>
      Free
    </span>
  );
}

/* ------------------------
 * Карточка-обёртка для Pro/Expert фич
 * ------------------------ */
function FeatureCard({ icon, title, locked = false, cta = "Pro", to = "/pricing", children }) {
  return (
    <div className="rounded-3xl border border-muted p-5 relative overflow-hidden"
         style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="font-semibold">{title}</div>
      </div>
      <div className={locked ? "opacity-70" : ""}>
        {children}
      </div>
      {locked && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] grid place-items-center">
          <a href={to}
             className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-semibold border border-white/30"
             style={{ background: "color-mix(in srgb, var(--text) 10%, transparent)", color: "var(--text)" }}>
            <Lock className="w-4 h-4" /> Разблокировать {cta}
          </a>
        </div>
      )}
    </div>
  );
}

/* ------------------------
 * Мини-виджет совместимости (Pro)
 * ------------------------ */
function CompatibilityMini({ disabled, dob1 }) {
  const [dob2, setDob2] = React.useState("");
  const [score, setScore] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  const canCalc = Boolean(dob2) && !disabled;

  const onCalc = async () => {
    if (!canCalc) return;
    setErr(""); setLoading(true); setScore(null);
    try {
      const { compatMatrix } = await import("../api/matrix"); // отложенная загрузка
      const data = await compatMatrix({ dob1: dob1 || null, dob2 });
      setScore(data?.score ?? null);
    } catch (e) {
      setErr(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-xs opacity-70">Вторая дата</span>
        <input
          type="date"
          value={dob2}
          onChange={(e) => setDob2(e.target.value)}
          disabled={disabled}
          className="mt-1 w-full rounded-xl px-3 py-2 outline-none border border-muted disabled:opacity-60"
          style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}
        />
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={onCalc}
          disabled={!canCalc || loading}
          className="rounded-xl px-3 py-2 text-sm border border-muted disabled:opacity-60"
          style={{ background: "transparent", color: "var(--text)" }}
        >
          {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Счёт…</span> : "Рассчитать"}
        </button>
        {typeof score === "number" && <span className="text-sm opacity-90">Совместимость: <b>{score}%</b></span>}
      </div>
      {err && <div className="text-xs opacity-70">Ошибка: {err}</div>}
      {disabled && <div className="text-xs opacity-70">Войдите, чтобы рассчитать совместимость.</div>}
    </div>
  );
}

/* ------------------------
 * Основной компонент
 * ------------------------ */
export default function MatrixSection() {
  const { isAuthed, profile } = useAuthStatus();
  const plan = planFromProfile(profile);

  const [mode, setMode] = React.useState("tarot22"); // 'pythagor' | 'tarot22'
  const [dob, setDob] = React.useState("");
  const [serverData, setServerData] = React.useState(null); // result из табов

  const core   = serverData?.core   ?? null; // для Pro (если придёт с бэка)
  const arrows = serverData?.arrows ?? null; // для Expert (если придёт с бэка)

  return (
    <Section id="matrix">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3" style={{ color: "var(--text)" }}>
            <Star /> Матрица судьбы
          </h2>

          {/* Переключатель режимов */}
          <div className="rounded-2xl p-1 bg-white/5 border border-white/10 hidden md:flex">
            {[
              { k: "tarot22", label: "22 Аркана" },
              { k: "pythagor", label: "Пифагор" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => { setMode(t.k); setServerData(null); }}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  mode === t.k ? "bg-[var(--primary)] text-white" : "text-[var(--text)]/80 hover:bg-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <PlanBadge plan={plan} />
      </div>

      <p className="mt-2 max-w-2xl" style={{ color: "var(--text)", opacity: 0.8 }}>
        Введите дату рождения и получите результат. Для «22 Арканов» диаграмма строится на сервере
        и накладывается на готовый SVG-шаблон.
      </p>

      <div className="mt-6 grid lg:grid-cols-1 gap-8">
        {/* Левая колонка: контент табов */}
        <div className="space-y-4">
          {mode === "tarot22" ? (
            <Tarot22Tab dob={dob} setDob={setDob} onResult={setServerData} />
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              <PythagorTab dob={dob} setDob={setDob} onResult={setServerData} />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
