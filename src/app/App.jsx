// src/app/App.jsx
import React from 'react'
import '../index.css'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import TarotSection from '../features/tarot'
import MatrixSection from '../features/matrix'
import ExpertsSection from '../features/experts'
import ForumSection from '../features/forum'
import PricingSection from '../features/pricing'
import TelegramCTA from '../features/telegram'
import Footer from '../components/Footer'

export default function App(){
  return (
    <div className='app-bg'>
      <Navbar/>
      <Hero/>
      <TarotSection/>
      <MatrixSection/>
      <ExpertsSection/>
      <ForumSection/>
      <PricingSection/>
      <TelegramCTA/>
      <Footer/>
    </div>
  )
}
