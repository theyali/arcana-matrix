// src/pages/Settings.jsx
import React from "react";
import { THEMES, THEME_LABELS, applyTheme } from "../theme/themes";
export default function Settings(){
  const [theme, setTheme] = React.useState(localStorage.getItem('arcana_theme') || THEMES[0]);
  const onChange = (v)=>{ setTheme(v); applyTheme(v); localStorage.setItem('arcana_theme', v); };

  return (
    <div className="container mx-auto px-4 max-w-6xl py-10">
      <div className="panel-card p-6 md:p-8">
        <div className="text-2xl font-bold mb-4" style={{color:"var(--text)"}}>Настройки</div>
        <div className="space-y-2" style={{color:"var(--text)"}}>
          <label className="block text-sm opacity-80">Тема</label>
          <select value={theme} onChange={e=>onChange(e.target.value)} className="btn-ghost rounded-2xl px-3 py-2">
            {THEMES.map(t => <option key={t} value={t}>{THEME_LABELS[t] || t}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
