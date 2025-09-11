import React from 'react'
export default function Pill({ children, icon: Icon }){
  return (
    <span className='inline-flex items-center gap-2 rounded-full border border-muted bg-glass px-3 py-1 text-sm text-muted'>
      {Icon ? <Icon size={16} /> : null}
      <span style={{color:'var(--text)'}}>{children}</span>
    </span>
  )
}
