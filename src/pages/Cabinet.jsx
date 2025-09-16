// src/pages/Cabinet.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Star, CalendarDays, Crown, Settings as SettingsIcon, HelpCircle, Menu, History as HistoryIcon } from "lucide-react";
import AccountSidebar from "../components/AccountSidebar";
import { getProfile, getPlanName, getAvatarUrl, buildDisplayName } from "../api/profile";

// вкладки
import {
  DashboardTab,
  SpreadsTab,
  AppointmentsTab,
  SubscriptionTab,
  SettingsTab,
  SupportTab,
  HistoryTab,
} from "./cabinet/index.js";


export default function Cabinet(){
  const { user, logout } = useAuth();
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const u = await getProfile();
        if (u) setProfile(u);
      } catch {}
    })();
  }, []);

  // демо-данные — потом с DRF
  const today = new Date().toLocaleDateString("ru-RU", { day:"2-digit", month:"long" });
  const aura = { color: "Морской индиго", mood: "спокойная сфокусированность", tip: "Сделайте 1 главный шаг — без распыления." };
  const u = profile || user || null;
  const sub = u?.plan ? { plan: getPlanName(u) } : { plan: "Free" };
  const savedSpreads = [
    { id:1, title:"Карьера: 3 карты", date:"01.09", result:"«Умеренность» как ключ" },
    { id:2, title:"Отношения: 1 карта", date:"29.08", result:"«Сила» — мягкая настойчивость" },
    { id:3, title:"Финансы: 3 карты", date:"25.08", result:"«Колесо фортуны»" },
  ];
  const upcoming = [
    { id:1, spec:"Мария Ведова · Таролог", time:"Сегодня, 19:30" },
    { id:2, spec:"Эмиль Рашидов · Коуч", time:"09.09, 16:00" },
  ];
  const contacts = { email: "support@example.com", tel: "+994 50 123 45 67", tg: "@tarion_support" };

  const [active, setActive] = React.useState("dashboard"); // dashboard | spreads | appointments | subscription | settings | support
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const NAV = [
    { key:"dashboard",    label:"Обзор",            icon: LayoutDashboard },
    { key:"spreads",      label:"Мои расклады",     icon: Star },
    { key:"appointments", label:"Встречи",          icon: CalendarDays },
    { key:"history",      label:"История",          icon: HistoryIcon },
    { key:"subscription", label:"Подписка",         icon: Crown },
    { key:"settings",     label:"Настройки",        icon: SettingsIcon },
    { key:"support",      label:"Поддержка",        icon: HelpCircle },
  ];

  const displayName = buildDisplayName(u);
  const username = u?.username || "";
  const avatarUrl = getAvatarUrl(u?.profile?.avatar) || u?.profile?.avatarUrl || "";

  const renderContent = () => {
    switch (active) {
      case "spreads":
        return <SpreadsTab savedSpreads={savedSpreads} />;
      case "appointments":
        return <AppointmentsTab upcoming={upcoming} />;
      case "subscription":
        return <SubscriptionTab sub={sub} />;
      case "settings":
        return <SettingsTab profile={u} onUpdated={setProfile} />;
      case "history":
        return <HistoryTab />;
      case "support":
        return <SupportTab contacts={contacts} />;
      default:
        return (
          <DashboardTab
            displayName={displayName}
            username={username}
            avatarUrl={avatarUrl}
            today={today}
            sub={sub}
            aura={aura}
            savedSpreads={savedSpreads}
            upcoming={upcoming}
          />
        );
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      {/* мобильная кнопка меню */}
      <div className="lg:hidden mb-4 flex items-center justify-between">
        <h1 className="h1 mb-0">Личный кабинет</h1>
        <button className="btn-ghost rounded-2xl px-3 py-2" onClick={()=>setSidebarOpen(true)}>
          <Menu size={18}/> Меню
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <AccountSidebar
            profile={{ name: displayName, plan: sub.plan, avatarUrl }}
            items={NAV}
            activeKey={active}
            onChange={setActive}
            onLogout={logout}
            mobileOpen={sidebarOpen}
            onMobileClose={()=>setSidebarOpen(false)}
          />
        </aside>

        {/* Content */}
        <main className="lg:col-span-9">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
