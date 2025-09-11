import React from 'react'
import Section from '../components/Section'
import { Star } from 'lucide-react'

function calcPythagorasMatrix(dateStr){
  const clean = (dateStr || '').replace(/[^0-9]/g, '')
  const counts = Object.fromEntries(Array.from({length:9}, (_,i)=>[String(i+1),0]))
  for(const ch of clean){ if(ch!=='0') counts[ch] = (counts[ch]||0)+1 }
  return counts
}
function MatrixGrid({ counts }){
  const cells = [['1','2','3'],['4','5','6'],['7','8','9']]
  return (
    <div className='grid grid-cols-3 gap-3'>
      {cells.flat().map(d => (
        <div key={d} className='rounded-2xl border border-muted p-4 text-center shadow-sm' style={{background:'color-mix(in srgb, var(--text) 6%, transparent)', color:'var(--text)'}}>
          <div className='text-sm uppercase tracking-wide opacity-70'>{d}</div>
          <div className='mt-1 text-2xl font-semibold'>{Array.from({length: counts[d]||0}).map(()=>d).join('') || '—'}</div>
        </div>
      ))}
    </div>
  )
}

export default function MatrixSection(){
  const [dob, setDob] = React.useState('')
  const matrix = React.useMemo(()=>calcPythagorasMatrix(dob), [dob])

  return (
    <Section id='matrix'>
      <h2 className='text-3xl md:text-4xl font-bold flex items-center gap-3' style={{color:'var(--text)'}}><Star/> Матрица судьбы</h2>
      <p className='mt-2 max-w-2xl' style={{color:'var(--text)', opacity:.8}}>Введите дату рождения и получите базовую Пифагорову матрицу (демо). В платной версии — расширенные трактовки, совместимость и персональные рекомендации.</p>
      <div className='mt-6 grid lg:grid-cols-2 gap-8'>
        <div className='space-y-4'>
          <label className='block'>
            <span className='text-sm' style={{color:'var(--text)', opacity:.7}}>Дата рождения</span>
            <input type='date' value={dob} onChange={e=>setDob(e.target.value)} className='mt-1 w-full rounded-2xl px-4 py-3 outline-none border border-muted' style={{background:'color-mix(in srgb, var(--text) 6%, transparent)', color:'var(--text)'}}/>
          </label>
          <MatrixGrid counts={matrix} />
        </div>
        <div className='rounded-3xl border border-muted p-6' style={{background:'color-mix(in srgb, var(--text) 6%, transparent)', color:'var(--text)'}}>
          <h3 className='text-lg font-semibold'>Как читать матрицу</h3>
          <ul className='mt-3 list-disc pl-6 space-y-2 opacity-90'>
            <li><b>Единицы</b> — воля и инициатива. Много 1 → лидерский потенциал.</li>
            <li><b>Двойки</b> — энергия и ресурсы. Балансируйте нагрузку.</li>
            <li><b>Тройки</b> — коммуникация и творчество.</li>
            <li><b>Пятёрки</b> — логика, дисциплина, структура.</li>
            <li><b>Девятки</b> — духовность, ценности, смысл.</li>
          </ul>
          <div className='mt-4 text-sm opacity-70'>Подробные трактовки и совместимость доступны в тарифе Pro.</div>
        </div>
      </div>
    </Section>
  )
}
