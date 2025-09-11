// src/features/contacts-home.jsx
import React from 'react'
import Section from '../components/Section'
import { Phone, Mail, MessageCircle, Zap } from 'lucide-react'
import { getSiteContacts } from '../api/contacts'

export default function ContactsHomeSection(){
  const [c, setC] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(()=>{
    let off=false
    ;(async()=>{
      try {
        const data = await getSiteContacts()
        if (!off) setC(data || {})
      } finally {
        if (!off) setLoading(false)
      }
    })()
    return ()=>{ off = true }
  },[])

  return (
    <Section id="contacts">
      <h2 className="text-3xl md:text-4xl font-bold" style={{color:'var(--text)'}}>Контакты</h2>
      <p className="mt-2 opacity-80" style={{color:'var(--text)'}}>Связаться с нами просто — ответим быстро.</p>

      {loading ? (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i=>(
            <div key={i} className="h-[110px] rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href={c?.phone ? `tel:${String(c.phone).replace(/\s+/g,'')}` : '#'}
             className="rounded-2xl p-5 border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl grid place-items-center text-white"
                 style={{background:'linear-gradient(135deg, var(--accent), var(--primary))'}}>
              <Phone size={18}/>
            </div>
            <div className="text-sm">
              <div className="font-semibold">Телефон</div>
              <div className="opacity-80">{c?.phone || '—'}</div>
            </div>
          </a>

          <a href={c?.email ? `mailto:${c.email}` : '#'}
             className="rounded-2xl p-5 border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl grid place-items-center text-white"
                 style={{background:'linear-gradient(135deg, var(--accent), var(--primary))'}}>
              <Mail size={18}/>
            </div>
            <div className="text-sm">
              <div className="font-semibold">E-mail</div>
              <div className="opacity-80">{c?.email || '—'}</div>
            </div>
          </a>

          <a href={c?.telegram ? `https://t.me/${String(c.telegram).replace('@','')}` : '#'}
             target="_blank" rel="noreferrer"
             className="rounded-2xl p-5 border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl grid place-items-center text-white"
                 style={{background:'linear-gradient(135deg, var(--accent), var(--primary))'}}>
              <MessageCircle size={18}/>
            </div>
            <div className="text-sm">
              <div className="font-semibold">Telegram</div>
              <div className="opacity-80">{c?.telegram || '—'}</div>
            </div>
          </a>

          <div className="rounded-2xl p-5 border border-white/10 bg-white/5 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl grid place-items-center text-white"
                 style={{background:'linear-gradient(135deg, var(--accent), var(--primary))'}}>
              <Zap size={18}/>
            </div>
            <div className="text-sm">
              <div className="font-semibold">График</div>
              <div className="opacity-80">{c?.work_hours || '—'}</div>
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}
