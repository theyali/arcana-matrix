import React from 'react'
export default function Footer(){
  return (
    <footer className='border-t border-muted'>
      <div className='container mx-auto px-4 max-w-7xl py-10 text-sm flex flex-col md:flex-row items-center justify-between gap-4'>
        <div style={{color:'var(--text)', opacity:.7}}>© {new Date().getFullYear()} Tarion. Все права защищены.</div>
        <div className='flex items-center gap-3' style={{color:'var(--text)', opacity:.7}}>
          <a href='#'>Условия</a>
          <a href='#'>Конфиденциальность</a>
          <a href='#'>Поддержка</a>
        </div>
      </div>
    </footer>
  )
}
