// src/main.jsx
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Root from './app/Root.jsx'; // каркас
import { AuthProvider } from './context/AuthContext.jsx';
import { initTheme } from './theme/themes';
import './index.css';
import { Sparkles, Loader2 } from 'lucide-react';

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

// --- простая ErrorBoundary, чтобы вместо «чёрного экрана» показать UI и дать повторить ---
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(err) { return { hasError: true, err }; }
  componentDidCatch(err, info) { console.error('Route error:', err, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100svh] grid place-items-center p-8 text-center" style={{ color: 'var(--text)' }}>
          <div className="max-w-md">
            <div
              className="mx-auto mb-4 h-12 w-12 rounded-2xl grid place-items-center shadow"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))' }}
            >
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-lg font-semibold mb-2">Не удалось загрузить страницу</h1>
            <p className="opacity-75 mb-4">Попробуйте обновить страницу. Если ошибка повторяется, проверьте сеть.</p>
            <button
              className="btn-primary px-5 py-3 rounded-2xl font-semibold"
              onClick={() => window.location.reload()}
            >
              Обновить
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- ленивые страницы ---
const Home = React.lazy(() => import('./app/Home.jsx'));

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

initTheme();

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      {/* Оборачиваем роутер в ErrorBoundary + красивый лоадер */}
      <RouteErrorBoundary>
        <Suspense fallback={<FullScreenLoader />}>
          <Routes>
            <Route element={<Root />}>
              <Route index element={<Home />} />

              {/* ANALYSIS */}
              <Route path="/analysis/face" element={<Face />} />
              <Route path="/analysis/handwriting" element={<Handwriting />} />
              <Route path="/analysis/dreams" element={<Dreams />} />
              <Route path="/analysis/compatibility" element={<Compatibility />} />
              <Route path="/analysis" element={<Navigate to="/analysis/face" replace />} />

              {/* PREDICTIONS */}
              <Route path="/predictions/tarot" element={<TarotPage />} />
              <Route path="/predictions/matrix" element={<MatrixPage />} />
              <Route path="/predictions/palm" element={<PalmAIPage />} />
              <Route path="/predictions/coffee" element={<CoffeePage />} />
              <Route path="/predictions/horoscope" element={<HoroscopePage />} />
              <Route path="/predictions/horoscope/:sign" element={<HoroscopeDetailPage />} />
              <Route path="/predictions" element={<Navigate to="/predictions/tarot" replace />} />

              {/* PRICING */}
              <Route path="/pricing" element={<PricingPage />} />

              {/* FORUM & EXPERTS */}
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/forum/:slug" element={<ForumThreadPage />} />
              <Route
                path="/forum/new"
                element={
                  <RequireAuth>
                    <ForumCreatePage />
                  </RequireAuth>
                }
              />
              <Route path="/experts" element={<ExpertsPage />} />

              {/* AUTH */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot" element={<Forgot />} />

              {/* PROTECTED */}
              <Route
                path="/cabinet"
                element={
                  <RequireAuth>
                    <Cabinet />
                  </RequireAuth>
                }
              />
              <Route
                path="/settings"
                element={
                  <RequireAuth>
                    <Settings />
                  </RequireAuth>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </BrowserRouter>
  </AuthProvider>
);
