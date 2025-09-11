import React from 'react'
export const classNames = (...xs) => xs.filter(Boolean).join(' ')

export function PrimaryButton({ children, className='', ...rest }) {
  return (
    <button className={classNames('btn-primary group inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold text-white shadow-lg shadow-soft', className)} {...rest}>
      {children}
    </button>
  )
}

export function GhostButton({ children, className='', ...rest }) {
  return (
    <button className={classNames('btn-ghost inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold transition', className)} {...rest}>
      {children}
    </button>
  )
}
