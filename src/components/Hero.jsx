// src/components/Hero.jsx
import React from 'react'
import Section from './Section'
import Pill from './Pill'
import { PrimaryButton, GhostButton } from './Buttons'
import { Bot, Star, Users, CreditCard, ChevronRight, Shield, Shuffle, MessageSquare, Lock, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CardsGrid from './CardsGrid';



export default function Hero(){
  const { t } = useTranslation();

  return (
    <Section id='hero' className='pt-10 md:pt-10'>
      <div className='grid lg:grid-cols-2 gap-10'>
        <div>
          <div className="first-block-hero">
            <h1 className='text-4xl md:text-6xl font-extrabold leading-tight hero-title' style={{color:'var(--text)'}}>
              {t('hero.title.1')}
              <span className='gradient-text'>{t('hero.title.2')}</span>
              {t('hero.title.3')}
            </h1>
            <p className='mt-5 text-lg md:text-xl max-w-xl hero-subtitle' style={{color:'var(--text)', opacity:.8}}>
              {t('hero.subtitle')}
            </p>
            <div className='mt-6 flex flex-wrap items-center gap-3'>
              <Pill icon={Bot}>{t('hero.pill.ai')}</Pill>
              <Pill icon={Star}>{t('hero.pill.matrix')}</Pill>
              <Pill icon={Users}>{t('hero.pill.forum')}</Pill>
            </div>
            <div className='mt-8 flex flex-wrap gap-3'>
              <PrimaryButton onClick={() => document.getElementById('ai')?.scrollIntoView({ behavior: 'smooth' })} className="cta-btn-main" >
                {t('hero.cta.try')} <ChevronRight size={18} />
              </PrimaryButton>
              <GhostButton onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="cta-btn-main" >
                {t('nav.pricing')} <CreditCard size={18} />
              </GhostButton>
            </div>
          </div>
          <div className="mt-10 hidden lg:block">
            <div
              className="rounded-2xl border border-muted p-5 shadow-soft backdrop-blur-sm"
              style={{ background: 'color-mix(in srgb, var(--text) 4%, transparent)' }}
            >
              {/* Как это работает — 3 шага */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl p-4 border border-muted/60">
                  <div className="flex items-center gap-2">
                    <Shuffle size={18} />
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>{t('hero.steps.one.title')}</p>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text)', opacity: .8 }}>
                    {t('hero.steps.one.body')}
                  </p>
                </div>

                <div className="rounded-xl p-4 border border-muted/60">
                  <div className="flex items-center gap-2">
                    <Bot size={18} />
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>{t('hero.steps.two.title')}</p>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text)', opacity: .8 }}>
                    {t('hero.steps.two.body')}
                  </p>
                </div>

                <div className="rounded-xl p-4 border border-muted/60">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} />
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>{t('hero.steps.three.title')}</p>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text)', opacity: .8 }}>
                    {t('hero.steps.three.body')}
                  </p>
                </div>
              </div>

              {/* Гарантии и преимущества */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--text)', opacity: .8 }}>
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-muted">
                  <Shield size={16}/> {t('hero.badges.privacy')}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-muted">
                  <Lock size={16}/> {t('hero.badges.offline')}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-muted">
                  <Sparkles size={16}/> {t('hero.badges.demo')}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-muted">
                  <Bot size={18} /> {t('hero.badges.trained')}
                </span>
              </div>
            </div>
          </div>

          <div className="third-block-hero mt-6 hidden lg:block mt-15">
            <div
              className="rounded-2xl border border-muted p-5 shadow-soft relative overflow-hidden backdrop-blur-sm"
              style={{ background: 'color-mix(in srgb, var(--text) 4%, transparent)' }}
            >
              <p className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text)' }}>
                {t('hero.community.title')}
              </p>

              {/* Аватары + короткий копирайт */}
              <div className="mt-2 flex items-center gap-3">
                <div className="flex -space-x-3">
                  {['AN','SS','MK','YO','LL'].map((ini, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border border-muted flex items-center justify-center text-xs font-semibold shadow-soft"
                      style={{
                        color: 'var(--text)',
                        background:
                          'linear-gradient(135deg, color-mix(in srgb, var(--accent) 75%, transparent), color-mix(in srgb, var(--primary) 75%, transparent))'
                      }}
                      aria-hidden="true"
                    >
                      {ini}
                    </div>
                  ))}
                </div>
                <p className="text-sm max-w-[40ch]" style={{ color: 'var(--text)', opacity: .8 }}>
                  {t('hero.community.text')}
                </p>
              </div>

              {/* Счётчики — отдельной строкой */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { icon: Users, value: '20+', label: t('hero.counters.experts') },
                  { icon: Sparkles, value: '14+', label: t('hero.counters.templates') },
                  { icon: Shield, value: '100%', label: t('hero.counters.privacy') },
                ].map(({ icon: Icon, value, label }, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 rounded-xl border border-muted/60 text-center"
                    style={{ background: 'color-mix(in srgb, var(--text) 3%, transparent)' }}
                  >
                    <div className="text-2xl font-extrabold leading-none" style={{ color: 'var(--text)' }}>{value}</div>
                    <div className="mt-1 flex items-center justify-center gap-1 text-xs" style={{ color: 'var(--text)', opacity: .75 }}>
                      <Icon size={14} /> {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Рейтинг */}
              <div className="mt-4 flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="opacity-90" />
                ))}
                <span className="text-sm ml-1" style={{ color: 'var(--text)', opacity: .8 }}>{t('hero.rating.score')}</span>
                <span className="text-xs" style={{ color: 'var(--text)', opacity: .6 }}>· {t('hero.rating.reviews')}</span>
              </div>

              {/* Декор */}
              <div
                className="absolute -right-10 -top-10 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 60%)' }}
                aria-hidden="true"
              />
            </div>
          </div>

        </div>
        <div className='rounded-3xl border border-muted p-6 shadow-soft' style={{background:'color-mix(in srgb, var(--text) 6%, transparent)'}}>
          <CardsGrid/>
          <div className='mt-4 flex items-center gap-3 text-sm' style={{color:'var(--text)', opacity:.7}}>
            <Shield size={16}/> {t('hero.deck.note')}
          </div>
        </div>
      </div>
    </Section>
  )
}
