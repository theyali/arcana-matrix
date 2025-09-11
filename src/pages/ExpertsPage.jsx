// src/pages/ExpertsPage.jsx
import React from 'react';
import { Star } from 'lucide-react';

const mockExperts = [
  { id:1, name:'Алина Орлова', tags:['ИИ-Таро','Гороскопы'], rating:4.9, reviews:127, price:2500 },
  { id:2, name:'Мария Хан', tags:['Матрица'], rating:4.7, reviews:80, price:2200 },
  { id:3, name:'Эмиль Рашидов', tags:['По кофе (ИИ)','ИИ-Таро'], rating:4.8, reviews:96, price:2400 },
  { id:4, name:'Дина Громова', tags:['По ладони (ИИ)'], rating:4.6, reviews:60, price:2000 },
  { id:5, name:'Илья Сорокин', tags:['Гороскопы','Матрица'], rating:4.5, reviews:51, price:1800 },
  { id:6, name:'Нелли Вега', tags:['ИИ-Таро'], rating:4.9, reviews:210, price:3000 },
];

function Stars({value}) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-1">
      {[...Array(5)].map((_,i)=>(
        <Star key={i} size={16}
          className={i < full ? 'fill-current text-yellow-400' : (i===full && half ? 'text-yellow-400' : 'opacity-40')}
          style={i < full ? {color:'#fde047'} : (i===full && half ? {color:'#fde047'} : {})}
        />
      ))}
    </span>
  );
}

export default function ExpertsPage(){
  const [q, setQ] = React.useState('');
  const allTags = Array.from(new Set(mockExperts.flatMap(e=>e.tags)));
  const [tag, setTag] = React.useState('Все');
  const [sort, setSort] = React.useState('rating');

  const filtered = mockExperts
    .filter(e => (tag==='Все' || e.tags.includes(tag)))
    .filter(e => e.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a,b)=>{
      if (sort==='rating') return b.rating - a.rating;
      if (sort==='price_asc') return a.price - b.price;
      if (sort==='price_desc') return b.price - a.price;
      return 0;
    });

  return (
    <main className="page">
      <div className="container mx-auto px-4 max-w-7xl py-10">
        <h1 className="h1 mb-6">Специалисты</h1>

        {/* Фильтры */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Поиск по имени…"
            className="btn-ghost rounded-2xl px-4 py-3 text-sm w-full sm:w-80"
          />
          <select value={tag} onChange={e=>setTag(e.target.value)} className="btn-ghost rounded-2xl px-3 py-2 text-sm">
            <option>Все</option>
            {allTags.map(t=><option key={t}>{t}</option>)}
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value)} className="btn-ghost rounded-2xl px-3 py-2 text-sm">
            <option value="rating">Сначала рейтинг</option>
            <option value="price_asc">Цена ↑</option>
            <option value="price_desc">Цена ↓</option>
          </select>
        </div>

        {/* Сетка карточек */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(x=>(
            <article key={x.id} className="rounded-2xl p-5 border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <div className="flex items-center gap-4">
                <div
                  className="h-14 w-14 rounded-2xl grid place-items-center text-lg font-bold shadow-lg"
                  style={{background:'linear-gradient(135deg, var(--accent), var(--primary))', color:'#fff'}}
                >
                  {x.name.split(' ').map(p=>p[0]).join('').slice(0,2)}
                </div>
                <div>
                  <div className="font-semibold" style={{color:'var(--text)'}}>{x.name}</div>
                  <div className="text-xs opacity-70">{x.tags.join(' • ')}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm opacity-80 flex items-center gap-2">
                  <Stars value={x.rating}/>
                  <span>{x.rating.toFixed(1)} ({x.reviews})</span>
                </div>
                <div className="text-sm font-semibold">{x.price.toLocaleString()} ₽</div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <a href="#" className="btn-ghost rounded-2xl px-4 py-2 text-sm">Профиль</a>
                <a href="/register" className="btn-primary rounded-2xl px-4 py-2 text-sm">Записаться</a>
              </div>
            </article>
          ))}
        </div>

        {/* Подсказка про DRF */}
        <p className="opacity-60 text-xs mt-6">
          Позже эти данные подгружаются из DRF, напр. <code>/api/experts?search=&tag=&ordering=</code>.
        </p>
      </div>
    </main>
  );
}
