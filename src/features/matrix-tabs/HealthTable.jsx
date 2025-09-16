import React from "react";

/**
 * Таблица «Карта здоровья».
 * props:
 *  - rows: [{n, name, sub, phys, energy, emo}] — опционально; если нет, ставятся "—"
 *  - totals: { phys, energy, emo } — опционально
 */
export default function HealthTable({ rows, totals }) {
  // Цвета ленты слева (как на макете)
  const band = {
    header: "#B8BEC9",   // серый
    1: "#6F3FF5",        // фиолетовый
    2: "#2979FF",        // синий
    3: "#24C4CF",        // бирюзовый
    4: "#7CC341",        // зелёный
    5: "#F2C037",        // жёлтый
    6: "#F59E0B",        // оранжевый
    7: "#EF4444",        // красный
    total: "#B8BEC9",    // серый (как у заголовка)
  };

  const defaultRows = [
    { n: 1, name: "Сахасрара",   sub: "Миссия" },
    { n: 2, name: "Аджна",       sub: "Судьба, эгрегоры" },
    { n: 3, name: "Вишудха",     sub: "Судьба, эгрегоры" },
    { n: 4, name: "Анахата",     sub: "Отношения, картина мира" },
    { n: 5, name: "Манипура",    sub: "Статус, владение" },
    { n: 6, name: "Свадхистана", sub: "Детская любовь и радость" },
    { n: 7, name: "Муладхара",   sub: "Тело, материя" },
  ];

  const data = rows && rows.length ? rows : defaultRows;

  const cellBg = (i) => (i % 2 ? "bg-black/5" : "");

  return (
    <div
      className="rounded-3xl border border-muted overflow-hidden"
      style={{ background: "color-mix(in srgb, var(--text) 4%, transparent)", color: "var(--text)" }}
    >
      {/* Заголовок таблицы */}
      <div className="relative px-4 py-3 border-b border-muted">
        <span className="absolute inset-y-0 left-0 w-3" style={{ background: band.header }} />
        <div className="pl-5">
          <div className="text-xl font-bold">Персональный расчёт</div>
          <div className="text-sm opacity-80">Карта здоровья</div>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-black/10">
          <tr>
            <th className="text-left px-4 py-3 w-16">#</th>
            <th className="text-left px-4 py-3">Название Чакры</th>
            <th className="text-center px-3 py-3 w-24">Физика</th>
            <th className="text-center px-3 py-3 w-24">Энергия</th>
            <th className="text-center px-3 py-3 w-24">Эмоции</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={r.n} className={cellBg(i)}>
              {/* Номер + цветная лента по всей высоте строки */}
              <td className="relative px-4 py-4 font-semibold">
                <span
                  className="absolute inset-y-0 left-0 w-3"
                  style={{ background: band[r.n] }}
                />
                <span className="pl-5">{r.n}</span>
              </td>

              {/* Название/подзаголовок */}
              <td className="px-4 py-4">
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs opacity-70">{r.sub}</div>
              </td>

              {/* Значения (пока могут быть пустыми) */}
              <td className="px-3 py-4 text-center">{r.phys ?? "—"}</td>
              <td className="px-3 py-4 text-center">{r.energy ?? "—"}</td>
              <td className="px-3 py-4 text-center">{r.emo ?? "—"}</td>
            </tr>
          ))}

          {/* Итог */}
          <tr>
            <td className="relative px-4 py-4 font-semibold">
              <span className="absolute inset-y-0 left-0 w-3" style={{ background: band.total }} />
              <span className="pl-5">Итог</span>
            </td>
            <td className="px-4 py-4 opacity-70">Общее энергополе</td>
            <td className="px-3 py-4 text-center">{totals?.phys ?? "—"}</td>
            <td className="px-3 py-4 text-center">{totals?.energy ?? "—"}</td>
            <td className="px-3 py-4 text-center">{totals?.emo ?? "—"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
