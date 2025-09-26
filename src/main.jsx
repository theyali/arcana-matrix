// src/main.jsx
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Root from './app/Root.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { initTheme } from './theme/themes';
import './index.css';
import './i18n';
import { Sparkles, Loader2 } from 'lucide-react';
import LangGate from './app/LangGate.jsx';
import EnGate from './app/EnGate.jsx';
// ⬇️ новый импорт
import RouteErrorBoundary from './components/RouteErrorBoundary.jsx';

// --- красивый полноэкранный лоадер ---
function FullScreenLoader() {
  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center"
      style={{
        background:
          'radial-gradient(1200px 800px at 50% 20%, color-mix(in oklab, var(--primary) 12%, transparent), transparent), var(--bg, #0b0b0f)'
      }}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-12 w-12 rounded-2xl grid place-items-center shadow-xl"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))' }}
        >
          <Sparkles className="h-6 w-6 text-white animate-pulse" />
        </div>
        <div className="flex items-center gap-3 text-sm opacity-80" style={{ color: 'var(--text, #fff)' }}>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Загружаем страницу…</span>
        </div>
      </div>
    </div>
  );
}

// --- ленивые страницы ---
const Home = React.lazy(() => import('./app/Home.jsx'));
const VirtualDeckPage = React.lazy(() => import('./features/virtual-deck/VirtualDeckPage.jsx'));

// Auth
const Login = React.lazy(() => import('./pages/Login.jsx'));
const Register = React.lazy(() => import('./pages/Register.jsx'));
const Forgot = React.lazy(() => import('./pages/Forgot.jsx'));

// Protected
const RequireAuth = React.lazy(() => import('./components/RequireAuth.jsx'));
const Cabinet = React.lazy(() => import('./pages/Cabinet.jsx'));
const Settings = React.lazy(() => import('./pages/Settings.jsx'));

// Predictions
const TarotPage = React.lazy(() => import('./pages/predictions/TarotPage.jsx'));
const MatrixPage = React.lazy(() => import('./pages/predictions/MatrixPage.jsx'));
const PalmAIPage = React.lazy(() => import('./pages/predictions/PalmAIPage.jsx'));
const CoffeePage = React.lazy(() => import('./pages/predictions/CoffeePage.jsx'));
const HoroscopePage = React.lazy(() => import('./pages/predictions/HoroscopePage.jsx'));
const HoroscopeDetailPage = React.lazy(() => import('./pages/predictions/HoroscopeDetailPage.jsx'));

// Analysis
const Face = React.lazy(() => import('./pages/analysis/Face.jsx'));
const Handwriting = React.lazy(() => import('./pages/analysis/Handwriting.jsx'));
const Dreams = React.lazy(() => import('./pages/analysis/Dreams.jsx'));
const Compatibility = React.lazy(() => import('./pages/analysis/Compatibility.jsx'));

// Forum / Experts / Pricing
const ForumPage = React.lazy(() => import('./pages/ForumPage.jsx'));
const ForumThreadPage = React.lazy(() => import('./pages/ForumThreadPage.jsx'));
const ForumCreatePage = React.lazy(() => import('./pages/ForumCreatePage.jsx'));
const ExpertsPage = React.lazy(() => import('./pages/ExpertsPage.jsx'));
const PricingPage = React.lazy(() => import('./pages/PricingPage.jsx'));
const LunarCalendarPage = React.lazy(() => import('./pages/predictions/LunarCalendarPage.jsx'));

