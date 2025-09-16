// Общий вид цены (можно переиспользовать где угодно)
import React from "react";

export default function Price({ value, period = "monthly" }) {
  const isFree = !value || Number(value) === 0;
  return (
    <div className="flex items-end gap-1">
      <span className="text-3xl font-extrabold" style={{ color: "var(--text)" }}>
        {isFree ? "0" : Number(value).toLocaleString("ru-RU")}
      </span>
      <span className="opacity-70 text-sm mb-1">
        ₽ / {period === "yearly" ? "год" : "мес"}
      </span>
    </div>
  );
}
