import React from 'react'
import Section from '../components/Section'
import { PrimaryButton, GhostButton } from '../components/Buttons'
import { Users } from 'lucide-react'

export default function TelegramCTA(){
  return (
    <Section id='telegram' className='pb-28'>
      <div className='rounded-3xl border border-muted p-8 md:p-12 text-center' style={{background:'color-mix(in srgb, var(--text) 6%, transparent)', color:'var(--text)'}}>
        <div className='mx-auto max-w-2xl'>
          <h3 className='text-2xl md:text-3xl font-bold'>Телеграм‑бот Tarion</h3>
          <p className='mt-2 opacity-90'>
            Мгновенные мини‑расклады, уведомления о личных окнах специалистов и доступ к подписке в один клик.
          </p>
          <div className='mt-6 flex flex-wrap gap-3 justify-center'>
            <PrimaryButton onClick={()=>alert('Откроем t.me/ваш_бот позже — заглушка')}>Открыть бота</PrimaryButton>
            <GhostButton onClick={() => document.getElementById('experts')?.scrollIntoView({ behavior: 'smooth' })}>
              К специалистам <Users size={16}/>
            </GhostButton>
          </div>
        </div>
      </div>
    </Section>
  )
}
