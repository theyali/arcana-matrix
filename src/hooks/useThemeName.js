// src/hooks/useThemeName.js
import React from 'react'
import { THEMES } from '../theme/themes';

export default function useThemeName() {
  const getTheme = () => {
    const cls = document.documentElement.classList;
    const active = THEMES.find(t => cls.contains(t));
    return active || localStorage.getItem('arcana_theme') || 'theme-mindful-05';
  };

  const [theme, setTheme] = React.useState(getTheme);

  React.useEffect(() => {
    const onChange = (e) => setTheme(e.detail?.theme || getTheme());
    window.addEventListener('arcana:theme', onChange);
    return () => window.removeEventListener('arcana:theme', onChange);
  }, []);

  return theme;
}
