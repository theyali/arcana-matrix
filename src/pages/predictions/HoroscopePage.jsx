// src/pages/predictions/HoroscopePage.jsx
import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ZODIAC } from '../../features/horoscope/zodiac';
import AuthGate from '../../components/auth/AuthGate';
import { useAuth } from '../../auth/useAuth';

// Отображаемые периоды в UI
const PERIODS = [
  { key:'daily',   label:'День' },
  { key:'weekly',  label:'Неделя' },
  { key:'monthly', label:'Месяц' },
];

const LOGIN_PATH = '/login';

// utils
const iso = (d) => d.toISOString().slice(0,10);
const todayISO = () => iso(new Date());
const yesterdayISO = () => { const d=new Date(); d.setDate(d.getDate()-1); return iso(d); };
const tomorrowISO  = () => { const d=new Date(); d.setDate(d.getDate()+1); return iso(d); };

function isPeriodAllowedForGuest(periodUi) {
  return periodUi === 'daily';
}
function isDateAllowedForGuest(dateIso) {
  const allowed = new Set([todayISO(), yesterdayISO()]);
  return allowed.has(dateIso);
}

// Вспомогательная обёртка: включает AuthGate только когда нужно
function MaybeAuthGate({ enabled, children, title, description }) {
  if (!enabled) return children;
  return (
    <AuthGate
      loginPath={LOGIN_PATH}
      title={title}
      description={description}
    >
      {children}
    </AuthGate>
  );
}

