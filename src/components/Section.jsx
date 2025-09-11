import React from 'react'
export default function Section({ id, className='', children }) {
  return (
    <section id={id} className={[ 'py-16 md:py-24', className ].filter(Boolean).join(' ')}>
      <div className='container mx-auto px-4 max-w-7xl'>{children}</div>
    </section>
  )
}
