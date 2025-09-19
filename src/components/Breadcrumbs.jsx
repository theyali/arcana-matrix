// src/components/Breadcrumbs.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';
import { getZodiac } from '../features/horoscope/zodiac';

const LANGS = ['en', 'ru', 'uk'];

export default function Breadcrumbs(){
  const location = useLocation();
  const { pathname, search } = location;

  const rawParts = pathname.split('/').filter(Boolean);
  const lang = rawParts[0] && LANGS.includes(rawParts[0]) ? rawParts[0] : null;

  // Префикс языка для ссылок (у EN префикса нет)
  const langPrefix = lang && lang !== 'en' ? `/${lang}` : '';

  // Крошки строим по пути без языкового сегмента
  const parts = lang ? rawParts.slice(1) : rawParts;

  // --- Новая проверка: на главной (/, /ru, /uk) ничего не показываем ---
  if (parts.length === 0) return null;

  // Утилита: убрать язык из пути
  const stripLang = (p) => p.replace(/^\/(en|ru|uk)(?=\/|$)/, '');

  // Сохраняем параметры только на страницах гороскопов
  const keepSearch = (p) => stripLang(p).startsWith('/predictions/horoscope') ? search : '';

  // Ссылка "Главная": ведёт в корень текущего языка (или просто "/" для EN)
  const homeHref = langPrefix || '/';

  let acc = langPrefix; // начинаем с языкового префикса, чтобы ссылки были корректными

  const crumbs = [
    { label: 'Главная', href: homeHref },
    ...parts.map((seg, idx) => {
      acc += `/${seg}`;                     // накапливаем путь с префиксом
      const accNoLang = stripLang(acc);     // нормализованный путь без префикса
      let label = seg;

      // Человекочитаемые подписи (сопоставляем по пути БЕЗ языка)
      if (accNoLang === '/predictions') label = 'Предсказания';
      if (accNoLang === '/predictions/tarot') label = 'ИИ-Таро';
      if (accNoLang === '/predictions/matrix') label = 'Матрица';
      if (accNoLang === '/predictions/palm') label = 'По ладони (ИИ)';
      if (accNoLang === '/predictions/coffee') label = 'По кофе (ИИ)';
      if (accNoLang === '/predictions/horoscope') label = 'Гороскопы';
      if (accNoLang === '/pricing') label = 'Подписка';
      if (accNoLang === '/cabinet') label = 'Личный кабинет';
      if (accNoLang === '/forum') label = 'Форум';
      if (accNoLang === '/login') label = 'Авторизация';
      if (accNoLang === '/register') label = 'Регистрация';
      if (accNoLang === '/analysis') label = 'Анализ';
      if (accNoLang === '/analysis/handwriting') label = 'Анализ почерка';
      if (accNoLang === '/analysis/face') label = 'ИИ анализ';

      // Динамический знак: /predictions/horoscope/:sign
      const prev = parts[idx - 1];
      if (prev === 'horoscope') {
        const z = getZodiac(seg);
        label = z?.name || seg;
      }

      const isLast = idx === parts.length - 1;

      const isHub = accNoLang === '/predictions' || accNoLang === '/analysis';

      return {
        label,
        href: (isLast || isHub) ? null : acc + keepSearch(acc),
      };
    }),
  ];

  return (
    <nav aria-label="Хлебные крошки" className="bg-transparent">
      <div className="container mx-auto px-4 max-w-7xl">
        <ol className="flex items-center gap-2 py-3 text-sm">
          {crumbs.map((c, i) => (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight size={16} className="opacity-50" aria-hidden />}

              {c.href ? (
                <Link to={c.href} className="hover:underline opacity-80 hover:opacity-100">
                  {i === 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <HomeIcon size={16} className="opacity-80" />
                      {c.label}
                    </span>
                  ) : (
                    c.label
                  )}
                </Link>
              ) : (
                <span className="opacity-60">
                  {i === 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <HomeIcon size={16} className="opacity-80" />
                      {c.label}
                    </span>
                  ) : (
                    c.label
                  )}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