export default function HoroscopePage(){
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const isGuest = !isAuthed;

  const [date, setDate] = React.useState(sp.get('date') || todayISO());
  const [period, setPeriod] = React.useState(sp.get('period') || 'daily');
  const [q, setQ] = React.useState(sp.get('q') || '');

  // синхроним query-параметры
  React.useEffect(() => {
    const n = new URLSearchParams(sp);
    n.set('date', date);
    n.set('period', period);
    if (q) n.set('q', q); else n.delete('q');
    setSp(n, { replace:true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, period, q]);

  // построить URL этой же страницы (лист) с нужными параметрами — для next
  const buildListUrl = (p = period, d = date) =>
    `/predictions/horoscope?period=${encodeURIComponent(p)}&date=${encodeURIComponent(d)}${q ? `&q=${encodeURIComponent(q)}` : ''}`;

  // перейти на логин с next
  const goLoginNext = (nextUrl) => {
    navigate(`${LOGIN_PATH}?next=${encodeURIComponent(nextUrl)}`);
  };

  const onClickPeriod = (pkey) => {
    if (isGuest && !isPeriodAllowedForGuest(pkey)) {
      // ведём в авторизацию, куда вернёмся уже с выбранным периодом
      return goLoginNext(buildListUrl(pkey, date));
    }
    setPeriod(pkey);
  };

  const onChangeDate = (val) => {
    if (isGuest && !isDateAllowedForGuest(val)) {
      return goLoginNext(buildListUrl(period, val));
    }
    setDate(val);
  };

  const quickSet = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const target = iso(d);
    if (isGuest && !isDateAllowedForGuest(target)) {
      return goLoginNext(buildListUrl(period, target));
    }
    setDate(target);
  };

  // какой быстрый день сейчас выбран (для активной подсветки)
  const dayKey =
    date === yesterdayISO() ? 'yesterday' :
    date === todayISO()     ? 'today'     :
    date === tomorrowISO()  ? 'tomorrow'  : 'custom';

  const btnActive   = "btn-primary rounded-2xl px-3 py-2 text-sm";
  const btnInactive = "btn-ghost rounded-2xl px-3 py-2 text-sm";

  // Фильтр по поиску
  const filtered = ZODIAC.filter(z =>
    z.name.toLowerCase().includes(q.toLowerCase()) ||
    z.slug.toLowerCase().includes(q.toLowerCase())
  );

  // ссылка у карточки знака
  const cardHref = (sign) => {
    const detailUrl = `/predictions/horoscope/${sign.slug}?period=${period}&date=${date}`;
    if (isGuest && (!isPeriodAllowedForGuest(period) || !isDateAllowedForGuest(date))) {
      return `${LOGIN_PATH}?next=${encodeURIComponent(detailUrl)}`;
    }
    return detailUrl;
  };

  // Нужен ли оверлей: гость выбрал запрещённый period/date
  const isRestrictedSelection = isGuest && (
    !isPeriodAllowedForGuest(period) || !isDateAllowedForGuest(date)
  );

  return (
    <main className="page">
      <div className="container mx-auto px-4 max-w-7xl py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <h1 className="h1 mb-2">Гороскопы</h1>
            <p className="opacity-80">
              Выберите период и дату, затем кликните на свой знак зодиака.
            </p>
          </div>

          {/* Фильтры */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Период */}
            <div className="rounded-2xl p-1 bg-white/5 border border-white/10 flex">
              {PERIODS.map(p => {
                const locked = isGuest && !isPeriodAllowedForGuest(p.key);
                return (
                  <button
                    key={p.key}
                    onClick={()=>onClickPeriod(p.key)}
                    title={locked ? 'Только для авторизованных' : ''}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition relative ${
                      period===p.key
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-[var(--text)]/80 hover:bg-white/10'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {p.label}
                      {locked && <span aria-hidden className="opacity-80">🔒</span>}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Дата */}
            <input
              type="date"
              value={date}
              onChange={e=>onChangeDate(e.target.value)}
              className="btn-ghost rounded-2xl px-3 py-2 text-sm"
              aria-label="Выбор даты"
              title={isGuest && !isDateAllowedForGuest(date) ? 'Только сегодня/вчера для гостей' : ''}
            />

            {/* Быстрые кнопки */}
            <div className="flex gap-2">
              <button
                onClick={()=>quickSet(-1)}
                className={dayKey === 'yesterday' ? btnActive : btnInactive}
              >
                Вчера
              </button>

              <button
                onClick={()=>quickSet(0)}
                className={dayKey === 'today' ? btnActive : btnInactive}
              >
                Сегодня
              </button>

              <button
                onClick={()=>quickSet(1)}
                className={dayKey === 'tomorrow' ? btnActive : btnInactive}
                title={isGuest ? 'Завтра — только для авторизованных' : ''}
              >
                Завтра {isGuest && <span aria-hidden>🔒</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Поиск по знакам */}
        <div className="mb-6">
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Поиск: Овен, Телец, Рыбы…"
            className="w-full sm:w-96 btn-ghost rounded-2xl px-4 py-3 text-sm"
          />
        </div>

        {/* Сетка знаков — защищаем только когда выбраны ограничения для гостей */}
        <MaybeAuthGate
          enabled={isRestrictedSelection}
          title="Войдите, чтобы смотреть этот период/дату"
          description="Гостям доступны только дневные гороскопы за сегодня и вчера."
        >
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map(sign => (
              <Link
                key={sign.slug}
                to={cardHref(sign)}
                className="group rounded-2xl p-5 border border-white/10 bg-white/5 hover:bg-white/10 transition relative overflow-hidden"
                aria-label={`${sign.name} — открыть гороскоп`}
              >
                {/* декоративный градиент */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition"
                  style={{background:'radial-gradient(120% 120% at 100% 0%, var(--accent)10%, transparent 60%)'}}
                />
                <div className="relative flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl grid place-items-center text-2xl shadow-lg"
                      style={{background:'linear-gradient(135deg, var(--accent), var(--primary))', color:'#fff'}}>
                    <span aria-hidden>{sign.emoji}</span>
                  </div>
                  <div>
                    <div className="font-bold text-lg" style={{color:'var(--text)'}}>{sign.name}</div>
                    <div className="text-xs opacity-70">{sign.dateRange} · {sign.element}</div>
                  </div>
                </div>

                <div className="mt-4 text-sm opacity-80">
                  Период: <b>{PERIODS.find(p=>p.key===period)?.label}</b> · Дата: <b>{date}</b>
                </div>

                <div className="mt-4 text-sm opacity-70">
                  Нажмите, чтобы открыть детальный гороскоп.
                </div>
              </Link>
            ))}
          </div>
        </MaybeAuthGate>
      </div>
    </main>
  );
}
