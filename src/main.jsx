// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Root from './app/Root.jsx';
import Home from './app/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Forgot from './pages/Forgot.jsx';
import Cabinet from './pages/Cabinet.jsx';
import Settings from './pages/Settings.jsx';
import RequireAuth from './components/RequireAuth.jsx';

// --- новые страницы предсказаний ---
import TarotPage from './pages/predictions/TarotPage.jsx';
import MatrixPage from './pages/predictions/MatrixPage.jsx';
import PalmAIPage from './pages/predictions/PalmAIPage.jsx';
import CoffeePage from './pages/predictions/CoffeePage.jsx';
import HoroscopePage from './pages/predictions/HoroscopePage.jsx';
import HoroscopeDetailPage from './pages/predictions/HoroscopeDetailPage.jsx';
import ForumPage from './pages/ForumPage.jsx';
import ForumThreadPage from './pages/ForumThreadPage.jsx';
import ExpertsPage from './pages/ExpertsPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ForumCreatePage from './pages/ForumCreatePage.jsx';
import { initTheme } from './theme/themes';
import './index.css';

initTheme();

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Root />}>
          <Route index element={<Home />} />

          {/* публичные предсказания */}
          <Route path="/predictions/tarot" element={<TarotPage />} />
          <Route path="/predictions/matrix" element={<MatrixPage />} />
          <Route path="/predictions/palm" element={<PalmAIPage />} />
          <Route path="/predictions/coffee" element={<CoffeePage />} />
          <Route path="/predictions/horoscope" element={<HoroscopePage />} />
          <Route path="/predictions/horoscope/:sign" element={<HoroscopeDetailPage />} />
          {/* прайсинг */}
          <Route path="/pricing" element={<PricingPage />} />
          {/* форум и специалисты */}
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/forum/:slug" element={<ForumThreadPage />} />
          <Route path="/forum/new" element={
            <RequireAuth>
              <ForumCreatePage />
            </RequireAuth>
          } />
          <Route path="/experts" element={<ExpertsPage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />

          {/* защищённые */}
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

          {/* редирект/404 по желанию */}
          <Route path="/predictions" element={<Navigate to="/predictions/tarot" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
