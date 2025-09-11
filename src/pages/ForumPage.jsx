import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listThreads } from '../api/forum';
import { useAuth } from '../context/AuthContext';

const categories = ['Все','Общее','ИИ-Таро','Матрица','По кофе (ИИ)','По ладони (ИИ)','Гороскопы'];
const PAGE_SIZE = 10;

function Pagination({ page, pages, onPage }){
  if (pages <= 1) return null;
  const btn = (p, label=String(p)) => (
    <button
      key={label}
      onClick={()=>onPage(p)}
      className={`px-3 py-2 rounded-xl text-sm ${p===page ? 'bg-[var(--primary)] text-white' : 'hover:bg-white/10'}`}
    >{label}</button>
  );
  const arr = [];
  arr.push(btn(Math.max(1, page-1), '‹'));
  for (let i=1;i<=pages;i++){
    if (i===1 || i===pages || Math.abs(i-page)<=1) arr.push(btn(i));
    else if (!arr.some(x => x?.key === '…')) arr.push(<span key="…" className="px-2 opacity-60">…</span>);
  }
  arr.push(btn(Math.min(pages, page+1), '›'));
  return <div className="flex flex-wrap gap-2">{arr}</div>;
}

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
};

export default function ForumPage(){
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  const [q, setQ] = React.useState(params.get('search') || '');
  const [cat, setCat] = React.useState(params.get('category') || 'Все');
  const [page, setPage] = React.useState(Number(params.get('page') || 1));
  const [data, setData] = React.useState({ results:[], count:0 });
  const [loading, setLoading] = React.useState(true);

  // баннер после создания темы (модерация)
  const pendingBanner = params.get('pending') === '1';

  // загрузка списка
  React.useEffect(()=>{
    let off=false;
    setLoading(true);
    (async ()=>{
      const payload = await listThreads({ page, page_size: PAGE_SIZE, search:q, category:cat });
      if (!off) { setData(payload); setLoading(false); }
    })();
    return ()=>{ off=true };
  }, [page, q, cat]);

  // синхронизация с URL
  React.useEffect(()=>{
    const next = new URLSearchParams();
    if (q) next.set('search', q);
    if (cat && cat!=='Все') next.set('category', cat);
    if (page>1) next.set('page', String(page));
    if (pendingBanner) next.set('pending', '1');
    setParams(next, { replace:true });
  }, [q, cat, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil((data.count || 0)/PAGE_SIZE));
  const onPage = (p)=> setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <main className="page">
      <div className="container mx-auto px-4 max-w-7xl py-10">
        {pendingBanner && (
          <div className="mb-4 rounded-2xl p-4 border border-white/10 bg-white/5">
            Тема отправлена на модерацию. Она появится в списке после одобрения.
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="h1 mb-2">Форум</h1>
            <p className="opacity-80">Обсуждения по ИИ-Таро, Матрице, кофе, ладони и гороскопам.</p>
          </div>
          {user ? (
            <Link to="/forum/new" className="btn-primary rounded-2xl px-4 py-2 text-sm">+ Создать тему</Link>
          ) : (
            <Link to="/login?next=/forum/new" className="btn-primary rounded-2xl px-4 py-2 text-sm">+ Создать тему</Link>
          )}
        </div>

        {/* Фильтры */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={q}
            onChange={e=>{ setQ(e.target.value); setPage(1); }}
            placeholder="Поиск по темам…"
            className="btn-ghost rounded-2xl px-4 py-3 text-sm w-full sm:w-96"
          />
          <div className="rounded-2xl p-1 bg-white/5 border border-white/10 flex flex-wrap gap-1">
            {categories.map(c=>(
              <button
                key={c}
                onClick={()=>{ setCat(c); setPage(1); }}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  cat===c ? 'bg-[var(--primary)] text-white' : 'text-[var(--text)]/80 hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Список тем */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          {loading && <div className="p-6 bg-white/5 animate-pulse">Загрузка…</div>}
          {!loading && data.results.map(t=>(
            <Link
              key={t.id}
              to={`/forum/${t.slug}`}
              className="block border-b border-white/10 bg-white/5 hover:bg-white/10 transition"
            >
              <div className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold" style={{color:'var(--text)'}}>{t.title}</div>
                  {/* DRF: author_name */}
                  <div className="text-xs opacity-70">{t.category} • Автор: {t.author_name || 'Гость'}</div>
                </div>
                <div className="text-sm opacity-80 text-right">
                  <div>{t.replies ?? 0} ответов</div>
                  {/* DRF: updated_at */}
                  <div className="opacity-70">обновлено: {fmtDate(t.updated_at)}</div>
                </div>
              </div>
            </Link>
          ))}
          {!loading && (data.results?.length===0) && (
            <div className="px-5 py-6 text-sm opacity-70">Ничего не найдено.</div>
          )}
        </div>

        {/* Пагинация */}
        <div className="mt-6">
          <Pagination page={page} pages={totalPages} onPage={onPage} />
        </div>

        <p className="opacity-60 text-xs mt-6">
          DRF: <code>/api/forum/threads/?page=&page_size=&search=&category=</code> (в списке — только одобренные темы).
        </p>
      </div>
    </main>
  );
}
