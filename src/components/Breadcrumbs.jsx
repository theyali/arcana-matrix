// src/components/Breadcrumbs.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';
import { getZodiac } from '../features/horoscope/zodiac'; // есть из предыдущей части

export default function Breadcrumbs(){
  const location = useLocation();
  const { pathname, search } = location;

  // не показываем на главной
  if (pathname === '/' || pathname === '') return null;

  const parts = pathname.split('/').filter(Boolean); // ['', 'predictions', ...] → ['predictions', ...]
  let acc = '';
  const keepSearch = (p) =>
    p.startsWith('/predictions/horoscope') ? search : ''; // оставляем фильтры гороскопов

  const crumbs = [
    { label: 'Главная', href: '/' },
    ...parts.map((seg, idx) => {
      acc += `/${seg}`;
      let label = seg;

      // Человекочитаемые подписи
      if (acc === '/predictions') label = 'Предсказания';
      if (acc === '/predictions/tarot') label = 'ИИ-Таро';
      if (acc === '/predictions/matrix') label = 'Матрица';
      if (acc === '/predictions/palm') label = 'По ладони (ИИ)';
      if (acc === '/predictions/coffee') label = 'По кофе (ИИ)';
      if (acc === '/predictions/horoscope') label = 'Гороскопы';
      if (acc === '/pricing') label = 'Подписка';
      if (acc === '/cabinet') label = 'Личный кабинет';
      if (acc === '/forum') label = 'Форум';
      if (acc === '/login') label = 'Авторизация';
      if (acc === '/register') label = 'Регистрация';
      if (acc === '/analysis') label = 'Анализ';
      if (acc === '/analysis/handwriting') label = 'Анализ почерка';

      // Динамический знак: /predictions/horoscope/:sign
      const prev = parts[idx - 1];
      if (prev === 'horoscope') {
        const z = getZodiac(seg);
        label = z?.name || seg;
      }

      // Последний крошке href не нужен
      const isLast = idx === parts.length - 1;
      return {
        label,
        href: isLast ? null : acc + keepSearch(acc),
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
                <span className="opacity-60">{c.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
