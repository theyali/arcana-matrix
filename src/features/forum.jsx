import React from 'react'
import Section from '../components/Section'
import { BookOpen, Search } from 'lucide-react'

export default function ForumSection(){
  const [query, setQuery] = React.useState('')
  const topics = [
    { id:1, title:'Расклад на работу: опыт и кейсы', replies:42, tag:'работа', last:'сегодня' },
    { id:2, title:'Матрица судьбы: интерпретация двоек', replies:19, tag:'матрица', last:'вчера' },
    { id:3, title:'Гороскоп на сентябрь: чего ждать Овнам?', replies:23, tag:'гороскоп', last:'2 дн. назад' },
    { id:4, title:'Выбор колоды для начинающих', replies:8, tag:'колоды', last:'3 дн. назад' },
  ]
  const filtered = topics.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
  return (
    <Section id='forum'>
      <div className='flex items-center justify-between gap-4 flex-wrap'>
        <h2 className='text-3xl md:text-4xl font-bold flex items-center gap-3' style={{color:'var(--text)'}}><BookOpen/> Форум</h2>
        <div className='flex items-center gap-2 rounded-2xl px-3 py-2 border border-muted' style={{background:'color-mix(in srgb, var(--text) 6%, transparent)', color:'var(--text)'}}>
          <Search size={18} style={{opacity:.7}}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Поиск тем…' className='bg-transparent outline-none text-sm flex-1' />
        </div>
      </div>
      <div className='mt-6 rounded-3xl border border-muted overflow-hidden'>
        <table className='w-full text-left' style={{color:'var(--text)'}}>
          <thead className='text-sm' style={{background:'color-mix(in srgb, var(--text) 6%, transparent)', opacity:.8}}>
            <tr><th className='p-4'>Тема</th><th className='p-4'>Ответы</th><th className='p-4'>Тэг</th><th className='p-4'>Последний ответ</th></tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className='border-t border-muted hover:bg-glass'>
                <td className='p-4 font-medium'>{t.title}</td>
                <td className='p-4'>{t.replies}</td>
                <td className='p-4'><span className='px-2 py-1 rounded-lg' style={{background:'color-mix(in srgb, var(--text) 10%, transparent)', opacity:.9}}>{t.tag}</span></td>
                <td className='p-4 opacity-70'>{t.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='mt-4 text-sm opacity-70' style={{color:'var(--text)'}}>Полноценный форум доступен после авторизации. В планах: профили, роли, модерация, Markdown‑редактор.</div>
    </Section>
  )
}
