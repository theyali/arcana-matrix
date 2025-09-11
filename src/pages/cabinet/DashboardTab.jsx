import React from "react";
import { User, Sparkles, CalendarDays, Star, Crown } from "lucide-react";

export default function DashboardTab({ displayName, username, avatarUrl, today, sub, aura, savedSpreads, upcoming }) {
  return (
    <div className="space-y-6">
      {/* приветствие */}
      <div className="panel-card p-6 md:p-8">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-14 w-14 rounded-2xl object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-2xl grid place-items-center text-white"
                 style={{background:"linear-gradient(135deg,var(--primary),var(--accent))"}}>
              <User />
            </div>
          )}
          <div className="flex-1">
            <div className="text-xl font-bold" style={{color:"var(--text)"}}>
              Привет, {displayName}!
            </div>
            <div className="text-sm opacity-70">
              {today}
              {username ? <> · Логин: <b>@{username}</b></> : null}
              {sub?.plan ? <> · Подписка: <b>{sub.plan}</b></> : null}
              {sub?.status ? <> ({sub.status}{sub?.until ? `, до ${sub.until}` : ""})</> : null}
            </div>
          </div>
        </div>
      </div>

      {/* мини-виджеты */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Аура */}
        <div className="panel-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18}/> <b>Аура на сегодня</b>
          </div>
          <div className="text-sm opacity-80">Цвет: <b>{aura.color}</b></div>
          <div className="text-sm opacity-80">Состояние: {aura.mood}</div>
          <div className="mt-3 text-sm">Совет: {aura.tip}</div>
        </div>

        {/* Подписка */}
        <div className="panel-card p-6">
          <div className="flex items-center gap-2 mb-3"><Crown size={18}/> <b>Подписка</b></div>
          <div className="text-sm opacity-80">
            Тариф: <b>{sub.plan}</b><br/> Статус: {sub.status}<br/> Оплачено до: {sub.until}
          </div>
          <div className="mt-4 flex gap-2">
            <a href="/pricing" className="btn-primary rounded-2xl px-4 py-2">Продлить</a>
            <a href="/pricing" className="btn-ghost rounded-2xl px-4 py-2">Изменить тариф</a>
          </div>
        </div>

        {/* Встречи */}
        <div className="panel-card p-6">
          <div className="flex items-center gap-2 mb-3"><CalendarDays size={18}/> <b>Ближайшие встречи</b></div>
          <ul className="space-y-2 text-sm">
            {upcoming?.length ? upcoming.map(x=>(
              <li key={x.id} className="flex items-center gap-2 field-surface rounded-xl px-3 py-2">
                <CalendarDays size={16} /> <span className="opacity-80">{x.spec}</span>
                <span className="ml-auto">{x.time}</span>
              </li>
            )) : <li className="opacity-60">Нет записей</li>}
          </ul>
        </div>
      </div>

      {/* Сохранённые расклады */}
      <div className="panel-card p-6">
        <div className="flex items-center gap-2 mb-3"><Star size={18}/> <b>Сохранённые расклады</b></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="opacity-70">
              <tr>
                <th className="text-left py-2">Дата</th>
                <th className="text-left py-2">Название</th>
                <th className="text-left py-2">Итог</th>
              </tr>
            </thead>
            <tbody>
              {savedSpreads?.map(s=>(
                <tr key={s.id} className="border-t" style={{borderColor:"var(--muted)"}}>
                  <td className="py-2">{s.date}</td>
                  <td className="py-2">{s.title}</td>
                  <td className="py-2 opacity-80">{s.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="btn-ghost rounded-2xl px-4 py-2">Все расклады</button>
          <button className="btn-primary rounded-2xl px-4 py-2"><Star size={16}/> Новый расклад</button>
        </div>
      </div>
    </div>
  );
}
