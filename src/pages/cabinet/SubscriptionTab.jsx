import React from "react";
import { Crown, CreditCard } from "lucide-react";

export default function SubscriptionTab({ sub }) {
  return (
    <div className="panel-card p-6">
      <div className="flex items-center gap-2 mb-4"><Crown size={18}/> <b>Подписка</b></div>
      <div className="text-sm opacity-80">
        Текущий тариф: <b>{sub.plan}</b><br/> Статус: {sub.status}<br/> Оплачено до: {sub.until}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href="/pricing" className="btn-primary rounded-2xl px-4 py-2">Продлить</a>
        <a href="/pricing" className="btn-ghost rounded-2xl px-4 py-2">Изменить тариф</a>
        <button className="btn-ghost rounded-2xl px-4 py-2"><CreditCard size={16}/> Способ оплаты</button>
      </div>
    </div>
  );
}
