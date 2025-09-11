import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getThread, createPost } from '../api/forum';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, MessageCircle, Share2, UserRound, Send, Lock,
  Loader2, CornerDownRight, X, Smile
} from 'lucide-react';
import EmojiPicker from '../components/EmojiPicker';

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
};

export default function ForumThreadPage(){
  const { slug } = useParams();
  const { user } = useAuth();

  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState('');

  // reply form
  const [reply, setReply] = React.useState('');
  const [replyTo, setReplyTo] = React.useState(null); // { id, author_name, created_at, excerpt }
  const [sending, setSending] = React.useState(false);
  const [notice, setNotice] = React.useState(''); // для "Ссылка скопирована"
  const [showPicker, setShowPicker] = React.useState(false);

  // для поповера — фиксированное позиционирование
  const emojiBtnRef = React.useRef(null);
  const pickerRef = React.useRef(null);
  const [pickerPos, setPickerPos] = React.useState({ top: 0, left: 0 });
  const textareaRef = React.useRef(null);

  // плавное появление новых постов
  const [appearingIds, setAppearingIds] = React.useState(()=> new Set());

  // вставка эмодзи в курсор
  const insertAtCursor = (text) => {
    const ta = textareaRef.current;
    if (!ta) { setReply(prev => prev + text); return; }
    const start = ta.selectionStart ?? reply.length;
    const end = ta.selectionEnd ?? reply.length;
    const next = reply.slice(0, start) + text + reply.slice(end);
    setReply(next);
    requestAnimationFrame(()=>{
      ta.focus({ preventScroll: true });
      const pos = start + text.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const positionPicker = React.useCallback(() => {
    const btn = emojiBtnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const PAD = 8;
    const W = 272, H = 268; // примерно
    let left = Math.min(Math.max(8, r.right - W), window.innerWidth - W - 8);
    let top = r.bottom + PAD;
    if (top + H > window.innerHeight - 8) {
      top = Math.max(8, r.top - H - PAD); // показываем над кнопкой
    }
    setPickerPos({ top, left });
  }, []);

  // закрытие поповера при клике вне/скролле/резайзе
  React.useEffect(()=>{
    if (!showPicker) return;
    const onDoc = (e) => {
      if (
        pickerRef.current && !pickerRef.current.contains(e.target) &&
        emojiBtnRef.current && !emojiBtnRef.current.contains(e.target)
      ) setShowPicker(false);
    };
    const onScrollOrResize = () => setShowPicker(false);
    window.addEventListener('mousedown', onDoc);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return ()=>{
      window.removeEventListener('mousedown', onDoc);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [showPicker]);

  const load = React.useCallback(async ()=>{
    setErr('');
    setLoading(true);
    try {
      const t = await getThread(slug);
      setData(t);
    } catch (e) {
      setErr('Тема не найдена или недоступна.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  React.useEffect(()=>{ load(); }, [load]);

  const copyLink = async ()=>{
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice('Ссылка скопирована');
      setTimeout(()=>setNotice(''), 2000);
    } catch {}
  };

  const onReply = async (e)=>{
    e.preventDefault();
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      const newPost = await createPost({
        threadSlug: slug,
        content: reply.trim(),
        reply_to: replyTo?.id || null,
      });

      // очистим форму
      setReply('');
      setReplyTo(null);

      // оптимистично добавим пост без полного reload
      setData(prev => {
        const next = { ...prev, posts: [ ...(prev?.posts || []), newPost ], replies: (prev?.replies||0)+1 };
        return next;
      });

      // анимация появления
      setAppearingIds(prev => {
        const n = new Set(prev); n.add(newPost.id); return n;
      });
      // дернём в следующий тик, чтобы отработал transition
      setTimeout(()=>{
        setAppearingIds(prev => {
          const n = new Set(prev); n.delete(newPost.id); return n;
        });
        // скролл к новому посту
        const el = document.getElementById(`p-${newPost.id}`);
        el?.scrollIntoView({ behavior:'smooth', block:'end' });
      }, 30);
    } catch {
      setNotice('Не удалось отправить сообщение');
      setTimeout(()=>setNotice(''), 2500);
    } finally {
      setSending(false);
    }
  };

  const startReplyTo = (p)=>{
    const excerpt = (p.content || '').trim().slice(0, 120);
    setReplyTo({ id: p.id, author_name: p.author_name, created_at: p.created_at, excerpt });
    // фокус на textarea рядом с кнопкой
    setTimeout(()=> textareaRef.current?.focus({ preventScroll: true }), 0);
  };

  const cancelReplyTo = ()=> setReplyTo(null);

  // индекс постов по id — чтобы показать превью родителя, если он в выдаче
  const postsIndex = React.useMemo(()=>{
    const map = new Map();
    (data?.posts || []).forEach(p => map.set(p.id, p));
    return map;
  }, [data]);

  if (loading) {
    return (
      <main className="page">
        <div className="container mx-auto px-4 max-w-3xl py-10">
          <div className="rounded-3xl p-6 border border-white/10 bg-white/5 animate-pulse h-[120px]" />
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl p-4 border border-white/10 bg-white/5 animate-pulse h-[80px]" />
            <div className="rounded-2xl p-4 border border-white/10 bg-white/5 animate-pulse h-[80px]" />
          </div>
        </div>
      </main>
    );
  }

  if (err || !data) {
    return (
      <main className="page">
        <div className="container mx-auto px-4 max-w-3xl py-10">
          <Link to="/forum" className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100">
            <ArrowLeft size={16}/> Назад к форуму
          </Link>
          <div className="mt-6 rounded-2xl p-6 border border-white/10 bg-white/5">{err || 'Тема не найдена.'}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container mx-auto px-4 max-w-7xl py-10">

        {/* header */}
        <div className="rounded-3xl p-6 border bg-white/5 relative overflow-hidden"
             style={{borderColor:'var(--primary)'}}>
          <div
            className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full blur-3xl opacity-20"
            style={{background:'radial-gradient(closest-side, var(--accent), transparent)'}}
          />
          <div className="flex items-start gap-4 relative">
            <div className="h-12 w-12 min-w-12 rounded-2xl grid place-items-center text-white shadow-lg"
                 style={{background:'linear-gradient(135deg, var(--accent), var(--primary))'}}>
              <MessageCircle size={20}/>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight" style={{color:'var(--text)'}}>
                {data.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs opacity-80">
                <span className="inline-flex items-center gap-1"><UserRound size={14}/> {data.author_name || 'Гость'}</span>
                <span>{fmtDate(data.created_at)}</span>
                <span className="rounded-full px-2 py-1 border border-white/15 bg-white/5">{data.category}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/forum" className="btn-ghost rounded-2xl px-3 py-2 text-sm hidden sm:inline-flex">
                <ArrowLeft size={16}/> Назад
              </Link>
              <button onClick={copyLink} className="btn-ghost rounded-2xl px-3 py-2 text-sm inline-flex items-center gap-2">
                <Share2 size={16}/> Поделиться
              </button>
            </div>
          </div>
        </div>

        {/* topic */}
        <article className="panel-card p-6 mt-4">
          <div className="opacity-90 whitespace-pre-wrap leading-relaxed">{data.content}</div>
        </article>

        {/* posts */}
        <section className="mt-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2" style={{color:'var(--text)'}}>
            <MessageCircle size={16}/> Сообщения
          </h2>

          <div className="relative">
            <div className="absolute left-[14px] top-0 bottom-0 w-px bg-white/10" aria-hidden />
            <div className="space-y-4">
              {(data.posts || []).map(p=>{
                const parent = p.reply_to ? postsIndex.get(p.reply_to) : null;
                const appearing = appearingIds.has(p.id);
                return (
                  <div key={p.id} id={`p-${p.id}`} className="relative pl-8 scroll-mt-24">
                    <div className="absolute left-0 top-2 h-3 w-3 rounded-full" style={{background:'var(--primary)'}} />
                    <div
                      className={
                        `rounded-2xl p-4 border border-white/10 bg-white/5 transition-all duration-300 ` +
                        (appearing ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0')
                      }
                    >
                      <div className="text-xs opacity-70 mb-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1"><UserRound size={14}/> {p.author_name}</span>
                        <span>•</span>
                        <span>{fmtDate(p.created_at)}</span>
                      </div>

                      {/* превью родителя, если это ответ */}
                      {p.reply_to && (
                        <a
                          href={`#p-${p.reply_to}`}
                          className="block mb-2 rounded-xl px-3 py-2 border border-white/10 bg-white/5 hover:bg-white/10 transition text-xs"
                          title="Перейти к исходному сообщению"
                        >
                          <div className="flex items-start gap-2">
                            <CornerDownRight size={14} className="mt-0.5 opacity-70"/>
                            <div className="flex-1">
                              {parent ? (
                                <>
                                  Ответ на <b>{parent.author_name}</b> • {fmtDate(parent.created_at)}
                                  <div className="opacity-70 mt-1 line-clamp-2">
                                    {(parent.content || '').slice(0, 160)}
                                  </div>
                                </>
                              ) : (
                                <>Ответ на сообщение #{p.reply_to}</>
                              )}
                            </div>
                          </div>
                        </a>
                      )}

                      <div className="whitespace-pre-wrap leading-relaxed">{p.content}</div>

                      {/* actions */}
                      {user && (
                        <div className="mt-3">
                          <button
                            onClick={()=>startReplyTo(p)}
                            className="inline-flex items-center gap-1 text-xs rounded-lg px-2 py-1 hover:bg-white/10"
                          >
                            <CornerDownRight size={14}/> Ответить
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {(!data.posts || data.posts.length === 0) && (
                <div className="rounded-2xl p-4 border border-white/10 bg-white/5 opacity-70">
                  Пока нет ответов — станьте первым!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* notice (для ошибок/копирования ссылки) */}
        {notice && (
          <div className="mt-4 text-sm rounded-xl px-3 py-2 border border-white/10 bg-white/5">
            {notice}
          </div>
        )}

        {/* reply form / lock */}
        {data.limited && !user ? (
          <div className="mt-6 rounded-2xl p-5 border border-white/10 bg-white/5 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl grid place-items-center text-white"
                 style={{background:'linear-gradient(135deg, var(--accent), var(--primary))'}}>
              <Lock size={18}/>
            </div>
            <div className="text-sm">
              Чтобы увидеть все сообщения и участвовать в обсуждении,&nbsp;
              <Link to={`/login?next=/forum/${slug}`} className="underline">войдите</Link>
              &nbsp;или&nbsp;
              <Link to="/register" className="underline">зарегистрируйтесь</Link>.
            </div>
          </div>
        ) : (
          <form onSubmit={onReply} className="panel-card p-5 mt-6">
            {/* если отвечаем на конкретный пост */}
            {replyTo && (
              <div className="mb-3 text-xs rounded-xl px-3 py-2 border border-white/10 bg-white/5 flex items-start gap-2">
                <CornerDownRight size={14} className="mt-0.5"/>
                <div className="flex-1">
                  Ответ на <b>{replyTo.author_name}</b> • {fmtDate(replyTo.created_at)}
                  <div className="opacity-70 mt-1 line-clamp-2">{replyTo.excerpt}</div>
                </div>
                <button type="button" onClick={cancelReplyTo} className="opacity-70 hover:opacity-100">
                  <X size={14}/>
                </button>
              </div>
            )}

            {/* контейнер под поповер эмодзи */}
            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl grid place-items-center text-white shrink-0"
                     style={{background:'linear-gradient(135deg, var(--accent), var(--primary))'}}>
                  <UserRound size={18}/>
                </div>
                <div className="flex-1">
                  <label className="text-sm opacity-80">Ваш ответ</label>
                  <textarea
                    ref={textareaRef}
                    className="w-full mt-1 field-surface rounded-xl px-3 py-2 h-28"
                    placeholder="Добавьте новый взгляд, опыт или вопрос…"
                    value={reply}
                    onChange={(e)=>setReply(e.target.value)}
                    maxLength={5000}
                  />
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        ref={emojiBtnRef}
                        onClick={()=>{
                          positionPicker();
                          setShowPicker(v=>!v);
                        }}
                        className="btn-ghost rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2"
                        aria-haspopup="dialog"
                        aria-expanded={showPicker}
                        aria-label="Открыть эмодзи"
                      >
                        <Smile size={16}/> Эмодзи
                      </button>
                      <div className="text-xs opacity-60 hidden sm:block">
                        Поддерживаем абзацы; ссылки будут кликабельны автоматически.
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!reply.trim() || sending}
                      className="btn-primary rounded-2xl px-4 py-2 inline-flex items-center gap-2"
                    >
                      {sending ? (<><Loader2 size={16} className="animate-spin"/> Отправка…</>) : (<><Send size={16}/> Отправить</>)}
                    </button>
                  </div>
                </div>
              </div>

              {/* FIXED поповер, не двигает страницу */}
              {showPicker && (
                <div
                  ref={pickerRef}
                  className="fixed z-50"
                  style={{ top: pickerPos.top, left: pickerPos.left, width: 272 }}
                >
                  <EmojiPicker
                    onSelect={(emoji)=>insertAtCursor(emoji)}
                    onClose={()=>setShowPicker(false)}
                  />
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
