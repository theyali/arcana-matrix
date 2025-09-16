import React from "react";
import { Loader2 } from "lucide-react";

function calcPythagorasCounts(dateStr) {
  const clean = (dateStr || "").replace(/[^0-9]/g, "");
  const counts = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [String(i + 1), 0]));
  for (const ch of clean) {
    if (ch !== "0") counts[ch] = (counts[ch] || 0) + 1;
  }
  return counts;
}

function MatrixGrid({ counts, loading }) {
  const cells = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {cells.flat().map((d) => (
        <div
          key={d}
          className="rounded-2xl border border-muted p-4 text-center shadow-sm"
          style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}
        >
          <div className="text-sm uppercase tracking-wide opacity-70">{d}</div>
          <div className="mt-1 text-2xl font-semibold">
            {loading ? (
              <span className="inline-flex items-center gap-2 opacity-70">
                <Loader2 className="w-4 h-4 animate-spin" /> …
              </span>
            ) : counts?.[d] > 0 ? (
              Array.from({ length: counts[d] }).map(() => d).join("")
            ) : (
              "—"
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PythagorTab({ dob, setDob, onResult }) {
  const [loading, setLoading] = React.useState(false);
  const [counts, setCounts] = React.useState(null);
  const quickDates = ["1995-03-21", "2001-10-10", "1988-07-14"];
  const canCalc = Boolean(dob);

  const onCalc = React.useCallback(() => {
    if (!canCalc) return;
    setLoading(true);
    try {
      const c = calcPythagorasCounts(dob);
      setCounts(c);
      onResult?.({ counts: c });
    } finally {
      setLoading(false);
    }
  }, [dob, canCalc, onResult]);

  return (
    <>
      <label className="block">
        <span className="text-sm" style={{ color: "var(--text)", opacity: 0.7 }}>Дата рождения</span>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="mt-1 w-full rounded-2xl px-4 py-3 outline-none border border-muted"
          style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {quickDates.map((d) => (
            <button key={d} type="button" onClick={() => setDob(d)}
                    className="rounded-xl px-3 py-1 text-xs border border-muted"
                    style={{ color: "var(--text)", background: "transparent" }}>
              {d}
            </button>
          ))}
        </div>
      </label>

      <div className="flex items-center gap-3">
        <button
          onClick={onCalc}
          disabled={!canCalc || loading}
          className="rounded-2xl px-5 py-3 font-semibold border border-muted disabled:opacity-60"
          style={{ background: "transparent", color: "var(--text)" }}
        >
          {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Считаем…</span> : "Рассчитать"}
        </button>

        {dob && !loading && (
          <button
            onClick={() => { setCounts(null); onResult?.(null); }}
            className="rounded-2xl px-4 py-3 text-sm border border-muted"
            style={{ background: "transparent", color: "var(--text)" }}
          >
            Очистить
          </button>
        )}
      </div>

      <MatrixGrid counts={counts} loading={loading} />

      {/* Ликбез */}
      <div className="rounded-3xl border border-muted p-6 mt-4"
           style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}>
        <h3 className="text-lg font-semibold">Как читать матрицу (Пифагор)</h3>
        <ul className="mt-3 list-disc pl-6 space-y-2 opacity-90">
          <li><b>1</b> — воля и инициатива</li>
          <li><b>2</b> — энергия и ресурсы</li>
          <li><b>3</b> — коммуникация и творчество</li>
          <li><b>5</b> — логика и структура</li>
          <li><b>9</b> — ценности и смысл</li>
        </ul>
      </div>
    </>
  );
}
