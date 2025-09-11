// src/features/pricing.jsx
import React from 'react'
import Section from '../components/Section'
import { CreditCard } from 'lucide-react'
import { getPlans } from '../api/pricing'
import { useNavigate } from 'react-router-dom'

export default function PricingSection(){
  const [plans, setPlans] = React.useState(null)
  const [active, setActive] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const navigate = useNavigate()

  React.useEffect(() => {
    let off = false
    ;(async()=>{
      try {
        const data = await getPlans()
        const arr = Array.isArray(data) ? data : (data?.results || [])
        if (!off) {
          setPlans(arr)
          setActive(arr.find(p=>p.highlighted)?.slug || arr[0]?.slug || null)
        }
      } finally {
        if (!off) setLoading(false)
      }
    })()
    return ()=>{ off = true }
  }, [])

  return (
    <Section id="pricing">
      <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3" style={{color:'var(--text)'}}>
        <CreditCard/> Подписка
      </h2>
      <p className="mt-2" style={{color:'var(--text)', opacity:.8}}>
        Оформите подписку и разблокируйте расширенные функции: безлимитные расклады, полная матрица и закрытое коммьюнити.
      </p>

      {/* skeleton */}
      {loading && (
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {[0,1,2].map(i=>(
            <div key={i} className="h-[300px] rounded-3xl border border-white/10 bg-white/5 animate-pulse"/>
          ))}
        </div>
      )}

      {/* карты тарифов */}
      {!loading && plans && (
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {plans.map(p=>{
            const id = p.slug || p.id
            const isActive = id === active
            return (
              <div
                key={id}
                className="rounded-3xl border p-6"
                style={{
                  borderColor: p.highlighted ? 'var(--accent)' : 'var(--muted)',
                  background: p.highlighted
                    ? 'color-mix(in srgb, var(--accent) 10%, transparent)'
                    : 'color-mix(in srgb, var(--text) 6%, transparent)',
                  color: 'var(--text)'
                }}
              >
                {p.highlighted && (
                  <div className="mb-2 inline-block rounded-full px-3 py-1 text-xs"
                       style={{background:'color-mix(in srgb, var(--accent) 20%, transparent)', border:'1px solid var(--accent)'}}>
                    Популярно
                  </div>
                )}

                <div className="text-lg font-semibold">{p.name}</div>
                <div className="text-3xl font-extrabold mt-1">
                  {p.monthly === 0 ? '0₽' : `${Number(p.monthly || 0).toLocaleString('ru-RU')}₽/мес`}
                </div>

                <ul className="mt-4 space-y-2 text-sm opacity-90">
                  {(p.features ?? []).map((f, i)=>(
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full" style={{background:'var(--accent)'}}></span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <button
                    onClick={()=>{
                      setActive(id)
                      navigate(`/pricing?select=${id}`)
                    }}
                    className="w-full rounded-2xl px-4 py-3 font-semibold"
                    style={ isActive
                      ? {background:'linear-gradient(135deg, var(--accent), var(--primary))', color:'#fff'}
                      : {border:'1px solid var(--muted)', background:'color-mix(in srgb, var(--text) 6%, transparent)', color:'var(--text)'}
                    }
                  >
                    {p.cta || 'Выбрать'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 text-sm opacity-70" style={{color:'var(--text)'}}>
        Интеграция оплаты: Stripe / YooKassa / Crypto — по вашему выбору. После оплаты — привязка к аккаунту/Telegram.
      </div>
    </Section>
  )
}
