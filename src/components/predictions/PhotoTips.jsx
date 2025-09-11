// src/components/predictions/PhotoTips.jsx
import React from "react";

export default function PhotoTips({ maxSizeMb = 12 }) {
  return (
    <section className="mt-10 grid lg:grid-cols-3 gap-6">
      <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
        <h3 className="font-semibold mb-3">Как сделать правильные фото</h3>
        <ol className="list-decimal list-inside space-y-2 opacity-90 text-sm">
          <li>Снимайте при рассеянном дневном свете, без вспышки и сильных бликов.</li>
          <li>Вымойте и высушите ладони, снимите кольца/браслеты.</li>
          <li>Сделайте фото <b>левой</b> и <b>правой</b> ладони, пальцы расслаблены и слегка раскрыты.</li>
          <li>Камеру держите перпендикулярно; добавьте 3-е фото — <b>крупный план линий</b>.</li>
          <li>JPG/PNG, ширина ≥ 1000 px, размер до {maxSizeMb} МБ.</li>
        </ol>
      </div>

      <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
        <h3 className="font-semibold mb-3">Хорошие примеры</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "🤚", label: "Левая", hint: "вся ладонь в кадре" },
            { icon: "🖐️", label: "Правая", hint: "ровный свет" },
            { icon: "🔍", label: "Крупный план", hint: "главные линии" },
          ].map((x, i) => (
            <div
              key={i}
              className="rounded-xl p-3 text-center border border-white/10 bg-gradient-to-br from-[var(--primary)]/15 to-[var(--accent)]/15"
            >
              <div className="text-2xl mb-2">{x.icon}</div>
              <div className="text-xs font-semibold">{x.label}</div>
              <div className="text-[11px] opacity-70">{x.hint}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
        <h3 className="font-semibold mb-3">Чего избегать</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "⚡", title: "Вспышка", hint: "жёсткие блики" },
            { icon: "🌀", title: "Размыто", hint: "нет резкости" },
            { icon: "↔️", title: "Далеко", hint: "мало деталей" },
          ].map((x, i) => (
            <div key={i} className="rounded-xl p-3 text-center border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">{x.icon}</div>
              <div className="text-xs font-semibold">{x.title}</div>
              <div className="text-[11px] opacity-70">{x.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