initTheme();

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      {/* Оборачиваем роутер в ErrorBoundary + красивый лоадер */}
      <RouteErrorBoundary>
        <Suspense fallback={<FullScreenLoader />}>
          <Routes>
            {/* --- Английская ветка БЕЗ префикса (EnGate принудительно включает EN) --- */}
            <Route element={<EnGate />}>
              <Route element={<Root />}>
                <Route index element={<Home />} />

                {/* ANALYSIS */}
                <Route path="analysis/face" element={<Face />} />
                <Route path="analysis/handwriting" element={<Handwriting />} />
                <Route path="analysis/dreams" element={<Dreams />} />
                <Route path="analysis/compatibility" element={<Compatibility />} />
                <Route path="analysis" element={<Navigate to="analysis/face" replace />} />

                {/* PREDICTIONS */}
                <Route path="predictions/tarot" element={<TarotPage />} />
                <Route path="predictions/matrix" element={<MatrixPage />} />
                <Route path="predictions/palm" element={<PalmAIPage />} />
                <Route path="predictions/coffee" element={<CoffeePage />} />
                <Route path="predictions/horoscope" element={<HoroscopePage />} />
                <Route path="predictions/horoscope/:sign" element={<HoroscopeDetailPage />} />
                <Route path="predictions/lunar" element={<LunarCalendarPage />} />

                {/* PRICING */}
                <Route path="pricing" element={<PricingPage />} />

                {/* FORUM & EXPERTS */}
                <Route path="forum" element={<ForumPage />} />
                <Route path="forum/:slug" element={<ForumThreadPage />} />
                <Route
                  path="forum/new"
                  element={
                    <RequireAuth>
                      <ForumCreatePage />
                    </RequireAuth>
                  }
                />
                <Route path="experts" element={<ExpertsPage />} />

                {/* AUTH */}
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot" element={<Forgot />} />

                {/* VIRTUAL DECKS */}
                <Route path="virtual-decks" element={<VirtualDeckPage />} />

                {/* PROTECTED */}
                <Route
                  path="cabinet"
                  element={
                    <RequireAuth>
                      <Cabinet />
                    </RequireAuth>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <RequireAuth>
                      <Settings />
                    </RequireAuth>
                  }
                />
              </Route>
            </Route>

            {/* --- RU/UK ветки С префиксом --- */}
            <Route path="/:lng" element={<LangGate />}>
              <Route element={<Root />}>
                <Route index element={<Home />} />

                {/* ANALYSIS */}
                <Route path="analysis/face" element={<Face />} />
                <Route path="analysis/handwriting" element={<Handwriting />} />
                <Route path="analysis/dreams" element={<Dreams />} />
                <Route path="analysis/compatibility" element={<Compatibility />} />
                <Route path="analysis" element={<Navigate to="analysis/face" replace />} />

                {/* PREDICTIONS */}
                <Route path="predictions/tarot" element={<TarotPage />} />
                <Route path="predictions/matrix" element={<MatrixPage />} />
                <Route path="predictions/palm" element={<PalmAIPage />} />
                <Route path="predictions/coffee" element={<CoffeePage />} />
                <Route path="predictions/horoscope" element={<HoroscopePage />} />
                <Route path="predictions/horoscope/:sign" element={<HoroscopeDetailPage />} />
                <Route path="predictions/lunar" element={<LunarCalendarPage />} />

                {/* PRICING */}
                <Route path="pricing" element={<PricingPage />} />

                {/* FORUM & EXPERTS */}
                <Route path="forum" element={<ForumPage />} />
                <Route path="forum/:slug" element={<ForumThreadPage />} />
                <Route
                  path="forum/new"
                  element={
                    <RequireAuth>
                      <ForumCreatePage />
                    </RequireAuth>
                  }
                />
                <Route path="experts" element={<ExpertsPage />} />

                {/* AUTH */}
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot" element={<Forgot />} />

                {/* VIRTUAL DECKS */}
                <Route path="virtual-decks" element={<VirtualDeckPage />} />

                {/* PROTECTED */}
                <Route
                  path="cabinet"
                  element={
                    <RequireAuth>
                      <Cabinet />
                    </RequireAuth>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <RequireAuth>
                      <Settings />
                    </RequireAuth>
                  }
                />
              </Route>
            </Route>

            {/* Фоллбек — на корень (EN) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </BrowserRouter>
  </AuthProvider>
);
