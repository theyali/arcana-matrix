import React from 'react'
import Section from '../components/Section'
import { Users, Rocket, Clock, Heart } from 'lucide-react'
import { PrimaryButton, GhostButton } from '../components/Buttons'

export default function ExpertsSection(){
  const specialists = [
    { name: 'Мария Ведова', skill: 'Таролог · 8 лет', rating: 4.9, slots: 'Сегодня 18:00, 20:00' },
    { name: 'Даниил Астрон', skill: 'Астролог · 6 лет', rating: 4.8, slots: 'Завтра 12:00, 15:00' },
    { name: 'Ева Руна',      skill: 'Нумеролог · 10 лет', rating: 4.7, slots: 'Сегодня 19:30' },
  ]
  return (
    <Section id='experts'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl md:text-4xl font-bold flex items-center gap-3' style={{color:'var(--text)'}}><Users/> Специалисты</h2>
        <GhostButton onClick={()=>alert('Заявка на сотрудничество отправлена')}>Стать экспертом <Rocket size={16}/></GhostButton>
      </div>
      <div className='mt-6 grid md:grid-cols-3 gap-6'>
        {specialists.map(s => (
          <div key={s.name} className='rounded-3xl border border-muted p-6' style={{background:'color-mix(in srgb, var(--text) 6%, transparent)', color:'var(--text)'}}>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-lg font-semibold'>{s.name}</div>
                <div className='text-sm opacity-70'>{s.skill}</div>
              </div>
              <div className='text-sm flex items-center gap-1' style={{color:'var(--accent)'}}><Heart size={16}/> {s.rating}</div>
            </div>
            <div className='mt-4 text-sm flex items-center gap-2'><Clock size={16}/> {s.slots}</div>
            <div className='mt-4 flex gap-2'>
              <PrimaryButton>Записаться</PrimaryButton>
              <GhostButton>Профиль</GhostButton>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
