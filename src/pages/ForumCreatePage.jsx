// src/pages/ForumCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createThread } from '../api/forum';

const categories = ['Общее','ИИ-Таро','Матрица','По кофе (ИИ)','По ладони (ИИ)','Гороскопы'];

export default function ForumCreatePage(){
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState(categories[0]);
  const [content, setContent] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');

  const canSubmit = title.trim().length >= 8 && content.trim().length >= 20;

  const onSubmit = async (e)=>{
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true); setErr('');
    try {
      const created = await createThread({
        title: title.trim(),
        category,
        content: content.trim()
      });
      // если модерация включена — чаще всего статус pending
      if (created?.status === 'approved' && created?.id) {
        navigate(`/forum/${created.id}`, { replace:true });
      } else {
        navigate('/forum?pending=1', { replace:true });
      }
    } catch (e) {
      setErr('Не удалось создать тему. Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page">
      <div className="container mx-auto px-4 max-w-3xl py-10">
        <h1 className="h1 mb-2">Создать тему</h1>
        <p className="opacity-80 mb-6">Поделитесь вопросом или опытом — сообщество поможет.</p>

        <form onSubmit={onSubmit} className="panel-card p-6 space-y-4">
          <label className="block text-sm opacity-80">
            Заголовок
            <input
              className="w-full mt-1 field-surface rounded-xl px-3 py-2"
              placeholder="Коротко и по делу…"
              value={title}
              onChange={e=>setTitle(e.target.value)}
              maxLength={160}
              required
            />
          </label>

          <label className="block text-sm opacity-80">
            Категория
            <select
              className="w-full mt-1 field-surface rounded-xl px-3 py-2"
              value={category}
              onChange={e=>setCategory(e.target.value)}
            >
              {categories.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="block text-sm opacity-80">
            Сообщение
            <textarea
              className="w-full mt-1 field-surface rounded-xl px-3 py-2 h-40"
              placeholder="Опишите детали, добавьте примеры…"
              value={content}
              onChange={e=>setContent(e.target.value)}
              required
            />
          </label>

          {err && <div className="text-sm text-red-400">{err}</div>}

          <div className="flex gap-2">
            <button type="submit" disabled={!canSubmit || busy}
                    className="btn-primary rounded-2xl px-4 py-2">
              {busy ? 'Создаём…' : 'Опубликовать'}
            </button>
            <button type="button" className="btn-ghost rounded-2xl px-4 py-2"
                    onClick={()=>navigate('/forum')}>Отмена</button>
          </div>

          <p className="opacity-60 text-xs">
            Отправится POST на <code>/api/forum/threads/</code>, статус — на модерации.
          </p>
        </form>
      </div>
    </main>
  );
}
