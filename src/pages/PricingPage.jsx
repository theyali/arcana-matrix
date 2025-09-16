import React from 'react';
import { Check, Sparkles, Shield, Zap, Crown, Phone, Mail, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getPlans } from '../api/pricing';
import { getSiteContacts } from '../api/contacts';

// вынесенные компоненты
import PlanCard from '../components/pricing/PlanCard.jsx';

import WhatIncluded from '../components/pricing/WhatIncluded.jsx';


export default function PricingPage() {
  const [billing, setBilling] = React.useState('monthly'); // 'monthly' | 'yearly'
  const [plans, setPlans] = React.useState(null);
  const [contacts, setContacts] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
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
    return () => { cancelled = true; };
  }, []);

  // извлекаем активный тариф из user (покрываем разные возможные поля)
  const activePlanSlug =
    user?.subscription?.plan?.slug ||
    user?.subscription?.plan ||
    user?.plan?.slug ||
    user?.plan_slug ||
    null;

  const hasActiveSubscription =
    !!(user?.subscription?.active || user?.is_paid || (activePlanSlug && activePlanSlug !== 'free'));

  const onSelect = (slug) => {
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
              { k: 'monthly', label: 'Месяц' },
              { k: 'yearly', label: 'Год (выгодно)' },
            ].map(x => (
              <button
                key={x.k}
                onClick={() => setBilling(x.k)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  billing === x.k ? 'bg-[var(--primary)] text-white' : 'text-[var(--text)]/80 hover:bg-white/10'
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
            {[0, 1, 2].map(i => (
              <div key={i} className="rounded-3xl p-6 border border-white/10 bg-white/5 animate-pulse h-[360px]" />
            ))}
          </div>
        ) : (
          <section className="grid gap-5 md:grid-cols-3">
            {plans.map(p => (
              <PlanCard
                key={p.slug}
                plan={p}
                billing={billing}
                onSelect={() => onSelect(p.slug)}
                isActive={activePlanSlug === p.slug}
                hasActive={hasActiveSubscription}
              />
            ))}
          </section>
        )}

        {/* FAQ/примечания */}
        <section className="mt-10 grid lg:grid-cols-3 gap-6">
          <WhatIncluded />
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

        {/* Контакты */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Контакты</h2>
          {!contacts ? (
            <div className="rounded-2xl p-6 border border-white/10 bg-white/5 animate-pulse h-[120px]" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href={`tel:${contacts.phone?.replace?.(/\s+/g, '') ?? ''}`}
                className="rounded-2xl p-5 border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-start gap-3"
              >
                <div
                  className="h-10 w-10 rounded-xl grid place-items-center text-white"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))' }}
                >
                  <Phone size={18} />
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Телефон</div>
                  <div className="opacity-80">{contacts.phone}</div>
                </div>
              </a>
              <a
                href={`mailto:${contacts.email}`}
                className="rounded-2xl p-5 border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-start gap-3"
              >
                <div
                  className="h-10 w-10 rounded-xl grid place-items-center text-white"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))' }}
                >
                  <Mail size={18} />
                </div>
                <div className="text-sm">
                  <div className="font-semibold">E-mail</div>
                  <div className="opacity-80">{contacts.email}</div>
                </div>
              </a>
              <a
                href={`https://t.me/${contacts.telegram?.replace?.('@', '') ?? ''}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl p-5 border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-start gap-3"
              >
                <div
                  className="h-10 w-10 rounded-xl grid place-items-center text-white"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))' }}
                >
                  <MessageCircle size={18} />
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Telegram</div>
                  <div className="opacity-80">{contacts.telegram}</div>
                </div>
              </a>
              <div className="rounded-2xl p-5 border border-white/10 bg-white/5 flex items-start gap-3">
                <div
                  className="h-10 w-10 rounded-xl grid place-items-center text-white"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))' }}
                >
                  <Zap size={18} />
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
