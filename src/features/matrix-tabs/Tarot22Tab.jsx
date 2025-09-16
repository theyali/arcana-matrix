// src/features/matrix-tabs/Tarot22Tab.jsx
import React from "react";
import { Loader2 } from "lucide-react";
import { calcMatrix } from "../../api/matrix";
import HealthTable from "./HealthTable"; // ⬅️ новый импорт

/** SVG + HTML из бэка как соседи внутри .matrix-diagram */
function MatrixServerDiagram({ html }) {
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!html) {
      root.innerHTML = "";
      return;
    }

    // Сначала SVG, затем HTML от сервера — оба прямые дети .matrix-diagram
    root.innerHTML = `
      <div class="matrix-diagram__svg" aria-hidden="true">
        <img src="/img/main.svg" alt="" />
      </div>
      ${html}
    `;

    return () => { if (root) root.innerHTML = ""; };
  }, [html]);

  return (
    <>
      <style>{`
        .matrix-diagram { position: relative; }
        .matrix-diagram__svg img { width: 100%; height: auto; display: block; }
      `}</style>
      <div
        ref={rootRef}
        className="matrix-diagram rounded-3xl border border-muted p-3 relative overflow-hidden"
        style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}
      />
    </>
  );
}

export default function Tarot22Tab({ dob, setDob, onResult }) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName,  setLastName]  = React.useState("");
  const [gender,    setGender]    = React.useState("other"); // male | female | other

  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState("");
  const [html, setHtml]       = React.useState("");
  const abortRef = React.useRef(null);

  const canCalc = Boolean(dob);
  const quickDates = ["1995-03-21", "2001-10-10", "1988-07-14"];

  const onCalc = React.useCallback(async () => {
    if (!canCalc) return;
    setError(""); setLoading(true); setHtml(""); onResult?.(null);
    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      // Шлём все поля — бэк сохранит их в истории
      const data = await calcMatrix(
        { first_name: firstName, last_name: lastName, gender, birth_date: dob },
        { signal: abortRef.current.signal }
      );

      const htmlStr = data?.html || "";
      setHtml(htmlStr);
      onResult?.({
        ...(data || {}),
        inputs: { first_name: firstName, last_name: lastName, gender, birth_date: dob },
        html: htmlStr,
      });
    } catch (e) {
      setError(e?.message || "Ошибка запроса");
    } finally {
      setLoading(false);
    }
  }, [dob, canCalc, firstName, lastName, gender, onResult]);

  React.useEffect(() => () => { try { abortRef.current?.abort(); } catch {} }, []);

  return (
    <>
      {/* ===== Верхняя зона: слева форма (2/3), справа инфоблок (1/3) ===== */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Форма */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm" style={{ color: "var(--text)", opacity: 0.7 }}>Имя</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Имя"
                className="mt-1 w-full rounded-2xl px-4 py-3 outline-none border border-muted"
                style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}
              />
            </label>

            <label className="block">
              <span className="text-sm" style={{ color: "var(--text)", opacity: 0.7 }}>Фамилия</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Фамилия"
                className="mt-1 w-full rounded-2xl px-4 py-3 outline-none border border-muted"
                style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}
              />
            </label>

            <label className="block">
              <span className="text-sm" style={{ color: "var(--text)", opacity: 0.7 }}>Пол</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 w-full rounded-2xl px-4 py-3 outline-none border border-muted"
                style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}
              >
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="other">Другое</option>
              </select>
            </label>

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
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCalc}
              disabled={!canCalc || loading}
              className="rounded-2xl px-5 py-3 font-semibold border border-muted disabled:opacity-60"
              style={{ background: "transparent", color: "var(--text)" }}
            >
              {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Считаем…</span> : "Рассчитать"}
            </button>
            {(dob || firstName || lastName) && !loading && (
              <button
                onClick={() => { onResult?.(null); setError(""); setHtml(""); setFirstName(""); setLastName(""); setGender("other"); }}
                className="rounded-2xl px-4 py-3 text-sm border border-muted"
                style={{ background: "transparent", color: "var(--text)" }}
              >
                Очистить
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" role="status" aria-live="polite"
                 style={{ background: "color-mix(in srgb, var(--text) 8%, transparent)", color: "var(--text)" }}>
              Ошибка: {error}
            </div>
          )}
        </div>

        {/* Инфоблок справа */}
        <div
          className="rounded-3xl border border-muted p-6"
          style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}
        >
          <h3 className="text-lg font-semibold">Как читать матрицу (22 Аркана)</h3>
          <ul className="mt-3 list-disc pl-6 space-y-2 opacity-90 text-sm">
            <li><b>Центр</b>: ядро личности; ниже — «зона комфорта».</li>
            <li><b>Вертикальная ось</b>: устремления (верх) и реализация (низ).</li>
            <li><b>Диагонали</b>: синяя — мужской род, розовая — женский.</li>
            <li><b>Периметр</b>: ключевые рубежи десятилетий.</li>
            <li><b>Октагон</b>: жизненный цикл по часовой стрелке.</li>
          </ul>
          <div className="mt-4 text-sm opacity-70">Подробные расшифровки — в тарифах Pro и Expert.</div>
        </div>
      </div>

      {/* ===== Нижняя зона: появляется только ПОСЛЕ расчёта ===== */}
      {html && (
        <div className="mt-8 grid md:grid-cols-3 gap-6 items-start">
          {/* Таблица 1/3 */}
          <div className="md:col-span-1">
            {/* передашь реальные rows/totals позже, сейчас скелет */}
            <HealthTable />
          </div>

          {/* Матрица 2/3 */}
          <div className="md:col-span-2">
            <MatrixServerDiagram html={html} />
          </div>
        </div>
      )}
    </>
  );
}
