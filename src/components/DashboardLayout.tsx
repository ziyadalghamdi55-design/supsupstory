/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useBilingual } from '../BilingualContext';
import { 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Code, 
  LogOut, 
  Globe, 
  Menu, 
  X,
  User,
  ShieldAlert,
  Loader2,
  Package,
  ShoppingCart,
  Store,
  Volume2,
  VolumeX,
  Bell,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import CustomerChatView from './CustomerChatView';
import AdminLockModal from './AdminLockModal';
import { playNotificationChime, getSoundEnabled, setSoundEnabled } from '../utils/audioAlert';

export default function DashboardLayout() {
  const { language, direction, dictionary, toggleLanguage } = useBilingual();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeUser, setActiveUser] = useState<any>(() => {
    const raw = localStorage.getItem('shakhsi_current_user');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    return { id: 'owner_master', name: 'مدير المتجر', email: 'admin@shakhsi.com', role: 'owner' };
  });
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean>(true);
  const [customerThread, setCustomerThread] = useState<any>(null);
  const [loadingMe, setLoadingMe] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('shakhsi_admin_authed') === 'true';
  });

  // Sound Notification Alert State
  const [soundEnabled, setSoundState] = useState<boolean>(() => getSoundEnabled());
  const [incomingAlert, setIncomingAlert] = useState<{ title: string; desc: string; link: string } | null>(null);

  const prevOrdersCountRef = useRef<number | null>(null);
  const prevMessagesCountRef = useRef<number | null>(null);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundState(next);
    setSoundEnabled(next);
    if (next) {
      playNotificationChime();
    }
  };

  const checkAuth = () => {
    // 100% Client-side authentication check
    const isAuthed = localStorage.getItem('shakhsi_admin_authed') === 'true';
    if (isAuthed) {
      setIsAdminUnlocked(true);
    }
    const raw = localStorage.getItem('shakhsi_current_user');
    let localUser = {
      id: 'owner_master',
      name: 'مدير المتجر',
      email: 'ziyadalghamdi55@gmail.com',
      role: 'owner',
    };
    if (raw) {
      try {
        localUser = { ...localUser, ...JSON.parse(raw) };
      } catch (e) {}
    }
    setActiveUser(localUser);
    setIsOwner(true);
    setLoadingMe(false);

    // Asynchronously fetch workspace configs without blocking or gating auth
    fetch('/api/workspace')
      .then((r) => r.json())
      .then((ws) => {
        if (ws && ws.name) setActiveWorkspace(ws);
      })
      .catch(() => {});
  };

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  // Dashboard Live Polling with Sound Alert Ding
  useEffect(() => {
    if (!isAdminUnlocked || !isOwner) return;

    const pollInterval = setInterval(async () => {
      try {
        // 1. Check for newly arriving orders
        const ordersRes = await fetch('/api/store/orders');
        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          if (Array.isArray(orders)) {
            if (prevOrdersCountRef.current !== null && orders.length > prevOrdersCountRef.current) {
              const newOrder = orders[0];
              playNotificationChime();
              setIncomingAlert({
                title: language === 'ar' ? 'طلب شراء جديد وصل الآن!' : 'New Digital Order Received!',
                desc: `${newOrder.product_name} (${newOrder.amount} ${language === 'ar' ? 'ر.س' : 'SAR'}) - ${newOrder.customer_email}`,
                link: '/dashboard/orders'
              });
            }
            prevOrdersCountRef.current = orders.length;
          }
        }

        // 2. Check for customer inquiries
        const convRes = await fetch('/api/conversations');
        if (convRes.ok) {
          const conversations = await convRes.json();
          if (Array.isArray(conversations)) {
            const totalMsg = conversations.reduce((acc, c) => acc + (c.messages ? c.messages.length : 0), 0);
            if (prevMessagesCountRef.current !== null && totalMsg > prevMessagesCountRef.current) {
              playNotificationChime();
              setIncomingAlert({
                title: language === 'ar' ? 'استفسار عميل جديد في المحادثة!' : 'New Customer Inquiry Message!',
                desc: language === 'ar' ? 'وصلت رسالة جديدة من أحد زوار المتجر.' : 'A new customer message was received in inbox.',
                link: '/dashboard'
              });
            }
            prevMessagesCountRef.current = totalMsg;
          }
        }
      } catch (e) {
        // Silent catch for background poll
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [isAdminUnlocked, isOwner, language]);

  // Dismiss incoming alert automatically after 7s
  useEffect(() => {
    if (incomingAlert) {
      const timer = setTimeout(() => setIncomingAlert(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [incomingAlert]);

  const handleLogout = () => {
    localStorage.removeItem('shakhsi_admin_authed');
    localStorage.removeItem('shakhsi_current_user');
    setIsAdminUnlocked(false);
    navigate('/');
  };

  if (loadingMe) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-800 animate-spin" />
      </div>
    );
  }

  // If the admin lock is engaged, require master PIN / password
  if (!isAdminUnlocked) {
    return (
      <AdminLockModal
        onSuccess={() => {
          setIsAdminUnlocked(true);
          checkAuth();
        }}
      />
    );
  }

  // Intercept standard clients/customers - they can only see the single viewport chatbot!
  if (!isOwner) {
    return (
      <CustomerChatView 
        user={activeUser}
        customerThread={customerThread}
        activeWorkspace={activeWorkspace}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased selection:bg-slate-900 selection:text-white">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-950 text-white h-16 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-slate-950 flex items-center justify-center rounded font-extrabold text-sm">ش</div>
          <span className="font-bold text-base tracking-tight">{dictionary.appName}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="text-xs font-bold bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md cursor-pointer"
          >
            {language === 'en' ? 'عربي' : 'EN'}
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 text-slate-300 hover:text-white"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Persistent Left Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-900 transition-transform duration-300 transform
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${direction === 'rtl' ? 'right-0 left-auto border-l border-r-0' : ''}
      `}>
        {/* Sidebar Header logotype */}
        <div className="h-16 px-6 border-b border-slate-900 flex items-center gap-3 shrink-0 bg-slate-950">
          <div className="w-8 h-8 bg-white text-slate-950 flex items-center justify-center rounded-lg font-black text-base shadow-sm">ش</div>
          <div>
            <span className="font-extrabold text-white text-base block tracking-tight">{dictionary.appName} Platform</span>
            <span className="text-[9px] text-emerald-400 font-mono font-bold tracking-widest block uppercase -mt-0.5">● workspace active</span>
          </div>
        </div>

        {/* Workspace identifier banner */}
        {activeWorkspace && (
          <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-900 shrink-0 text-xs">
            <span className="text-slate-500 font-bold block uppercase text-[10px] tracking-wider mb-1">active bot handle</span>
            <span className="text-slate-100 font-bold tracking-tight inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {activeWorkspace.bot_name}
            </span>
          </div>
        )}

        {/* Dashboard Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLink
            to="/dashboard"
            end
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer
              ${isActive 
                ? 'bg-white/10 text-white font-bold' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <MessageSquare className="w-4.5 h-4.5" />
            <span>{dictionary.inbox}</span>
            {location.pathname === '/dashboard' && (
              <span className="ml-auto bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                live
              </span>
            )}
          </NavLink>

          <NavLink
            to="/dashboard/products"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer
              ${isActive 
                ? 'bg-white/10 text-white font-bold' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <Package className="w-4.5 h-4.5" />
            <span>{dictionary.products}</span>
          </NavLink>

          <NavLink
            to="/dashboard/orders"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer
              ${isActive 
                ? 'bg-white/10 text-white font-bold' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <ShoppingCart className="w-4.5 h-4.5" />
            <span>{dictionary.orders}</span>
          </NavLink>

          <NavLink
            to="/dashboard/analytics"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer
              ${isActive 
                ? 'bg-white/10 text-white font-bold' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <BarChart3 className="w-4.5 h-4.5" />
            <span>{dictionary.analytics}</span>
          </NavLink>

          <NavLink
            to="/dashboard/settings"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer
              ${isActive 
                ? 'bg-white/10 text-white font-bold' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <Settings className="w-4.5 h-4.5" />
            <span>{dictionary.settings}</span>
          </NavLink>

          <NavLink
            to="/dashboard/widget"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer
              ${isActive 
                ? 'bg-white/10 text-white font-bold' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <Code className="w-4.5 h-4.5" />
            <span>{dictionary.embed}</span>
          </NavLink>

          {/* Quick link to Storefront */}
          <NavLink
            to="/"
            target="_blank"
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-900/40 mt-2 transition cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>{language === 'ar' ? 'عرض المتجر العام' : 'View Public Storefront'}</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer details */}
        <div className="p-4 border-t border-slate-900 bg-slate-950 flex flex-col gap-3.5 shrink-0 text-xs">
          {/* Quick Toggle for languages */}
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 font-mono font-bold px-1.5 py-0.5 rounded">
              {language.toUpperCase()}
            </span>
          </button>

          {/* Profile overview information */}
          {activeUser && (
            <div className="flex items-center gap-3 px-1 py-1.5">
              <img
                src={activeUser.picture || 'https://api.dicebear.com/7.x/initials/svg?seed=Demo'}
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-slate-800 object-cover bg-slate-800"
              />
              <div className="flex-1 min-w-0">
                <span className="block text-slate-200 font-bold tracking-tight truncate">{activeUser.name}</span>
                <span className="block text-slate-500 truncate text-[10px]">{activeUser.email}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-red-950/30 text-red-400 hover:bg-red-950/60 hover:text-red-200 transition cursor-pointer font-semibold text-xs border border-red-900/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{dictionary.logout}</span>
          </button>
        </div>
      </aside>

      {/* Mobile background overlay for sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-20 bg-black/40 backdrop-blur-xs" 
        />
      )}

      {/* Main content viewport wrapper */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Real-time Floating Order/Message Audio Notification Banner */}
        {incomingAlert && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 animate-bounce">
                <Bell className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-emerald-400">{incomingAlert.title}</span>
                <span className="block text-[11px] text-slate-300 truncate">{incomingAlert.desc}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  navigate(incomingAlert.link);
                  setIncomingAlert(null);
                }}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                {language === 'ar' ? 'معاينة' : 'View'}
              </button>
              <button
                type="button"
                onClick={() => setIncomingAlert(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Top Utility Sub-Header for sound & status */}
        <div className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span className="font-semibold text-[11px] text-slate-600">
              {language === 'ar' ? 'اللوحة متصلة ومباشرة' : 'Live Dashboard Active'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Alert Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                soundEnabled 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100' 
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={soundEnabled ? (language === 'ar' ? 'الصوت مفعل - اضغط للكتم' : 'Sound active - click to mute') : (language === 'ar' ? 'الصوت مكتوم - اضغط للتشغيل' : 'Sound muted - click to enable')}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>
                {soundEnabled 
                  ? (language === 'ar' ? 'نغمة التنبيه: مفعلة 🔊' : 'Alert Sound: On') 
                  : (language === 'ar' ? 'نغمة التنبيه: صامتة 🔇' : 'Alert Sound: Muted')}
              </span>
            </button>

            {/* Public Storefront Direct Link */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold transition"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'ar' ? 'واجهة المتجر' : 'Storefront'}</span>
              <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5 rtl:mr-0.5 rtl:ml-0" />
            </a>
          </div>
        </div>

        <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
