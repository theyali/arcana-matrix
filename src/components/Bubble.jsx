import React from 'react'
import { classNames } from './Buttons'
export default function Bubble({ role, children }){
  const isUser = role === 'user'
  return (
    <div className={classNames('flex', isUser ? 'justify-end':'justify-start')}>
      <div className={classNames('max-w-[85%] rounded-2xl px-3 py-2 text-sm', isUser ? 'border border-[var(--accent)]' : 'border border-muted')} style={{background: isUser ? 'color-mix(in srgb, var(--accent) 20%, transparent)':'color-mix(in srgb, var(--text) 6%, transparent)', color: 'var(--text)'}}>
        {children}
      </div>
    </div>
  )
}
