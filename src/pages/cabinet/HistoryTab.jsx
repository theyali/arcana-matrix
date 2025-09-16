import React from "react";
import { History as HistoryIcon, ChevronDown, Loader2, Image as ImageIcon } from "lucide-react";
import { listHistory } from "../../api/history";
import { getAvatarUrl } from "../../api/profile";

function absUrl(u){ return getAvatarUrl(u); }

export default function HistoryTab(){
  const [items, setItems] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [kind, setKind] = React.useState(""); // '' | 'palm' | 'coffee'
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [next, setNext] = React.useState(null);
  const [prev, setPrev] = React.useState(null);
  const [expanded, setExpanded] = React.useState(null);

  const load = React.useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await listHistory({ page, kind: kind || undefined });
      setItems(data.results || []);
      setNext(data.next || null);
      setPrev(data.previous || null);
      setExpanded(null);
    } catch (e) {
      setError(e?.detail || "Не удалось загрузить историю");
    } finally {
      setLoading(false);
    }
  }, [page, kind]);

  React.useEffect(() => { load(); }, [load]);

  const onToggle = (id) => setExpanded(x => x === id ? null : id);

  const FilterButton = ({ v, label }) => (
    <button
      type="button"
      onClick={() => { setPage(1); setKind(v); }}
      className={`rounded-2xl px-3 py-1 text-sm border ${kind===v? 'bg-white/10 border-white/20' : 'hover:bg-white/5 border-white/10'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="panel-card p-6">
      <div className="flex items-center gap-2 mb-4"><HistoryIcon size={18}/> <b>История предсказаний</b></div>

      <div className="mb-4 flex items-center gap-2">
        <FilterButton v="" label="Все" />
        <FilterButton v="palm" label="Ладонь" />
        <FilterButton v="coffee" label="Кофе" />
      </div>

      <div className="relative">
        <div className="min-h-[280px]">
          {error ? (
            <div className="h-full grid place-items-center text-sm" style={{color:'#ff8a8a'}}>{error}</div>
          ) : items.length === 0 ? (
            <div className="h-full grid place-items-center text-sm opacity-70">Пока нет записей</div>
          ) : (
            <ul className="divide-y" style={{borderColor:'var(--muted)'}}>
              {items.map(it => (
                <li key={it.id}>
                  <button
                    type="button"
                    className="w-full flex items-start gap-3 py-3 text-left hover:bg-white/5 rounded-xl px-2"
                    onClick={() => onToggle(it.id)}
                  >
                    <div className="mt-1 opacity-70"><ChevronDown size={16} className={expanded===it.id? 'rotate-180 transition' : 'transition'} /></div>
                    <div className="flex-1">
                      <div className="text-sm" style={{color:'var(--text)'}}>
                        #{it.id} · {fmtKind(it.kind)} · {fmtDate(it.created_at)}
                      </div>
                      <div className="text-xs opacity-70 truncate">
                        {it.summary || it.title || it.result || extractPreview(it)}
                      </div>
                    </div>
                  </button>

                  {expanded===it.id && (
                    <div className="mt-2 mb-4 ml-6 p-3 rounded-xl field-surface">
                      <Detail it={it} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {loading && (
          <div className="absolute inset-0 grid place-items-center">
            <Loader2 className="animate-spin"/>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button className="btn-ghost rounded-2xl px-3 py-2 text-sm" disabled={!prev} onClick={()=>setPage(p=>Math.max(1,p-1))}>Назад</button>
        <div className="text-xs opacity-70">Стр. {page}</div>
        <button className="btn-primary rounded-2xl px-3 py-2 text-sm" disabled={!next} onClick={()=>setPage(p=>p+1)}>Вперёд</button>
      </div>
    </div>
  );
}

function fmtKind(k){
  if (!k) return 'предсказание';
  if (k === 'palm') return 'ладонь (ИИ)';
  if (k === 'coffee') return 'кофе (ИИ)';
  return k;
}
function fmtDate(s){
  try { return new Date(s).toLocaleString('ru-RU'); } catch { return s || ''; }
}
function extractPreview(it){
  const text = it?.text || it?.content || it?.output || '';
  if (typeof text === 'string') return text.slice(0, 120);
  try { return JSON.stringify(text).slice(0, 120); } catch { return ''; }
}

function Detail({ it }){
  const images = (it.images || []).map(img => img.url || img.image || img);
  return (
    <div className="space-y-3 text-sm">
      {it.summary && (<div><b>Резюме:</b> {it.summary}</div>)}
      {it.result && !it.summary && (<div><b>Итог:</b> {it.result}</div>)}
      {it.text && (<div className="opacity-90 whitespace-pre-wrap">{it.text}</div>)}
      {!it.text && it.output && typeof it.output === 'string' && (
        <div className="opacity-90 whitespace-pre-wrap">{it.output}</div>
      )}
      {images?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((u,i)=>(
            <img key={i} src={absUrl(u)} alt="Изображение" className="w-24 h-24 object-cover rounded-lg border border-white/10"/>
          ))}
        </div>
      )}
      {/* fallback — отобразим JSON */}
      {!it.summary && !it.result && !it.text && !it.output && (
        <pre className="text-xs opacity-80 overflow-auto max-h-64">{safeJson(it)}</pre>
      )}
    </div>
  );
}

function safeJson(x){ try { return JSON.stringify(x, null, 2); } catch { return String(x); } }
