// Оставляем только 2 темы: 05 (дефолт) и 04
export const THEMES = ['theme-mindful-05','theme-mindful-04'];

// Человекочитаемые названия тем для селекторов
export const THEME_LABELS = {
  'theme-mindful-05': 'Ночная вселенная',
  'theme-mindful-04': 'Закат и неон',
};

export function applyTheme(name) {
  const target = THEMES.includes(name)
    ? name
    : (window.__ENV?.DEFAULT_THEME || import.meta.env.VITE_DEFAULT_THEME || 'theme-mindful-05');
  const root = document.documentElement;
  THEMES.forEach(t => root.classList.remove(t));
  root.classList.add(target);
  localStorage.setItem('arcana_theme', target);
}

export function initTheme() {
  const saved = localStorage.getItem('arcana_theme');
  const runtime = window.__ENV?.DEFAULT_THEME;
  const vite = import.meta.env.VITE_DEFAULT_THEME;
  applyTheme(saved || runtime || vite || 'theme-mindful-05');
}
