// src/app/Home.jsx
import React from 'react';
import Hero from '../components/Hero';
import TarotSection from '../features/tarot';
import MatrixSection from '../features/matrix';
import ExpertsSection from '../features/experts';
import ForumSection from '../features/forum';
import PricingSection from '../features/pricing';
import ContactsHomeSection from '../features/contacts-home';   // ← новое
import TelegramCTA from '../features/telegram';

export default function Home(){
  return (
    <>
      <Hero/>
      <TarotSection/>
      <MatrixSection/>
      <ExpertsSection/>
      <ForumSection/>
      <PricingSection/>
      <ContactsHomeSection/>
      <TelegramCTA/>
    </>
  );
}
