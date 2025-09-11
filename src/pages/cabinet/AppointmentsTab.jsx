import React from "react";
import { CalendarDays } from "lucide-react";

export default function AppointmentsTab({ upcoming = [] }) {
  return (
    <div className="panel-card p-6">
      <div className="flex items-center gap-2 mb-4"><CalendarDays size={18}/> <b>Встречи</b></div>
      <p className="opacity-80 text-sm mb-4">Данные позже: <code>/api/appointments</code>.</p>
      <ul className="space-y-2">
        {upcoming.map(x=>(
          <li key={x.id} className="flex items-center gap-3 field-surface rounded-xl px-3 py-2">
            <CalendarDays size={16}/> <span className="opacity-80">{x.spec}</span>
            <span className="ml-auto">{x.time}</span>
            <button className="btn-ghost rounded-xl px-3 py-1 text-sm">Изменить</button>
          </li>
        ))}
        {!upcoming.length && <li className="opacity-60">Нет запланированных встреч.</li>}
      </ul>
      <div className="mt-4">
        <a href="/experts" className="btn-primary rounded-2xl px-4 py-2">Записаться к специалисту</a>
      </div>
    </div>
  );
}
