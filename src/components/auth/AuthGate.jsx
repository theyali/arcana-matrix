// src/components/auth/AuthGate.jsx
import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

/**
 * Обёртка для любого блока/страницы, требующего авторизацию.
 * Пока loading=true — оверлей НЕ показываем (нет флика).
 * Если isAuthed=false — блюрим children и рисуем замок-оверлей.
 */
export default function AuthGate({
  children,
  loginPath = "/login",
  blur = true,
  className = "",
  overlayClassName = "",
  title = "Войдите, чтобы продолжить",
  description = "Эта функция доступна только авторизованным пользователям.",
  lock = "🔒",
}) {
  const { isAuthed, loading } = useAuth();
  const loc = useLocation();
  const next = encodeURIComponent(loc.pathname + loc.search);

  const showOverlay = !loading && !isAuthed;

  return (
    <div className={`relative ${className}`}>
      {/* Контент (можно блюрить) */}
      <div className={showOverlay && blur ? "filter blur-[2px] pointer-events-none select-none" : ""}>
        {children}
      </div>

      {/* Замок/оверлей */}
      {showOverlay && (
        <div className={`absolute inset-0 z-10 grid place-items-center ${overlayClassName}`}>
          <div className="backdrop-blur-sm bg-black/30 rounded-2xl border border-white/10 px-5 py-4 max-w-md text-center">
            <div className="text-2xl mb-2" aria-hidden>{lock}</div>
            <div className="font-semibold mb-1">{title}</div>
            <div className="opacity-80 text-sm mb-3">{description}</div>
            <Link
              to={`${loginPath}?next=${next}`}
              className="btn-primary rounded-2xl px-5 py-2 font-semibold inline-block"
            >
              Войти
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
