import React from "react";
import { Star } from "lucide-react";

export default function SpreadsTab({ savedSpreads = [] }) {
  return (
    <div className="panel-card p-6">
      <div className="flex items-center gap-2 mb-4"><Star size={18}/> <b>Мои расклады</b></div>
      <p className="opacity-80 text-sm mb-4">
        Позже подтянем список из DRF: <code>/api/spreads?ordering=-created</code>.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedSpreads.map(s=>(
          <article key={s.id} className="rounded-2xl p-4 border border-white/10 bg-white/5">
            <div className="text-sm opacity-70">{s.date}</div>
            <div className="font-semibold mt-1">{s.title}</div>
            <div className="text-sm opacity-80 mt-1">{s.result}</div>
            <div className="mt-3 flex gap-2">
              <button className="btn-ghost rounded-xl px-3 py-2 text-sm">Открыть</button>
              <button className="btn-ghost rounded-xl px-3 py-2 text-sm">Удалить</button>
            </div>
          </article>
        ))}
        {!savedSpreads.length && (
          <div className="opacity-60 text-sm">Пока нет сохранённых раскладов.</div>
        )}
      </div>
    </div>
  );
}
