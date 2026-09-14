/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBilingual } from '../BilingualContext';
import { Globe, ArrowLeft, Bot, Mail, Lock, ShieldAlert, BadgeCheck, User, Users, Settings2, Sparkles, CheckCircle, Hash } from 'lucide-react';

interface AuthViewProps {
  isRegister: boolean;
}

export default function AuthView({ isRegister }: AuthViewProps) {
  const { language, direction, dictionary, toggleLanguage } = useBilingual();
  const navigate = useNavigate();

  // Unified configuration options
  const [role, setRole] = useState<'owner' | 'visitor'>('owner');
  const [googleActive, setGoogleActive] = useState(true);
  const [appleActive, setAppleActive] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Visitor specifics
  const [visitorEmail, setVisitorEmail] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    // If user is already authenticated, auto-redirect directly to dashboard
    if (localStorage.getItem('shakhsi_admin_authed') === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Prefill helper for demo
  const fillDemoCredentials = () => {
    setEmail('ziyadalghamdi55@gmail.com');
    setPassword('shakhsi123');
    setName('Ziyad Alghamdi');
  };

  const fillDemoVisitor = () => {
    setVisitorEmail('visitor_demo@shakhsi.com');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(false);

    const cleanEmail = email.trim().toLowerCase() || 'ziyadalghamdi55@gmail.com';
    const cleanName = name.trim() || 'مدير المتجر';

    // Instant local authentication
    localStorage.setItem('shakhsi_admin_authed', 'true');
    localStorage.setItem(
      'shakhsi_current_user',
      JSON.stringify({
        id: 'owner_master',
        name: cleanName,
        email: cleanEmail,
        role: 'owner',
      })
    );

    setSuccessMsg(isRegister 
      ? (language === 'ar' ? 'تم إنشاء الحساب بنجاح! جاري فتح لوحة التحكم...' : 'Account created successfully! Opening dashboard...')
      : (language === 'ar' ? 'تم تسجيل الدخول بنجاح! جاري فتح لوحة التحكم...' : 'Signed in successfully! Opening dashboard...')
    );

    navigate('/dashboard');
  };

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorEmail.trim()) {
      setErrorMsg(language === 'en' ? 'Please enter a valid email address.' : 'الرجاء إدخال البريد الإلكتروني بشكل صحيح للبدء.');
      return;
    }

    const finalEmail = visitorEmail.trim().toLowerCase();
    setErrorMsg('');
    setIsLoading(false);

    localStorage.setItem('shakhsi_admin_authed', 'true');
    localStorage.setItem(
      'shakhsi_current_user',
      JSON.stringify({
        id: 'visitor_' + Date.now(),
        name: finalEmail.split('@')[0],
        email: finalEmail,
        role: 'visitor',
      })
    );

    navigate('/dashboard');
  };

  // Google Fast Login
  const handleGoogleMockLogin = () => {
    if (!googleActive) {
      setErrorMsg(language === 'en' ? 'Google Authentication choice is disabled.' : 'بوابة تسجيل دخول Google معطلة من خيارات التفعيل حالياً.');
      return;
    }

    const targetEmail = (role === 'owner' ? email.trim() : visitorEmail.trim()) || 'ziyadalghamdi55@gmail.com';
    setIsLoading(false);

    localStorage.setItem('shakhsi_admin_authed', 'true');
    localStorage.setItem(
      'shakhsi_current_user',
      JSON.stringify({
        id: 'google_user',
        name: targetEmail.split('@')[0],
        email: targetEmail,
        role: role,
      })
    );

    navigate('/dashboard');
  };

  // Apple Fast Login
  const handleAppleMockLogin = () => {
    if (!appleActive) {
      setErrorMsg(language === 'en' ? 'Apple Authentication choice is disabled.' : 'بوابة تسجيل دخول Apple معطلة من خيارات التفعيل حالياً.');
      return;
    }

    const targetEmail = (role === 'owner' ? email.trim() : visitorEmail.trim()) || 'ziyadalghamdi55@gmail.com';
    setIsLoading(false);

    localStorage.setItem('shakhsi_admin_authed', 'true');
    localStorage.setItem(
      'shakhsi_current_user',
      JSON.stringify({
        id: 'apple_user',
        name: targetEmail.split('@')[0],
        email: targetEmail,
        role: role,
      })
    );

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-slate-900 selection:text-white" style={{ direction }}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

      {/* Top Navbar items */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div></div>

        <button
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" />
          {language === 'en' ? 'العربية' : 'English'}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-950 flex items-center justify-center rounded-xl shadow-md mb-3">
            <span className="font-bold text-white text-xl">ش</span>
          </div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            {role === 'owner' 
              ? (isRegister ? dictionary.registerTitle : dictionary.loginTitle)
              : (language === 'en' ? 'Connect to Support Desk' : 'البوابه الدخول للعملاء الموحدة')}
          </h2>
          <p className="mt-2 text-center text-xs text-slate-500">
            {language === 'en' 
              ? 'Omnichannel AI Customer Helpdesk — Free Forever' 
              : 'منصة خدمة العملاء متعددة القنوات الذكية — مجانية تماماً'}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/80">
          
          {/* ROLE SELECTOR: Owner or Visitor */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setRole('owner');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-grow flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                role === 'owner' 
                  ? 'bg-slate-950 text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Store Owner' : 'صاحب المتجر (المالك)'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('visitor');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-grow flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                role === 'visitor' 
                  ? 'bg-slate-950 text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Visitor / Customer' : 'الزائر / العميل'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* RENDERING INTERFACE: OWNER OPTIONS */}
          {role === 'owner' ? (
            <>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {isRegister && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      {dictionary.name}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        @
                      </span>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ziyad Alghamdi"
                        className="block w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 Transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    {dictionary.email}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@store.com"
                      className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 Transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    {dictionary.password}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 Transition-all"
                    />
                  </div>
                </div>

                {/* Quick prefill demo button */}
                {!isRegister && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={fillDemoCredentials}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      {language === 'en' ? '⚡ Autofill Demo Credentials' : '⚡ تعبئة بيانات الزائر التجريبي'}
                    </button>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-slate-950 text-white font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer shadow-sm shadow-slate-950/20 disabled:bg-slate-400"
                  >
                    {isLoading ? dictionary.loading : (isRegister ? dictionary.register : dictionary.login)}
                  </button>
                </div>
              </form>

              {/* Dynamic Google or Apple quick activation choice toggles */}
              <div className="mt-5 p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                <div className="flex items-center gap-1.5 border-b border-slate-200/60 pb-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                    {language === 'en' ? 'Quick Login Activation Toggles' : 'خيارات تفعيل وتسجيل الدخول السريع'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 cursor-pointer select-none">
                    <span className="text-[10px] font-bold text-slate-700">Google Auth</span>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={googleActive}
                        onChange={(e) => setGoogleActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-950"></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 cursor-pointer select-none">
                    <span className="text-[10px] font-bold text-slate-700">Apple Auth</span>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={appleActive}
                        onChange={(e) => setAppleActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-950"></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Social Auth separator (depends on dynamic toggles) */}
              {(googleActive || appleActive) && (
                <>
                  <div className="mt-5 relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        {language === 'en' ? 'Or Sign In With...' : 'أو تسجيل الدخول السريع عبر...'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5 grid grid-cols-2 gap-3">
                    {googleActive ? (
                      <button
                        onClick={handleGoogleMockLogin}
                        disabled={isLoading}
                        type="button"
                        className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.24.605 4.45 1.6l2.366-2.366C17.272 1.543 14.88 1 12.24 1 6.584 1 2 5.584 2 11.24s4.584 10.24 10.24 10.24c5.9 0 9.805-4.15 9.805-9.982 0-.67-.06-1.123-.175-1.513H12.24z"/>
                        </svg>
                        <span>Google</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-100 text-xs font-semibold text-slate-350 bg-slate-50 cursor-not-allowed select-none">
                        <Lock className="w-3 h-3" />
                        <span>Google Locked</span>
                      </div>
                    )}

                    {appleActive ? (
                      <button
                        onClick={handleAppleMockLogin}
                        disabled={isLoading}
                        type="button"
                        className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-white bg-slate-950 hover:bg-slate-850 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-white shrink-0 fill-current" viewBox="0 0 24 24">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.19.67-2.91 1.49-.63.72-1.18 1.86-1.03 2.97 1.1.09 2.21-.57 2.95-1.4"/>
                        </svg>
                        <span>Apple</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-100 text-xs font-semibold text-slate-350 bg-slate-50 cursor-not-allowed select-none">
                        <Lock className="w-3 h-3" />
                        <span>Apple Locked</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              <hr className="border-slate-100 my-6" />

              <p className="text-center text-xs text-slate-500">
                {isRegister ? dictionary.alreadyHaveAccount : dictionary.noAccount}{' '}
                <Link
                  to={isRegister ? '/login' : '/register'}
                  className="font-bold text-slate-900 underline hover:text-slate-700 transition"
                >
                  {isRegister ? dictionary.login : dictionary.register}
                </Link>
              </p>
            </>
          ) : (
            // RENDERING INTERFACE: VISITOR / CUSTOMER (Unified support entry point)
            <div className="space-y-4 animate-fade-in text-slate-800">
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                <p className="text-[11px] leading-relaxed text-indigo-950 flex items-start gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    {language === 'en' 
                      ? 'Welcome to Shakhsi. Enter your email address below to log in or register instantly. You can also sign in instantly using Apple/Google.'
                      : 'مرحباً بك في منصة شخصي. يمكنك إدخال بريدك الإلكتروني أدناه لبدء دردشة موحدة وتلقي الدعم والرد التلقائي، أو استخدام Google / Apple.'}
                  </span>
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleVisitorSubmit}>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    {language === 'en' ? 'Enter Email / Electronic Mail' : 'أدخل بريدك الإلكتروني'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      placeholder="visitor@shakhsi.com"
                      className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 Transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={fillDemoVisitor}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    {language === 'en' ? '⚡ Autofill Visitor Demo Email' : '⚡ تعبئة بريد إلكتروني تجريبي للزائر'}
                  </button>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center py-2.5 rounded-lg bg-indigo-650 text-white font-bold text-sm hover:bg-indigo-700 transition-all cursor-pointer shadow-sm shadow-indigo-650/20 disabled:bg-slate-400"
                  >
                    {isLoading ? dictionary.loading : (language === 'en' ? 'Begin Secure Correspondence' : 'بدء الدردشة والتواصل')}
                  </button>
                </div>
              </form>

              {/* Visitor Social Auth block (if enabled by toggles) */}
              {(googleActive || appleActive) && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-150" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
                        {language === 'en' ? 'Or Guest Fast Login...' : 'أو تسجيل الدخول السريع كزائر عبر...'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {googleActive ? (
                      <button
                        onClick={handleGoogleMockLogin}
                        disabled={isLoading}
                        type="button"
                        className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 text-red-500 shrink-0" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.24.605 4.45 1.6l2.366-2.366C17.272 1.543 14.88 1 12.24 1 6.584 1 2 5.584 2 11.24s4.584 10.24 10.24 10.24c5.9 0 9.805-4.15 9.805-9.982 0-.67-.06-1.123-.175-1.513H12.24z"/>
                        </svg>
                        <span className="text-[11px]">Google</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-100 text-[10px] font-semibold text-slate-350 bg-slate-50 cursor-not-allowed select-none">
                        <Lock className="w-3 h-3" />
                        <span>Google Locked</span>
                      </div>
                    )}

                    {appleActive ? (
                      <button
                        onClick={handleAppleMockLogin}
                        disabled={isLoading}
                        type="button"
                        className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-white bg-slate-950 hover:bg-slate-850 transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 text-white shrink-0 fill-current" viewBox="0 0 24 24">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.19.67-2.91 1.49-.63.72-1.18 1.86-1.03 2.97 1.1.09 2.21-.57 2.95-1.4"/>
                        </svg>
                        <span className="text-[11px]">Apple</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-100 text-[10px] font-semibold text-slate-350 bg-slate-50 cursor-not-allowed select-none">
                        <Lock className="w-3 h-3" />
                        <span>Apple Locked</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-slate-450 font-semibold text-[9px] uppercase tracking-wider">
                    {language === 'en' ? 'Direct Integration Support' : 'تكامل فوري في المتجر'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 border border-slate-100 rounded-lg bg-slate-50/50">
                  <span className="block text-[11px] font-black text-slate-900">24/7 Response</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Gemini AI Engine</span>
                </div>
                <div className="p-2 border border-slate-100 rounded-lg bg-slate-50/50">
                  <span className="block text-[11px] font-black text-slate-900">Unified System</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Instant Tracking</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
