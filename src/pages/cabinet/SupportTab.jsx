import React from "react";
import { HelpCircle, MessageSquare } from "lucide-react";

export default function SupportTab({ contacts }) {
  return (
    <div className="panel-card p-6">
      <div className="flex items-center gap-2 mb-4"><HelpCircle size={18}/> <b>Поддержка</b></div>
      <p className="opacity-80 text-sm mb-4">Свяжись с нами — поможем быстро.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href={`mailto:${contacts.email}`} className="rounded-2xl p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition">
          <div className="font-semibold">E-mail</div>
          <div className="opacity-80 text-sm">{contacts.email}</div>
        </a>
        <a href={`tel:${contacts.tel.replace(/\s+/g,'')}`} className="rounded-2xl p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition">
          <div className="font-semibold">Телефон</div>
          <div className="opacity-80 text-sm">{contacts.tel}</div>
        </a>
        <a href={`https://t.me/${contacts.tg.replace('@','')}`} target="_blank" rel="noreferrer"
           className="rounded-2xl p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition">
          <div className="font-semibold">Telegram</div>
          <div className="opacity-80 text-sm">{contacts.tg}</div>
        </a>
      </div>
      <div className="mt-6">
        <button className="btn-ghost rounded-2xl px-4 py-2"><MessageSquare size={16}/> Открыть тикет</button>
      </div>
    </div>
  );
}
