import React from 'react'
import Section from '../components/Section'
import { PrimaryButton, GhostButton, classNames } from '../components/Buttons'
import Bubble from '../components/Bubble'
import { Wand2, Sparkles, Bot, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const MAJOR_ARCANA = [
  'Шут','Маг','Верховная Жрица','Императрица','Император','Иерофант','Влюбленные','Колесница','Сила','Отшельник','Колесо Фортуны','Справедливость','Повешенный','Смерть','Умеренность','Дьявол','Башня','Звезда','Луна','Солнце','Суд','Мир',
]
const SPREADS = { 'Одна карта':1, 'Три карты (прошл/наст/буд)':3, 'Кельтский Крест (10)':10 }

function drawCards(n){
  const pool = [...MAJOR_ARCANA]; const result=[];
  for(let i=0;i<n && pool.length;i++){ const idx=Math.floor(Math.random()*pool.length); const [card]=pool.splice(idx,1); const reversed=Math.random()<0.5; result.push({card,reversed}); }
  return result;
}
function synthAIReading(cards, question){
  if(!cards?.length) return 'Сначала вытяните карты.'
  const names = cards.map(c => `${c.card}${c.reversed ? ' (перевернута)':''}`).join(', ')
  const tone = question?.length>5 ? 'Отвечаю по вашему вопросу.' : 'Общий совет:'
  const hints = [
    'сфокусируйтесь на балансе и постепенности',
    'ищите ясность и не бойтесь перемен',
    'доверяйте интуиции и укрепляйте границы',
    'действуйте решительно, но бережно к себе',
    'примите уроки прошлого и сделайте первый шаг',
  ]
  const hint = hints[Math.floor(Math.random()*hints.length)]
  return `${tone} В раскладе: ${names}. Карты подсказывают: ${hint}.`
}

export default function TarotSection(){
  const [spreadName, setSpreadName] = React.useState('Три карты (прошл/наст/буд)')
  const [cards, setCards] = React.useState([])
  const [question, setQuestion] = React.useState('')
  const reading = React.useMemo(() => synthAIReading(cards, question), [cards, question])

  return (
    <Section id='ai'>
      <div className='flex items-start justify-between gap-10 flex-col lg:flex-row'>
        <div className='lg:w-[56%] w-full'>
          <h2 className='text-3xl md:text-4xl font-bold flex items-center gap-3' style={{color:'var(--text)'}}>
            <Wand2/> ИИ‑расклады Таро
          </h2>
          <p className='mt-2 max-w-2xl' style={{color:'var(--text)', opacity:.8}}>
            Выберите тип расклада, сформулируйте вопрос и вытяните карты. Алгоритм сгенерирует осмысленную интерпретацию на основе архетипов и контекстов.
          </p>

          <div className='mt-6 grid gap-4'>
            <div className='flex flex-wrap items-center gap-3'>
              <label className='text-sm' style={{color:'var(--text)', opacity:.7}}>Тип расклада:</label>
              <div className='flex flex-wrap gap-2'>
                {Object.keys(SPREADS).map(name => (
                  <button key={name} onClick={()=>setSpreadName(name)} className={classNames('px-3 py-1.5 rounded-xl border', name===spreadName ? 'border-[var(--accent)]' : 'border-muted hover:bg-glass')} style={name===spreadName ? {background:'color-mix(in srgb, var(--accent) 10%, transparent)'}: {}}>{name}</button>
                ))}
              </div>
            </div>

            <label className='block'>
              <span className='text-sm' style={{color:'var(--text)', opacity:.7}}>Ваш вопрос (необязательно)</span>
              <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder='Например: как лучше развивать карьеру в ближайшие 3 месяца?' className='mt-1 w-full rounded-2xl px-4 py-3 outline-none border border-muted' style={{background:'color-mix(in srgb, var(--text) 6%, transparent)', color:'var(--text)'}}/>
            </label>

            <div className='flex gap-3'>
              <PrimaryButton onClick={()=>setCards(drawCards(SPREADS[spreadName]))}>Вытянуть карты <Sparkles size={18}/></PrimaryButton>
              <GhostButton onClick={()=>setCards([])}>Сброс</GhostButton>
            </div>

            <div className='mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4'>
              {cards.map((c, idx) => (
                <Card key={idx} index={idx} {...c} />
              ))}
            </div>

            <div className='mt-6 rounded-3xl border border-muted p-5' style={{background:'color-mix(in srgb, var(--text) 6%, transparent)'}}>
              <div className='flex items-center gap-2 text-sm' style={{color:'var(--text)', opacity:.7}}><Bot size={16}/> Интерпретация ИИ</div>
              <p className='mt-2 leading-relaxed' style={{color:'var(--text)'}}>{reading}</p>
            </div>
          </div>
        </div>

        <aside className='lg:w-[44%] w-full'>
          <div className='rounded-3xl border border-muted p-6 sticky top-24' style={{background:'color-mix(in srgb, var(--text) 6%, transparent)'}}>
            <h3 className='text-xl font-bold flex items-center gap-2' style={{color:'var(--text)'}}><MessageCircle/> Мини‑чат с ИИ</h3>
            <p className='text-sm' style={{color:'var(--text)', opacity:.7}}>Короткие подсказки по вашему раскладу.</p>
            <div className='mt-4 space-y-3 max-h-64 overflow-auto pr-1'>
              <Bubble role='assistant'>Сформулируйте вопрос максимально конкретно.</Bubble>
              {question && <Bubble role='user'>{question}</Bubble>}
              {cards.length>0 && <Bubble role='assistant'>{reading}</Bubble>}
            </div>
            <div className='mt-3 flex gap-2'>
              <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder='Ваш вопрос…' className='flex-1 rounded-2xl px-4 py-3 outline-none border border-muted' style={{background:'color-mix(in srgb, var(--text) 6%, transparent)', color:'var(--text)'}}/>
              <PrimaryButton onClick={()=>void 0}>Спросить</PrimaryButton>
            </div>
            <div className='mt-4 text-xs' style={{color:'var(--text)', opacity:.6}}>
              Полная версия чата доступна в тарифах Pro и Expert.
            </div>
          </div>
        </aside>
      </div>
    </Section>
  )
}

function Card({ card, reversed, index }){
  return (
    <motion.div initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 14 }} className='rounded-2xl p-4 border shadow' style={{borderColor:'color-mix(in srgb, var(--text) 20%, transparent)', background:'linear-gradient(180deg, color-mix(in srgb, var(--primary) 30%, transparent), color-mix(in srgb, var(--accent) 20%, transparent))', color:'var(--text)', transform: reversed ? 'rotate(180deg)':''}}>
      <div className='opacity-70 text-xs'>Карта {index+1}</div>
      <div className='mt-1 text-lg font-semibold leading-tight'>{card}</div>
      {reversed && <div className='mt-1 text-xs uppercase tracking-wide' style={{color:'var(--accent)'}}>перевернута</div>}
    </motion.div>
  )
}
