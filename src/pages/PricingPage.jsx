// src/pages/PricingPage.jsx
import React from 'react';
import { Check, Sparkles, Shield, Zap, Crown, Phone, Mail, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getPlans } from '../api/pricing';
import { getSiteContacts } from '../api/contacts';

function Price({ value, period }) {
  const isFree = !value;
  return (
    <div className="flex items-end gap-1">
      <span className="text-3xl font-extrabold" style={{color:'var(--text)'}}>
        {isFree ? '0' : value.toLocaleString('ru-RU')}
      </span>
      <span className="opacity-70 text-sm mb-1">{isFree ? '₽' : '₽'}/ {period==='monthly' ? 'мес' : 'год'}</span>
    </div>
  );
}

function PlanCard({ plan, billing='monthly', onSelect }) {
  const price = billing === 'monthly' ? plan.monthly : plan.yearly;
  const yearlyFull = plan.monthly * 12;
  const save = billing === 'yearly' && price > 0 ? Math.max(0, Math.round((1 - price / yearlyFull) * 100)) : 0;

  return (
    <article className={`rounded-3xl p-6 border bg-white/5 hover:bg-white/10 transition relative
      ${plan.highlighted ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/30' : 'border-white/10'}`}>
      {/* бейдж */}
      <div className="absolute -top-3 left-6">
        <span className="rounded-xl px-3 py-1 text-xs font-semibold"
          style={{background:'linear-gradient(135deg, var(--accent), var(--primary))', color:'#fff'}}>
          {plan.badge}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-2xl grid place-items-center text-white shadow-lg"
             style={{background:'linear-gradient(135deg, var(--accent), var(--primary))'}}>
          {plan.slug === 'free' ? <Sparkles size={18}/> : plan.slug === 'pro' ? <Shield size={18}/> : <Crown size={18}/>}
        </div>
        <h3 className="text-xl font-bold" style={{color:'var(--text)'}}>{plan.name}</h3>
      </div>

      <p className="opacity-80 text-sm mb-4">{plan.description}</p>

      <div className="flex items-center justify-between mb-2">
        <Price value={price} period={billing} />
        {save > 0 && (
          <span className="text-xs font-semibold rounded-lg px-2 py-1 bg-white/10">
            Экономия {save}%
          </span>
        )}
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check size={16} className="mt-0.5" style={{color:'var(--primary)'}}/>
            <span className="opacity-90">{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`mt-6 w-full rounded-2xl px-4 py-3 font-semibold ${plan.highlighted ? 'btn-primary' : 'btn-ghost'}`}
      >
        {plan.cta}
      </button>
    </article>
  );
}

