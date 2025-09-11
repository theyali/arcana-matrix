// src/components/AccountSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User, LogOut } from "lucide-react";

/**
 * Универсальный сайдбар аккаунта.
 *
 * props:
 * - profile: { name: string, plan?: string }
 * - items: Array<{ key: string, label: string, icon: React.FC, href?: string }>
 * - activeKey?: string                      // подсветка активного пункта (для вкладок)
 * - onChange?: (key: string)=>void          // вызывается, если клик по пункту без href
 * - onLogout?: ()=>void
 * - mobileOpen?: boolean                    // состояние мобильного выезжающего меню
 * - onMobileClose?: ()=>void
 * - stickyClass?: string                    // по умолчанию 'top-24'
 */
export default function AccountSidebar({
  profile,
  items,
  activeKey,
  onChange,
  onLogout,
  mobileOpen = false,
  onMobileClose = () => {},
  stickyClass = "top-24",
}) {
  const location = useLocation();

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive =
      (activeKey && activeKey === item.key) ||
      (!!item.href && location.pathname === item.href);

    const base =
      "w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition";

    if (item.href) {
      return (
        <Link
          to={item.href}
          className={`${base} ${isActive ? "bg-white/10 border border-white/10" : "hover:bg-white/5"}`}
          onClick={onMobileClose}
        >
          <Icon size={18} className={isActive ? "" : "opacity-80"} />
          <span>{item.label}</span>
        </Link>
      );
    }
    return (
      <button
        type="button"
        className={`${base} ${isActive ? "bg-white/10 border border-white/10" : "hover:bg-white/5"}`}
        onClick={() => {
          onChange?.(item.key);
          onMobileClose();
        }}
      >
        <Icon size={18} className={isActive ? "" : "opacity-80"} />
        <span>{item.label}</span>
      </button>
    );
  };

  const SidebarInner = () => (
    <div className="panel-card p-5">
      {/* профиль */}
      <div className="flex items-center gap-3 mb-4">
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile?.name || "Аватар"}
            className="h-12 w-12 rounded-2xl object-cover"
          />
        ) : (
          <div
            className="h-12 w-12 rounded-2xl grid place-items-center text-white"
            style={{ background: "linear-gradient(135deg,var(--primary),var(--accent))" }}
          >
            <User size={18} />
          </div>
        )}
        <div>
          <div className="font-semibold" style={{ color: "var(--text)" }}>
            {profile?.name || "Пользователь"}
          </div>
          {profile?.plan && (
            <div className="text-xs opacity-70">Тариф: {profile.plan}</div>
          )}
        </div>
      </div>

      {/* навигация */}
      <nav className="space-y-1">
        {items?.map((it) => <NavItem key={it.key} item={it} />)}
      </nav>

      {/* logout */}
      {onLogout && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-white/5"
            onClick={onLogout}
          >
            <LogOut size={18} /> Выйти
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className={`hidden lg:block sticky ${stickyClass}`}>
        <SidebarInner />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-xs bg-[color:var(--card,rgba(255,255,255,0.06))] backdrop-blur-md border-r border-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile?.name || "Аватар"}
                    className="h-10 w-10 rounded-2xl object-cover"
                  />
                ) : (
                  <div
                    className="h-10 w-10 rounded-2xl grid place-items-center text-white"
                    style={{ background: "linear-gradient(135deg,var(--primary),var(--accent))" }}
                  >
                    <User size={16} />
                  </div>
                )}
                <div>
                  <div className="font-semibold">{profile?.name || "Пользователь"}</div>
                  {profile?.plan && (
                    <div className="text-xs opacity-70">Тариф: {profile.plan}</div>
                  )}
                </div>
              </div>
              <button
                className="btn-ghost rounded-xl px-3 py-1 text-sm"
                onClick={onMobileClose}
              >
                Закрыть
              </button>
            </div>

            <nav className="space-y-1">
              {items?.map((it) => <NavItem key={`m-${it.key}`} item={it} />)}
            </nav>

            {onLogout && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-white/5"
                  onClick={() => {
                    onLogout();
                    onMobileClose();
                  }}
                >
                  <LogOut size={18} /> Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
