import React from 'react';

const ALL = [
  // популярные
  '🙂','😊','😍','👍','🙌','💬','❓','❤️','🔥','✨','⭐️',
  // эзотерика/астро
  '🌙','🔮','🃏','☕️','✋','🪐','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓',
  // ещё немного
  '😅','😎','🤔','🤯','😴','🥳','😇','🤝','🙏','💫','🧿',
];

/**
 * Простой пикер эмодзи.
 * Props:
 * - onSelect(emoji)
 * - onClose()
 * - className (доп. классы для контейнера)
 */
export default function EmojiPicker({ onSelect, onClose, className='' }) {
  const [q, setQ] = React.useState('');
  const list = React.useMemo(() => {
    if (!q.trim()) return ALL;
    const s = q.trim().toLowerCase();
    return ALL.filter(e => e.toLowerCase().includes(s));
  }, [q]);

  return (
    <div
      className={`emoji-popover rounded-2xl p-3 border shadow-2xl w-64 ${className}`}
      // плотный, небликующий фон
      style={{
        background: 'rgba(12,14,20,0.96)',
        borderColor: 'rgba(255,255,255,0.18)',
        boxShadow: '0 12px 32px rgba(0,0,0,.45)',
        WebkitBackdropFilter: 'saturate(120%) blur(2px)',
        backdropFilter: 'saturate(120%) blur(2px)',
      }}
      role="dialog"
      aria-label="Выбор эмодзи"
    >
      <input
        autoFocus
        value={q}
        onChange={e=>setQ(e.target.value)}
        placeholder="Поиск…"
        className="w-full rounded-xl px-3 py-2 text-sm mb-2 outline-none"
        style={{
          background:'rgba(255,255,255,0.08)',
          color:'var(--text)',
          border:'1px solid rgba(255,255,255,0.15)'
        }}
      />
      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-auto pr-1">
        {list.map((e, i)=>(
          <button
            key={i}
            type="button"
            className="text-xl hover:bg-white/10 rounded-lg leading-[36px] transition"
            onClick={()=>{ onSelect?.(e); onClose?.(); }}
            aria-label={`Вставить ${e}`}
          >
            {e}
          </button>
        ))}
        {!list.length && (
          <div className="col-span-8 text-center text-xs opacity-60 py-4">Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}
