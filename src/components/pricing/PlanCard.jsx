import React from "react";
import Price from "./Price.jsx";
import { Check, Sparkles, Shield, Crown } from "lucide-react";

/**
 * Карточка тарифа (общая, переиспользуемая)
 * props:
 *  - plan: { slug, name, description, monthly, yearly, features[], badge?, highlighted? , cta? }
 *  - billing: 'monthly' | 'yearly'
 *  - onSelect: () => void
 *  - isActive: boolean            // этот тариф активен у пользователя
 *  - hasActive: boolean           // у пользователя есть любая активная подписка
 */
export default function PlanCard({
  plan,
  billing = "monthly",
  onSelect,
  isActive = false,
  hasActive = false,
}) {
  const price = billing === "monthly" ? plan?.monthly : plan?.yearly;
  const yearlyFull = (plan?.monthly ?? 0) * 12;
  const save =
    billing === "yearly" && price > 0 && yearlyFull > 0
      ? Math.max(0, Math.round((1 - price / yearlyFull) * 100))
      : 0;

  // если есть активная подписка — скрыть кнопку у free
  const hideCta = hasActive && plan?.slug === "free";
  // текст кнопки
  const ctaText = isActive ? "Продлить" : plan?.cta || "Выбрать";

  const Icon =
    plan?.slug === "free" ? Sparkles : plan?.slug === "pro" ? Shield : Crown;

  return (
    <article
      className={`rounded-3xl p-6 border bg-white/5 hover:bg-white/10 transition relative
      ${plan?.highlighted ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30" : "border-white/10"}`}
    >
      {plan?.badge && (
        <div className="absolute -top-3 left-6">
          <span
            className="rounded-xl px-3 py-1 text-xs font-semibold"
            style={{
              background:
                "linear-gradient(135deg, var(--accent), var(--primary))",
              color: "#fff",
            }}
          >
            {plan.badge}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <div
          className="h-10 w-10 rounded-2xl grid place-items-center text-white shadow-lg"
          style={{
            background:
              "linear-gradient(135deg, var(--accent), var(--primary))",
          }}
        >
          <Icon size={18} />
        </div>
        <h3 className="text-xl font-bold" style={{ color: "var(--text)" }}>
          {plan?.name}
        </h3>
      </div>

      {plan?.description && (
        <p className="opacity-80 text-sm mb-4">{plan.description}</p>
      )}

      <div className="flex items-center justify-between mb-2">
        <Price value={price} period={billing} />
        {save > 0 && (
          <span className="text-xs font-semibold rounded-lg px-2 py-1 bg-white/10">
            Экономия {save}%
          </span>
        )}
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {(plan?.features || []).map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check size={16} className="mt-0.5" style={{ color: "var(--primary)" }} />
            <span className="opacity-90">{f}</span>
          </li>
        ))}
      </ul>

      {!hideCta && (
        <button
          onClick={onSelect}
          className={`mt-6 w-full rounded-2xl px-4 py-3 font-semibold ${
            plan?.highlighted ? "btn-primary" : "btn-ghost"
          }`}
        >
          {ctaText}
        </button>
      )}
    </article>
  );
}
