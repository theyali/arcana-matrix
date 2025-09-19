// src/components/RouteErrorBoundary.jsx
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default class RouteErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError: false, err: null };
  }

  static getDerivedStateFromError(err){
    return { hasError: true, err };
  }

  componentDidCatch(err, info){
    // Логи в консоль — чтобы видеть стек
    console.error("Route error:", err, info);
  }

  onReload = () => {
    // Можно просто обновить страницу
    window.location.reload();
  };

  render(){
    if (!this.state.hasError) return this.props.children;

    // Фолбэк с хедером/футером — без «full screen» оверлея
    return (
      <div className="app-bg">
        <div className="relative z-10 min-h-[100svh] flex flex-col">
          <Navbar/>
          <main className="flex-1">
            <div className="min-h-[60svh] grid place-items-center p-8 text-center" style={{ color: 'var(--text)' }}>
              <div className="max-w-md">
                <div
                  className="mx-auto mb-4 h-12 w-12 rounded-2xl grid place-items-center shadow"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))' }}
                  aria-hidden
                >
                  {/* простая иконка-звёздочка (можно заменить на Lucide Sparkles, если хочешь) */}
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                    <path d="M12 2l1.76 4.64L18.5 8l-3.74 2.36L13.76 15 12 10.82 10.24 15l-.99-4.64L5.5 8l4.74-1.36L12 2z"/>
                  </svg>
                </div>
                <h1 className="text-lg font-semibold mb-2">Не удалось загрузить страницу</h1>
                <p className="opacity-75 mb-4">
                  Попробуйте обновить страницу. Если ошибка повторяется, проверьте сеть или логи консоли.
                </p>
                <button
                  className="btn-primary px-5 py-3 rounded-2xl font-semibold"
                  onClick={this.onReload}
                >
                  Обновить
                </button>
              </div>
            </div>
          </main>
          <Footer/>
        </div>
      </div>
    );
  }
}
