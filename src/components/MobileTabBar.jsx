import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Users, Layers, CreditCard, User as UserIcon } from "lucide-react";
import { useAuthStatus } from "../auth/useAuthStatus";
export default function MobileTabBar() {
  const { isAuthed } = useAuthStatus();
  const location = useLocation();
  if (!isAuthed) return null;         // показываем только авторизованным
  // язык из URL и helper для путей
  const LANGS = ["en", "ru", "uk"];
  const parts = location.pathname.split("/").filter(Boolean);
  const currentLng = parts[0] && LANGS.includes(parts[0]) ? parts[0] : "en";
  const langPrefix = currentLng !== "en" ? `/${currentLng}` : "";
  const withLang = (p) => `${langPrefix}${p}`;
  const itemCls = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 px-2 py-1 text-xs font-medium transition-opacity ${
      isActive ? "opacity-100" : "opacity-70"
    }`;
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40">
      <div className="mx-auto max-w-8xl">
        <nav
          className="relative rounded-3xl border border-muted shadow-xl backdrop-blur-md mobile-bottom-nav"
          style={{
            background:
              "color-mix(in srgb, var(--bg, #0b0b0f) 96%, black 4%)",
            paddingBottom: "max(env(safe-area-inset-bottom), 10px)",
          }}
          aria-label="Bottom navigation"
        >
          {/* полоса/блик сверху */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-4 left-1/2 h-6 w-40 -translate-x-1/2 rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(40% 100% at 50% 0%, color-mix(in oklab, var(--primary) 35%, transparent), transparent 70%)",
              filter: "blur(12px)",
            }}
          />
          <ul className="relative flex h-16 items-center justify-around">
            {/* Home */}
            <li>
              <NavLink to={withLang("/")} className={itemCls} aria-label="Home">
                <Home size={22} />
                <span>Home</span>
              </NavLink>
            </li>
            {/* Experts */}
            <li>
              <NavLink to={withLang("/experts")} className={itemCls} aria-label="Experts">
                <Users size={22} />
                <span>Experts</span>
              </NavLink>
            </li>
            {/* BIG center Deck */}
            <li className="relative -mt-10">
              <NavLink
                to={withLang("/virtual-decks")}
                aria-label="Decks"
                className={({ isActive }) =>
                  `grid place-items-center rounded-full shadow-2xl transition-transform ${
                    isActive ? "scale-100" : "scale-100"
                  }`
                }
                style={{
                  width: 64,
                  height: 64,
                  background:
                    "linear-gradient(135deg, var(--accent), var(--primary))",
                  color: "#fff",
                }}
              >
                <Layers size={26} />
              </NavLink>
            </li>
            {/* Pricing */}
            <li>
              <NavLink to={withLang("/pricing")} className={itemCls} aria-label="Pricing">
                <CreditCard size={22} />
                <span>Plans</span>
              </NavLink>
            </li>
            {/* Profile (Cabinet) */}
            <li>
              <NavLink to={withLang("/cabinet")} className={itemCls} aria-label="Profile">
                <UserIcon size={22} />
                <span>Profile</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
