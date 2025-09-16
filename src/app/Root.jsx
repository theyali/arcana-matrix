// src/app/Root.jsx
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';
import Starfield from '../components/Starfield';
import PageTransition from '../components/PageTransition';

// маленький лоадер в области контента
function RouteLoader() {
  return (
    <div className="py-16 grid place-items-center">
      <div className="flex items-center gap-3 opacity-80" style={{ color: 'var(--text)' }}>
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        <span>Загрузка…</span>
      </div>
    </div>
  );
}

export default function Root(){
  return (
    <div className="app-bg">
      <Starfield maxStars={380} />
      <div className="relative z-10 min-h-[100svh] flex flex-col">
        <Navbar/>
        <Breadcrumbs/>
        <main className="flex-1">
          <Suspense fallback={<RouteLoader />}>
            <PageTransition>
              <Outlet/>
            </PageTransition>
          </Suspense>
        </main>
        <Footer/>
      </div>
    </div>
  );
}
