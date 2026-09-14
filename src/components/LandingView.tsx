/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBilingual } from '../BilingualContext';
import { 
  MessageSquare, 
  Bot, 
  PieChart, 
  ArrowRight, 
  Globe, 
  ShieldCheck, 
  Tv, 
  Send, 
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

export default function LandingView() {
  const { language, direction, dictionary, toggleLanguage } = useBilingual();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user session already exists
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Top Banner announcing Free forever */}
      <div className="bg-slate-900 text-slate-100 py-2.5 px-4 text-center text-xs tracking-wide font-medium">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          {language === 'en' 
            ? 'Omnichannel Support Desk powered by Gemini AI is 100% Free Forever!' 
            : 'مكتب الدعم الموحد لخدمة العملاء بالذكاء الاصطناعي مجاني بالكامل وإلى الأبد!'}
        </span>
      </div>

      {/* Navigation Bar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-950 flex items-center justify-center rounded-lg shadow-sm">
              <span className="font-bold text-white text-lg font-sans">ش</span>
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-950 font-sans">
                {dictionary.appName}
              </span>
              <span className="text-[10px] block text-slate-500 -mt-1 font-mono tracking-wider font-semibold">
                {dictionary.tagline}
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors">
              {language === 'en' ? 'Features' : 'المزايا القوية'}
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors">
              {language === 'en' ? 'Pricing' : 'التسعير'}
            </a>
            <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors">
              {language === 'en' ? 'Testimonials' : 'آراء العملاء'}
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {/* Language Selection */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold hover:bg-slate-100 transition-colors text-slate-700 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              {language === 'en' ? 'العربية' : 'English'}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {dictionary.dashboard}
                <ArrowRight className={`w-4 h-4 ml-1.5 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-slate-950 px-3 py-2 transition-colors"
                >
                  {dictionary.login}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {dictionary.ctaGetStarted}
                </Link>
              </>
            )}
          </div>

          {/* Mobile responsive toggle */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="p-1 px-2.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              {language === 'en' ? 'Ar' : 'En'}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu block */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4">
            <a 
              href="#features" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-slate-950"
            >
              {language === 'en' ? 'Features' : 'المزايا القوية'}
            </a>
            <a 
              href="#pricing" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-slate-950"
            >
              {language === 'en' ? 'Pricing' : 'التسعير'}
            </a>
            <a 
              href="#testimonials" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-slate-950"
            >
              {language === 'en' ? 'Testimonials' : 'آراء العملاء'}
            </a>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full text-center py-2 rounded-md bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800"
                >
                  {dictionary.dashboard}
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full text-center py-2 rounded-md border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                  >
                    {dictionary.login}
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center py-2 rounded-md bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800"
                  >
                    {dictionary.ctaGetStarted}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-white">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Copywriter pane */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold animate-fade-in">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{dictionary.freeForever}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-sans tracking-tight text-slate-950 leading-[1.1] animate-fade-in">
                {dictionary.heroTitle}
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {dictionary.heroSub}
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/register"}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-slate-950 text-white text-base font-bold hover:bg-slate-800 hover:scale-[1.01] transition-all shadow-md shadow-slate-950/10 cursor-pointer"
                >
                  {dictionary.ctaGetStarted}
                  <ArrowRight className={`w-5 h-5 ml-2 ${direction === 'rtl' ? 'rotate-180 mr-2 ml-0' : ''}`} />
                </Link>

                <a
                  href="#features"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  {language === 'en' ? 'Explore Core Modules' : 'اكتشف المزايا'}
                </a>
              </div>

              {/* Dynamic KPI indicators */}
              <div className="pt-8 border-t border-slate-100 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-extrabold text-slate-950 font-mono">0ms</div>
                  <div className="text-xs text-slate-500">{language === 'en' ? 'Setup Effort' : 'دقيقتان للتهيئة'}</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-950 font-mono">24/7</div>
                  <div className="text-xs text-slate-500">{language === 'en' ? 'AI Coverage' : 'خدمة مستمرة'}</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-950 font-mono">100%</div>
                  <div className="text-xs text-slate-500">{language === 'en' ? 'Free License' : 'مجاني تماماً'}</div>
                </div>
              </div>
            </div>

            {/* Interactive Widget Demonstration Preview */}
            <div className="lg:col-span-5 relative">
              <div className="bg-slate-950 p-3 rounded-2xl shadow-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
                {/* Simulated Web Widget Shell Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-200">
                      {dictionary.widgetChatWithAI}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {language === 'en' ? 'Omni AI Live' : 'مساعد ذكي'}
                  </span>
                </div>

                {/* Dialog thread contents */}
                <div className="p-4 space-y-4 h-[310px] overflow-y-auto text-xs">
                  <div className="bg-slate-900 border border-slate-800 text-slate-300 p-3 rounded-xl max-w-[85%] self-start rounded-tl-none leading-relaxed">
                    <strong>{dictionary.appName} AI Agent:</strong><br />
                    {language === 'en' 
                      ? 'Welcome to the Premium Coding Hub! I run on Gemini AI. How can I help you regarding our templates, such as the SaaS Boilerplate ($49)?'
                      : 'مرحباً بك في متجر الأكواد الرقمي! أنا مساعد الذكاء الاصطناعي الخاص بك. كيف يمكنني خدمتك بخصوص قوالبنا مثل SaaS Boilerplate ($49)؟'}
                  </div>

                  <div className="bg-white/10 text-white p-3 rounded-xl max-w-[85%] ml-auto rounded-tr-none leading-relaxed">
                    {language === 'en' 
                      ? 'Is it compatible with custom databases?' 
                      : 'هل القالب متوافق مع قواعد البيانات المخصصة؟'}
                  </div>

                  <div className="bg-slate-900 border border-slate-800 text-slate-300 p-3 rounded-xl max-w-[85%] self-start rounded-tl-none leading-relaxed animate-pulse">
                    <strong>{dictionary.appName} AI Agent:</strong><br />
                    {language === 'en'
                      ? 'Yes! It features modular database connectors. You can quickly map it to MongoDB, Firestore, or SQLite using process.env configurations.'
                      : 'نعم بالتأكيد! يحتوي القالب على واجهات قواعد بيانات مرنة ومتكاملة. يمكنك تهيئته للعمل فوراً مع MongoDB أو SQLite عبر ملفات البيئة.'}
                  </div>
                </div>

                {/* Simulated Input field bar */}
                <div className="p-2 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center gap-2">
                  <input
                    disabled
                    placeholder={dictionary.widgetTypePlaceholder}
                    className="bg-transparent border-0 text-xs w-full text-white placeholder-slate-500 focus:ring-0 outline-none"
                  />
                  <button className="p-1.5 bg-white text-slate-950 rounded-lg shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Decorative Telegram integration badge layered above */}
              <div className="absolute -bottom-6 -left-6 bg-white p-3 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2 animate-bounce">
                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                  <Send className="w-4 h-4 fill-sky-600" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">telegram Bot</span>
                  <span className="text-xs font-bold text-slate-800">Connected Chat</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BRANDS BANNER */}
      <section className="py-12 border-t border-b border-slate-200 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-6">
            {dictionary.brandsSection}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-75">
            <span className="text-base font-bold tracking-tight text-slate-400">SENN_STORES</span>
            <span className="text-base font-bold tracking-tight text-slate-400">INDIE_MAKER_HUB</span>
            <span className="text-base font-bold tracking-tight text-slate-400">CODE_TEMPLATES_SA</span>
            <span className="text-base font-bold tracking-tight text-slate-400">AL_OMDAH_DIGITAL</span>
          </div>
        </div>
      </section>

      {/* CORE FEATURES INTEGRATIONS (INTERACTIVE TAB) */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {language === 'en' ? 'Engineered for Digital Sellers' : 'مصمم باحترافية لأصحاب الأعمال الرقمية'}
            </h2>
            <p className="text-slate-600">
              {language === 'en' 
                ? 'Consolidate multiple messaging platforms into a single clean application workspace.' 
                : 'ادمج قنوات مبيعاتك واستقبل استفسارات عملائك في شاشة واحدة منظمة.'}
            </p>
          </div>

          {/* Nav Tabs */}
          <div className="mt-12 flex justify-center border-b border-slate-200">
            <div className="flex space-x-2 md:space-x-8">
              <button
                onClick={() => setActiveTab(1)}
                className={`py-4 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 1 
                    ? 'border-slate-900 text-slate-950 font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {dictionary.featureTab1Title}
                </span>
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className={`py-4 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 2 
                    ? 'border-slate-900 text-slate-950 font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  {dictionary.featureTab2Title}
                </span>
              </button>
              <button
                onClick={() => setActiveTab(3)}
                className={`py-4 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 3 
                    ? 'border-slate-900 text-slate-950 font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  {dictionary.featureTab3Title}
                </span>
              </button>
            </div>
          </div>

          {/* Active Tab Showcase Panels */}
          <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-8 sm:p-12">
            {activeTab === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="text-2xl font-bold text-slate-950">{dictionary.featureTab1Title}</h3>
                  <p className="text-slate-600 leading-relaxed">{dictionary.featureTab1Desc}</p>
                  <ul className="space-y-2.5 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{language === 'en' ? 'Direct Customer widget iframe embed' : 'ويدجت مخصص وقابل للتضمين في متجرك'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{language === 'en' ? 'Telegram bot Webhook synchronization' : 'مزامنة تلغرام عبر Webhook'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{language === 'en' ? 'Unified Open/Done inbox filters' : 'تضمين فلاتر سهلة للتصفية'}</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-200/50 p-4 border border-slate-300 rounded-xl">
                  <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                      <span className="text-xs font-bold text-indigo-700 font-mono tracking-wider">TELEGRAM ROUTE</span>
                      <span className="text-[10px] text-slate-400">Just Now</span>
                    </div>
                    <div className="text-xs bg-slate-50 p-2.5 rounded border border-slate-100">
                      <strong>Majed Al-Harbi (Telegram):</strong> Hey, looking to checkout! Do you process Saudi MADA cards?
                    </div>
                    <div className="text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded border border-emerald-100 font-semibold">
                      <strong>AI Gemini:</strong> Yes Majed! We support full credit cards, Apple Pay, and Mada cards instantly via our secure merchant channel!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="text-2xl font-bold text-slate-950">{dictionary.featureTab2Title}</h3>
                  <p className="text-slate-600 leading-relaxed">{dictionary.featureTab2Desc}</p>
                  <ul className="space-y-2.5 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{language === 'en' ? 'Powered by Google Gemini 3.5' : 'مدعوم بنظام Google Gemini 3.5 السريع'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{language === 'en' ? 'System Instruction Custom Prompts' : 'إمكانية إملاء التعليمات وتدقيق الردود'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{language === 'en' ? 'Bilingual auto-adaptation' : 'التعرف التلقائي على لغة العميل'}</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-900 text-slate-100 p-5 rounded-xl font-mono text-xs shadow-md border border-slate-800">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-3 text-slate-400">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>system_prompt_rules.json</span>
                  </div>
                  <span className="text-slate-500">// Configure your rules directly in panel Settings:</span>
                  <p className="text-purple-300 mt-2">
                    {`{
  "bot_role": "Polite Digital E-Commerce Store Clerk",
  "knowledge_base": "We sell portfolio templates for $19. Refund allowed within 24 hours only. Custom support is admin@myshop.com",
  "tone": "Warm, professional, concise"
}`}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <h3 className="text-2xl font-bold text-slate-950">{dictionary.featureTab3Title}</h3>
                  <p className="text-slate-600 leading-relaxed">{dictionary.featureTab3Desc}</p>
                  <ul className="space-y-2.5 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{language === 'en' ? 'Automatic UTM campaign channel detection' : 'تتبع تلقائي لمصادر زيارات موقعك'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{language === 'en' ? 'AI Resolution Percentage tracking' : 'نسبة تولي الذكاء الاصطناعي للمبيعات'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{language === 'en' ? 'Direct tagged referral URL builder' : 'مولد روابط سهل وبسيط داخل لوحة الإدارة'}</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3 bg-white border border-slate-300 p-5 rounded-xl shadow-sm">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-slate-50 border border-slate-100 rounded-lg p-3">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Google Organic</span>
                      <strong className="text-lg font-mono">65%</strong>
                    </div>
                    <div className="h-20 bg-slate-50 border border-slate-100 rounded-lg p-3">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Twitter (X) Ads</span>
                      <strong className="text-lg font-mono">35%</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* PRICING SECTION (FREE FOREVER) */}
      <section id="pricing" className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {dictionary.pricingTitle}
            </h2>
            <p className="text-slate-600">
              {dictionary.pricingSub}
            </p>
          </div>

          <div className="mt-12 max-w-md mx-auto">
            <div className="bg-white border-2 border-slate-950 rounded-2xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-slate-950 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                {language === 'en' ? 'Unlimited' : 'مطلق الميزات'}
              </div>

              <span className="text-sm font-bold uppercase tracking-widest text-slate-400 block mb-2">
                {dictionary.freeTitle}
              </span>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-5xl font-extrabold tracking-tight text-slate-950">$0</span>
                <span className="text-slate-500 font-medium">/ {language === 'en' ? 'forever' : 'مدى الحياة'}</span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {dictionary.freeDesc}
              </p>

              <hr className="border-slate-100 my-6" />

              <ul className="space-y-4 mb-8 text-sm text-slate-700">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-slate-950 shrink-0" />
                  <span>{dictionary.freeFeature1}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-slate-950 shrink-0" />
                  <span>{dictionary.freeFeature2}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-slate-950 shrink-0" />
                  <span>{dictionary.freeFeature3}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-slate-950 shrink-0" />
                  <span>{dictionary.freeFeature4}</span>
                </li>
              </ul>

              <Link
                to="/register"
                className="w-full inline-flex items-center justify-center py-3 rounded-lg bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                {dictionary.ctaGetStarted}
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 mb-4">
            {dictionary.testimonialTitle}
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto mb-12">
            {dictionary.testimonialSubtitle}
          </p>

          <figure className="space-y-6">
            <blockquote className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 leading-normal">
              {dictionary.testimonial1}
            </blockquote>
            <figcaption className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold">
                ZA
              </div>
              <div className="text-left">
                <span className="block font-bold text-sm text-slate-950">
                  {dictionary.testimonial1Author}
                </span>
                <span className="block text-xs text-slate-500">Saudi Arabia</span>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-white text-slate-950 flex items-center justify-center rounded font-bold">ش</div>
              <span className="font-bold text-lg">{dictionary.appName}</span>
            </div>
            <p className="text-xs text-slate-400">
              Omnichannel Support Desk powered by Gemini AI. Completely free customer tools.
            </p>
          </div>
          <div>
            <h4 className="text-white text-sm font-bold mb-4">{language === 'en' ? 'Product' : 'المنتج'}</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#features">{language === 'en' ? 'Features List' : 'المزايا'}</a></li>
              <li><a href="#pricing">{language === 'en' ? 'Free License Terms' : 'التراخيص'}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-bold mb-4">{language === 'en' ? 'Company' : 'الشركة'}</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#privacy">{language === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}</a></li>
              <li><a href="#terms">{language === 'en' ? 'Terms of Service' : 'شروط الخدمة'}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-bold mb-4">{language === 'en' ? 'Integrations' : 'التكامل'}</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Telegram API Bot</li>
              <li>Widget Embedded Iframe</li>
              <li>Google Gemini AI</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 {dictionary.appName}. {dictionary.footerRights}</span>
          <div className="flex items-center gap-4">
            <button onClick={toggleLanguage} className="hover:text-white">
              {language === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