export default function PricingPage(){
  const [billing, setBilling] = React.useState('monthly'); // 'monthly' | 'yearly'
  const [plans, setPlans] = React.useState(null);
  const [contacts, setContacts] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    let cancelled = false;
    (async ()=>{
      try {
       const data = await getPlans();
       if (!cancelled) setPlans(Array.isArray(data) ? data : (data.results || data));
      } catch (e) {
       console.error('getPlans failed:', e);
       if (!cancelled) setPlans([]);
      }
      try {
       const c = await getSiteContacts();
       if (!cancelled) setContacts(c);
      } catch (e) {
       console.error('getSiteContacts failed:', e);
       if (!cancelled) setContacts(null);
      }
      if (!cancelled) setLoading(false);
    })();
    return ()=>{ cancelled = true; };
  }, []);

  const onSelect = (slug) => {
    // Позже — оформление через бэкенд. Пока: ведём к регистрации/кабинету.
    if (!user) navigate('/register?plan=' + slug);
    else navigate('/cabinet?upgrade=' + slug);
  };

  return (
    <main className="page">
      <div className="container mx-auto px-4 max-w-7xl py-10">
        {/* Hero */}
        <header className="mb-8">
          <h1 className="h1 mb-2">Подписка</h1>
          <p className="opacity-80">Выберите подходящий тариф. В любой момент сможете перейти на другой.</p>
        </header>

        {/* Переключатель биллинга */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="rounded-2xl p-1 bg-white/5 border border-white/10 flex">
            {[
              {k:'monthly', label:'Месяц'},
              {k:'yearly', label:'Год (выгодно)'},
            ].map(x=>(
              <button
                key={x.k}
                onClick={()=>setBilling(x.k)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  billing===x.k ? 'bg-[var(--primary)] text-white' : 'text-[var(--text)]/80 hover:bg-white/10'
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>

          <div className="text-sm opacity-70">
            Все цены в ₽, налоги включены. Отмена — в один клик.
          </div>
        </div>

        {/* Тарифы */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {[0,1,2].map(i=>(
              <div key={i} className="rounded-3xl p-6 border border-white/10 bg-white/5 animate-pulse h-[360px]"/>
            ))}
          </div>
        ) : (
          <section className="grid gap-5 md:grid-cols-3">
            {plans.map(p=>(
              <PlanCard key={p.slug} plan={p} billing={billing} onSelect={()=>onSelect(p.slug)} />
            ))}
          </section>
        )}

        {/* FAQ/примечания */}
        <section className="mt-10 grid lg:grid-cols-3 gap-6">
          <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
            <h3 className="font-semibold mb-2">Что входит?</h3>
            <p className="opacity-80 text-sm">
              Доступ к ИИ-Таро, Матрице, анализу кофе/ладони, гороскопам и форуму. Лимиты зависят от тарифа.
            </p>
          </div>
          <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
            <h3 className="font-semibold mb-2">Можно ли изменить тариф?</h3>
            <p className="opacity-80 text-sm">
              Да, апгрейд моментальный, даунгрейд — со следующего биллингового периода.
            </p>
          </div>
          <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
            <h3 className="font-semibold mb-2">Возвраты</h3>
            <p className="opacity-80 text-sm">
              Если что-то пошло не так, напишите нам — поможем и разберёмся.
            </p>
          </div>
        </section>

        {/* Контакты (из DRF позже) */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4" style={{color:'var(--text)'}}>Контакты</h2>
          {!contacts ? (
            <div className="rounded-2xl p-6 border border-white/10 bg-white/5 animate-pulse h-[120px]" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a href={`tel:${contacts.phone.replace(/\s+/g,'')}`} className="rounded-2xl p-5 border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl grid place-items-center text-white"
                     style={{background:'linear-gradient(135deg, var(--accent), var(--primary))'}}>
                  <Phone size={18}/>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Телефон</div>
                  <div className="opacity-80">{contacts.phone}</div>
                </div>
              </a>
              <a href={`mailto:${contacts.email}`} className="rounded-2xl p-5 border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl grid place-items-center text-white"
                     style={{background:'linear-gradient(135deg, var(--accent), var(--primary))'}}>
                  <Mail size={18}/>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">E-mail</div>
                  <div className="opacity-80">{contacts.email}</div>
                </div>
              </a>
              <a href={`https://t.me/${contacts.telegram.replace('@','')}`} target="_blank" rel="noreferrer"
                 className="rounded-2xl p-5 border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl grid place-items-center text-white"
                     style={{background:'linear-gradient(135deg, var(--accent), var(--primary))'}}>
                  <MessageCircle size={18}/>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Telegram</div>
                  <div className="opacity-80">{contacts.telegram}</div>
                </div>
              </a>
              <div className="rounded-2xl p-5 border border-white/10 bg-white/5 flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl grid place-items-center text-white"
                     style={{background:'linear-gradient(135deg, var(--accent), var(--primary))'}}>
                  <Zap size={18}/>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">График</div>
                  <div className="opacity-80">{contacts.work_hours}</div>
                </div>
              </div>
            </div>
          )}
          <p className="opacity-60 text-xs mt-3">
            Позже подключим DRF: <code>/api/pricing/plans</code> и <code>/api/site/contacts</code>.
          </p>
        </section>
      </div>
    </main>
  );
}
