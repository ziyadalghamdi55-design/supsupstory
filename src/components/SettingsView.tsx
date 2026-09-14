/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBilingual } from '../BilingualContext';
import { 
  Bot, 
  Settings, 
  Palette, 
  BellRing, 
  Send, 
  Save, 
  BadgeCheck, 
  ShieldAlert, 
  ExternalLink,
  Laptop,
  Workflow,
  Check,
  PowerOff,
  Store,
  AlertTriangle,
  Rocket,
  Zap,
  Key,
  CreditCard,
  FileText,
  CheckCircle2,
  Lock,
  Copy,
  RefreshCw,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export default function SettingsView() {
  const { language, dictionary } = useBilingual();

  // Settings states
  const [botName, setBotName] = useState('');
  const [widgetColor, setWidgetColor] = useState('#0f172a');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiInstructions, setAiInstructions] = useState('');
  
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');
  
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramBotUsername, setTelegramBotUsername] = useState('');

  // Store Emergency Pause state
  const [emergencyPause, setEmergencyPause] = useState(false);

  // Fast Go-Live & Production Ready states
  const [productionMode, setProductionMode] = useState(false);
  const [freelanceDocNumber, setFreelanceDocNumber] = useState('');
  const [tapApiKey, setTapApiKey] = useState('');
  const [paymentLink, setPaymentLink] = useState('');

  // Store Secret Key (X-Shakhsi-Secret / Webhook authentication)
  const [storeSecretKey, setStoreSecretKey] = useState('shk_sec_live_994821');
  const [copiedSecretKey, setCopiedSecretKey] = useState(false);

  // n8n Automation integration states
  const [n8nEnabled, setN8nEnabled] = useState(false);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');
  const [n8nOrderWebhookUrl, setN8nOrderWebhookUrl] = useState('');
  const [n8nRestockWebhookUrl, setN8nRestockWebhookUrl] = useState('');
  const [n8nCustomerVaultWebhookUrl, setN8nCustomerVaultWebhookUrl] = useState('');

  const [testingWebhookTarget, setTestingWebhookTarget] = useState<string | null>(null);
  const [n8nTestResult, setN8nTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Settle preset colors for picker aesthetics
  const presetColors = ['#0f172a', '#2563eb', '#16a34a', '#db2777', '#7c3aed', '#ea580c'];

  // Load existing configuration on start
  const loadWorkspaceConfig = async () => {
    try {
      const res = await fetch('/api/workspace');
      if (res.ok) {
        const data = await res.json();
        setBotName(data.bot_name || '');
        setWidgetColor(data.widget_color || '#0f172a');
        setWelcomeMessage(data.welcome_message || '');
        setAiEnabled(data.ai_enabled ?? true);
        setAiInstructions(data.ai_instructions || '');
        setEmailNotifications(data.email_notifications ?? false);
        setNotificationEmail(data.notification_email || '');
        setTelegramEnabled(data.telegram_enabled ?? false);
        setTelegramToken(data.telegram_token || '');
        setTelegramBotUsername(data.telegram_bot_username || '');
        setEmergencyPause(data.emergency_pause ?? false);
        setN8nEnabled(data.n8n_enabled ?? false);
        setN8nWebhookUrl(data.n8n_webhook_url || '');
        setN8nOrderWebhookUrl(data.n8n_order_webhook_url || '');
        setN8nRestockWebhookUrl(data.n8n_restock_webhook_url || '');
        setN8nCustomerVaultWebhookUrl(data.n8n_customer_vault_webhook_url || '');
        setStoreSecretKey(data.store_secret_key || 'shk_sec_live_994821');
        setProductionMode(data.production_mode ?? false);
        setFreelanceDocNumber(data.freelance_doc_number || '');
        setTapApiKey(data.tap_api_key || '');
        setPaymentLink(data.payment_link || '');
      }
    } catch (err) {
      console.error('Failed to load workspace config in Settings', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceConfig();
  }, []);

  const handleTestAnyWebhook = async (url: string, targetId: string) => {
    if (!url.trim()) return;
    setTestingWebhookTarget(targetId);
    setN8nTestResult(null);
    try {
      const res = await fetch('/api/n8n/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook_url: url.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setN8nTestResult({
          success: true,
          message: language === 'en'
            ? `✓ Successfully pinged webhook [${targetId}]! HTTP ${data.status || 200}`
            : `✓ تم التحقق بنجاح من اتصال الويب هوك [${targetId}]! الرد سليم (HTTP ${data.status || 200})`,
        });
      } else {
        setN8nTestResult({
          success: false,
          message: (language === 'en' ? 'Connection failed: ' : 'تعذر الاتصال: ') + (data.message || data.error || 'Check Webhook URL accessibility'),
        });
      }
    } catch (err: any) {
      setN8nTestResult({
        success: false,
        message: (language === 'en' ? 'Network error: ' : 'خطأ في الشبكة: ') + (err.message || 'Could not reach server'),
      });
    } finally {
      setTestingWebhookTarget(null);
      setTimeout(() => setN8nTestResult(null), 6000);
    }
  };

  const handleGenerateNewSecretKey = () => {
    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
    setStoreSecretKey(`shk_sec_live_${randomHex}`);
  };

  const handleCopySecretKey = () => {
    navigator.clipboard.writeText(storeSecretKey);
    setCopiedSecretKey(true);
    setTimeout(() => setCopiedSecretKey(false), 2500);
  };

  const handleSaveWorkspaceUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError('');

    const payload = {
      bot_name: botName,
      widget_color: widgetColor,
      welcome_message: welcomeMessage,
      ai_enabled: aiEnabled,
      ai_instructions: aiInstructions,
      email_notifications: emailNotifications,
      notification_email: notificationEmail,
      telegram_enabled: telegramEnabled,
      telegram_token: telegramToken,
      emergency_pause: emergencyPause,
      store_secret_key: storeSecretKey.trim(),
      n8n_enabled: n8nEnabled,
      n8n_webhook_url: n8nWebhookUrl.trim(),
      n8n_order_webhook_url: n8nOrderWebhookUrl.trim(),
      n8n_restock_webhook_url: n8nRestockWebhookUrl.trim(),
      n8n_customer_vault_webhook_url: n8nCustomerVaultWebhookUrl.trim(),
      production_mode: productionMode,
      freelance_doc_number: freelanceDocNumber.trim(),
      tap_api_key: tapApiKey.trim(),
      payment_link: paymentLink.trim(),
    };

    try {
      // 1. Save Workspace config
      const res = await fetch('/api/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Could not update workspace configuration.');
      const data = await res.json();

      // 2. If Telegram is enabled & token supplied, hit webhook setup
      if (telegramEnabled && telegramToken.trim()) {
        const tgRes = await fetch('/api/telegram/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: telegramToken }),
        });
        if (tgRes.ok) {
          const tgData = await tgRes.json();
          setTelegramBotUsername(tgData.telegram_bot_username);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'An error occurred while saving workspace.');
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading custom settings configurations...</div>;
  }

  return (
    <div className="flex-grow flex flex-col gap-6 select-none animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">{dictionary.settingsTitle}</h1>
        <p className="text-xs text-slate-500">
          {language === 'en' 
            ? 'Adjust widget aesthetics, fine-tune Gemini instructions, or bind Telegram interfaces.' 
            : 'اضبط إعدادات ويدجت متجرك، صمم تعليمات الذكاء الاصطناعي، أو فعل استقبال رسائل بوت تلغرام مجانًا.'}
        </p>
      </div>

      <form onSubmit={handleSaveWorkspaceUpdates} className="space-y-8 max-w-4xl">
        
        {/* State Banner Notices */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-pulse">
            <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{dictionary.savedSuccessfully}</span>
          </div>
        )}

        {saveError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* STORE OPERATIONAL CONTROLS: EMERGENCY PAUSE TOGGLE */}
        <section className={`border rounded-xl p-5 shadow-xs transition-all ${
          emergencyPause 
            ? 'bg-rose-50/70 border-rose-300' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                emergencyPause 
                  ? 'bg-rose-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-700'
              }`}>
                <PowerOff className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-950">
                    {language === 'ar' ? 'الإيقاف الطارئ لعمليات الشراء (Emergency Pause)' : 'Storefront Emergency Pause'}
                  </h3>
                  {emergencyPause && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 border border-rose-300 uppercase tracking-wider animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{language === 'ar' ? 'المتجر متوقف مؤقتاً' : 'PAUSED'}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  {language === 'ar'
                    ? 'عند تفعيل هذا الخيار، يتم إيقاف عمليات الشراء والدفع مؤقتاً في المتجر وحماية المخزون مع إظهار إشعار صيانة للمستخدمين.'
                    : 'When active, checkouts and new transactions are temporarily disabled on the storefront to protect inventory during updates.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs font-bold ${emergencyPause ? 'text-rose-700' : 'text-slate-500'}`}>
                {emergencyPause 
                  ? (language === 'ar' ? 'المتجر معطل حالياً' : 'Checkout Disabled') 
                  : (language === 'ar' ? 'المتجر نشط ويستقبل الطلبات' : 'Store Active')}
              </span>
              <button
                type="button"
                onClick={() => setEmergencyPause(!emergencyPause)}
                className={`w-12 h-6.5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  emergencyPause ? 'bg-rose-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                    emergencyPause ? 'translate-x-5.5 rtl:-translate-x-5.5' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* FAST GO-LIVE MODULE: PRODUCTION READY SETUP & SWITCH */}
        <section className={`border rounded-2xl p-6 shadow-sm transition-all ${
          productionMode 
            ? 'bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-950 border-emerald-500/40 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          {/* Header & Smart Mode Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-start gap-3.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                productionMode 
                  ? 'bg-emerald-500 text-slate-950 font-black' 
                  : 'bg-slate-900 text-white'
              }`}>
                <Rocket className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black tracking-tight">
                    {language === 'ar' ? 'وحدة الإطلاق السريع والإنتاج (Fast Go-Live Module)' : 'Fast Go-Live & Production Ready'}
                  </h3>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    productionMode 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse' 
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  }`}>
                    <Zap className="w-3 h-3" />
                    <span>
                      {productionMode 
                        ? (language === 'ar' ? 'الإنتاج الحي (Live Production)' : 'Live Production') 
                        : (language === 'ar' ? 'وضع المحاكاة والتجربة (Sandbox Mode)' : 'Sandbox Demo Mode')}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                  {language === 'ar'
                    ? 'التحول الفوري بين وضع المحاكاة الداخلي (التسليم الفوري التلقائي للأكواد) ووضع البيع الفعلي عبر بوابات الدفع الرسمية (Tap / Payment Gateway).'
                    : 'Instant toggle between internal sandbox simulation (auto-minted instant delivery) and real live customer payment gateway checkout.'}
                </p>
              </div>
            </div>

            {/* Smart Switch Toggle */}
            <div className="flex items-center gap-3 shrink-0 self-start sm:self-center bg-slate-100 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-right rtl:text-left">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  {productionMode 
                    ? (language === 'ar' ? 'وضع البيع الحقيقي' : 'Live Selling') 
                    : (language === 'ar' ? 'وضع المحاكاة' : 'Sandbox Mode')}
                </span>
                <span className="block text-[10px] text-slate-500">
                  {productionMode 
                    ? (language === 'ar' ? 'توجيه العميل للبوابة' : 'Gateway Active') 
                    : (language === 'ar' ? 'توليد وتسليم فوري' : 'Instant Mock Keys')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setProductionMode(!productionMode)}
                className={`w-14 h-7.5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  productionMode ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              >
                <div
                  className={`bg-white w-5.5 h-5.5 rounded-full shadow-md transform transition-transform duration-300 ${
                    productionMode ? 'translate-x-6.5 rtl:-translate-x-6.5' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Go-Live Readiness Checklist Progress */}
          <div className="py-4 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{language === 'ar' ? 'مؤشر جاهزية الإطلاق الفعلي (Readiness Checklist):' : 'Go-Live Readiness Checklist:'}</span>
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {[
                  Boolean(freelanceDocNumber.trim()),
                  Boolean(tapApiKey.trim() || paymentLink.trim()),
                  Boolean(n8nWebhookUrl.trim()),
                  productionMode
                ].filter(Boolean).length} / 4 {language === 'ar' ? 'مكتمل' : 'Ready'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{
                  width: `${(
                    [
                      Boolean(freelanceDocNumber.trim()),
                      Boolean(tapApiKey.trim() || paymentLink.trim()),
                      Boolean(n8nWebhookUrl.trim()),
                      productionMode
                    ].filter(Boolean).length / 4
                  ) * 100}%`
                }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px]">
              <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                freelanceDocNumber.trim() 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{language === 'ar' ? 'وثيقة العمل الحر' : 'Freelance Doc'}</span>
              </div>

              <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                paymentLink.trim() || tapApiKey.trim()
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{language === 'ar' ? 'بوابة الدفع (Tap)' : 'Tap Gateway'}</span>
              </div>

              <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                n8nWebhookUrl.trim() 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{language === 'ar' ? 'أتمتة n8n' : 'n8n Webhook'}</span>
              </div>

              <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                productionMode 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{language === 'ar' ? 'الإنتاج مفعل' : 'Production On'}</span>
              </div>
            </div>
          </div>

          {/* Form Fields for Production Setup */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold mb-1.5 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>{language === 'ar' ? 'رقم وثيقة العمل الحر (Freelance Document No.)' : 'Freelance Document Number'}</span>
              </label>
              <input
                type="text"
                value={freelanceDocNumber}
                onChange={(e) => setFreelanceDocNumber(e.target.value)}
                placeholder="FL-849201"
                dir="ltr"
                className="w-full font-mono px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
              <span className="block text-[10px] text-slate-400 mt-1">
                {language === 'ar' ? 'مطلوب لاعتماد الحساب البنكي والامتثال للتجارة الإلكترونية بالسعودية.' : 'Required for official Saudi eCommerce compliance.'}
              </span>
            </div>

            <div>
              <label className="block font-bold mb-1.5 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'ar' ? 'مفتاح API السري لبوابة Tap (Tap API Secret Key)' : 'Tap API Secret Key'}</span>
              </label>
              <input
                type="password"
                value={tapApiKey}
                onChange={(e) => setTapApiKey(e.target.value)}
                placeholder="sk_live_••••••••••••••••••••"
                dir="ltr"
                className="w-full font-mono px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
              <span className="block text-[10px] text-slate-400 mt-1">
                {language === 'ar' ? 'مفتاح API لربط المدفوعات والبطاقات البنكية ومدى Apple Pay.' : 'Secret key to accept Mada, Visa, Mastercard, and Apple Pay.'}
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold mb-1.5 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'ar' ? 'رابط الدفع المباشر / صفحة Tap المعتمدة (Payment Link)' : 'Production Payment Checkout URL'}</span>
              </label>
              <input
                type="url"
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
                placeholder="https://checkout.tap.company/pay/shakhsi-store-prod"
                dir="ltr"
                className="w-full font-mono px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
              <span className="block text-[10px] text-slate-400 mt-1">
                {language === 'ar'
                  ? 'الرابط الذي يتم تحويل العميل إليه عند الضغط على "إتمام الدفع" في حال تفعيل وضع الإنتاج الحي.'
                  : 'Customer is redirected directly to this secure hosted checkout when Live Production mode is active.'}
              </span>
            </div>
          </div>
        </section>

        {/* BENTO CONTAINER 1: WIDGET DESIGN AESTHETICS */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b pb-2">
            <Palette className="w-4 h-4 text-indigo-600" />
            {dictionary.botConfig}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{dictionary.botName}</label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{dictionary.themeColor}</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={widgetColor}
                  onChange={(e) => setWidgetColor(e.target.value)}
                  className="w-9 h-9 border-0 p-0 rounded cursor-pointer bg-transparent shrink-0"
                />
                {/* Preset circle prompts */}
                <div className="flex gap-1.5 overflow-x-auto">
                  {presetColors.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setWidgetColor(col)}
                      className={`w-6 h-6 rounded-full border shrink-0 border-slate-300 transition hover:scale-105 cursor-pointer`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{dictionary.welcomeMessage}</label>
              <textarea
                rows={4}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder={language === 'en' ? 'Enter greeting message for visitors upon opening the widget...' : 'اكتب رسالة الترحيب التلقائية بالويدجت لزوار متجرك...'}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 resize-y leading-relaxed font-sans"
              />
              <span className="block text-[10px] text-slate-400 mt-1">
                {language === 'en'
                  ? 'This message is automatically displayed to new visitors upon opening the chat widget.'
                  : 'تظهر هذه الرسالة تلقائياً للزائر فور فتح ويدجت الدردشة في متجرك.'}
              </span>
            </div>
          </div>
        </section>

        {/* BENTO CONTAINER 2: AI CO-PILOT SYSTEM PROMPTING */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Bot className="w-4.5 h-4.5 text-purple-600" />
              {dictionary.aiAgentConfig}
            </h3>
            
            {/* Toggle AI Auto responds */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              <span className="ml-2 pr-2 text-xs font-bold text-slate-600 uppercase">{dictionary.aiEnabled}</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-purple-700 uppercase">{dictionary.aiPrompt}</label>
            <textarea
              rows={8}
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              disabled={!aiEnabled}
              placeholder="e.g. You are a personal store clerk for my clothing digital e-commerce shop..."
              className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-slate-100 disabled:text-slate-400"
            />
            <span className="block text-[10px] text-slate-400 leading-normal">
              💡 {language === 'en' 
                ? 'Include product names, precise pricing catalogs, refund policies, and contacts. Gemini matches these instructions exactly in chats!' 
                : 'اكتب قائمة منتجاتك، أسعارها، سياسة الاسترجاع والشحن. سيقوم نظام Gemini بالاعتماد عليها كلياً عند صياغة الردود الشافية للعملاء!'}
            </span>
          </div>
        </section>

        {/* BENTO CONTAINER 3: TELEGRAM INTEGRATION */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-sky-500 fill-sky-100" />
              {dictionary.telegramBotConfig}
            </h3>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={telegramEnabled}
                onChange={(e) => setTelegramEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
              <span className="ml-2 pr-2 text-xs font-bold text-slate-600 uppercase">{dictionary.telegramEnabled}</span>
            </label>
          </div>

          {telegramEnabled && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-lg text-xs leading-normal text-sky-800">
                <span className="font-bold flex items-center gap-1 mb-1">🤖 How to configure a Telegram bot:</span>
                <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                  <li>Open Telegram app, search for the official account <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="font-bold underline flex-inline items-center gap-0.5">@BotFather</a></li>
                  <li>Send command <code className="bg-white px-1.5 py-0.2 rounded font-bold">/newbot</code> and follow steps to assign display name & handle</li>
                  <li>Copy the system Token block generated (HTTP API Token key) and paste it into the field below.</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{dictionary.telegramToken}</label>
                  <input
                    type="text"
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    placeholder="e.g. 123456789:ABCdefGhI..."
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                  />
                  <span className="block text-[10px] text-slate-400 mt-1">{dictionary.telegramTokenDesc}</span>
                </div>

                {telegramBotUsername && (
                  <div className="md:col-span-2">
                    <span className="block text-xs font-bold text-slate-400 uppercase">TELEGRAM BOT URL STATUS</span>
                    <a 
                      href={`https://t.me/${telegramBotUsername}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-sky-600 hover:underline mt-1 text-xs"
                    >
                      @{telegramBotUsername}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* BENTO CONTAINER 4: EMAIL NOTIFICATIONS */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-emerald-600" />
              {dictionary.notifications}
            </h3>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-2 pr-2 text-xs font-bold text-slate-600 uppercase">Email forwarding</span>
            </label>
          </div>

          {emailNotifications && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{dictionary.targetEmail}</label>
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="alerts@mystore.com"
                className="max-w-md w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
              />
              <span className="block text-[10px] text-slate-400 mt-1">{dictionary.emailNotificationDesc}</span>
            </div>
          )}
        </section>

        {/* BENTO CONTAINER 5: STORE SECURITY & SECRET KEY (X-Shakhsi-Secret) */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4.5 h-4.5 text-amber-600" />
              <span>{language === 'en' ? 'Store Secret Key & Webhook Security' : 'مفتاح أمان المتجر والويب هوك (Store Secret Key)'}</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'en' ? 'Live Authenticated' : 'محمي ومشفر'}</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            {language === 'en'
              ? 'This private secret key verifies that HTTP calls and automation payloads originating from this store are genuine. It is automatically transmitted in the X-Shakhsi-Secret and X-Store-Auth headers across all n8n workflows and webhook endpoints.'
              : 'مفتاح الأمان الخاص للتحقق من مصداقية طلبات الربط الخارجي. يتم تضمينه تلقائياً في ترويسات X-Shakhsi-Secret و X-Store-Auth عند استدعاء سير العمل في n8n أو استلام إشعارات الدفع والتسليم.'}
          </p>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              {language === 'en' ? 'Store Private Secret Token' : 'المفتاح السري للمتجر (Secret Key)'}
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={storeSecretKey}
                onChange={(e) => setStoreSecretKey(e.target.value)}
                placeholder="shk_sec_live_..."
                dir="ltr"
                className="flex-grow text-xs font-mono font-bold px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900"
              />

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopySecretKey}
                  className="px-3.5 py-2.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedSecretKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'en' ? 'Copied!' : 'تم النسخ!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Copy Key' : 'نسخ المفتاح'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGenerateNewSecretKey}
                  className="px-3 py-2.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  title={language === 'en' ? 'Generate New Secret Key' : 'توليد مفتاح أمان عشوائي جديد'}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language === 'en' ? 'Regenerate' : 'توليد جديد'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span className="font-bold text-slate-700">HTTP Header:</span>
              <code className="bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-800">X-Shakhsi-Secret: {storeSecretKey.substring(0, 14)}...</code>
            </div>
          </div>
        </section>

        {/* BENTO CONTAINER 6: N8N AUTOMATION & MULTI-WEBHOOKS */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Workflow className="w-4.5 h-4.5 text-rose-600" />
              <span>{language === 'en' ? 'Automation & n8n Workflow Suite' : 'منظومة الأتمتة وسير العمل في n8n (Webhooks Suite)'}</span>
            </h3>

            {/* Toggle Switch: توجيه رسائل الويدجت إلى n8n تلقائياً */}
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={n8nEnabled}
                onChange={(e) => setN8nEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
              <span className="ml-2.5 rtl:mr-2.5 rtl:ml-0 text-xs font-bold text-slate-700">
                {language === 'en' ? 'Auto-forward events to n8n' : 'تفعيل إرسال الأحداث إلى سير عمل n8n'}
              </span>
            </label>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            {language === 'en'
              ? 'Connect discrete operational events to specialized n8n webhook nodes with full HTTP POST payloads and automated retries.'
              : 'اربط عمليات متجرك بنقاط Webhook مخصصة في n8n لإطلاق مسارات عمل مؤتمتة عند إتمام الطلبات، إعادة تعبئة المخزون، أو استرجاع الأكواد.'}
          </p>

          {/* Webhook URLs Form Grid */}
          <div className="space-y-4">
            {/* 1. Widget Chat Messages Webhook */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase flex items-center justify-between">
                <span>{language === 'en' ? '1. Chat Widget Messages Webhook' : '١. رابط رسائل واستفسارات الشات بوت (Widget)'}</span>
                {n8nEnabled && (
                  <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {language === 'en' ? 'Active' : 'مفعل'}
                  </span>
                )}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={n8nWebhookUrl}
                  onChange={(e) => setN8nWebhookUrl(e.target.value)}
                  placeholder="https://n8n.yourdomain.com/webhook/shakhsi-messages"
                  dir="ltr"
                  className="flex-grow text-xs font-mono px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={() => handleTestAnyWebhook(n8nWebhookUrl, 'Chat Messages')}
                  disabled={!n8nWebhookUrl.trim() || testingWebhookTarget === 'Chat Messages'}
                  className="shrink-0 px-3.5 py-2 text-xs font-semibold bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 rounded-lg border border-rose-200 transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testingWebhookTarget === 'Chat Messages' ? (language === 'en' ? 'Testing...' : 'جاري الفحص...') : (language === 'en' ? 'Test' : 'تجربة')}</span>
                </button>
              </div>
              <span className="block text-[10px] text-slate-400">
                Payload: <code>{'{ event: "widget_message", sender, contact_name, message, source }'}</code>
              </span>
            </div>

            {/* 2. Orders & Instant Delivery Webhook */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase flex items-center justify-between">
                <span>{language === 'en' ? '2. Orders & Instant License Minting Webhook' : '٢. رابط أحداث الشراء وتوليد التراخيص الرقمية (Orders Webhook)'}</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {language === 'en' ? 'Order Events' : 'تسليم فوري'}
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={n8nOrderWebhookUrl}
                  onChange={(e) => setN8nOrderWebhookUrl(e.target.value)}
                  placeholder="https://n8n.yourdomain.com/webhook/shakhsi-orders"
                  dir="ltr"
                  className="flex-grow text-xs font-mono px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleTestAnyWebhook(n8nOrderWebhookUrl, 'Order Events')}
                  disabled={!n8nOrderWebhookUrl.trim() || testingWebhookTarget === 'Order Events'}
                  className="shrink-0 px-3.5 py-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 rounded-lg border border-emerald-200 transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testingWebhookTarget === 'Order Events' ? (language === 'en' ? 'Testing...' : 'جاري الفحص...') : (language === 'en' ? 'Test' : 'تجربة')}</span>
                </button>
              </div>
              <span className="block text-[10px] text-slate-400">
                Payload: <code>{'{ event: "digital_order_created", order, product_sku, license_codes, email }'}</code>
              </span>
            </div>

            {/* 3. Restock & Stock Subscriber Alerts Webhook */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase flex items-center justify-between">
                <span>{language === 'en' ? '3. Inventory Restock & Subscriber Alerts Webhook' : '٣. رابط إعادة تعبئة المخزون وتنبيه المشتركين (Restock Webhook)'}</span>
                <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {language === 'en' ? 'Inventory' : 'المخزون'}
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={n8nRestockWebhookUrl}
                  onChange={(e) => setN8nRestockWebhookUrl(e.target.value)}
                  placeholder="https://n8n.yourdomain.com/webhook/shakhsi-restock"
                  dir="ltr"
                  className="flex-grow text-xs font-mono px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleTestAnyWebhook(n8nRestockWebhookUrl, 'Restock Alerts')}
                  disabled={!n8nRestockWebhookUrl.trim() || testingWebhookTarget === 'Restock Alerts'}
                  className="shrink-0 px-3.5 py-2 text-xs font-semibold bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-800 rounded-lg border border-blue-200 transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testingWebhookTarget === 'Restock Alerts' ? (language === 'en' ? 'Testing...' : 'جاري الفحص...') : (language === 'en' ? 'Test' : 'تجربة')}</span>
                </button>
              </div>
              <span className="block text-[10px] text-slate-400">
                Payload: <code>{'{ event: "inventory_restocked", product_sku, restocked_count, notified_subscribers }'}</code>
              </span>
            </div>

            {/* 4. Customer Self-Service License Vault Queries */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase flex items-center justify-between">
                <span>{language === 'en' ? '4. Customer Vault & Key Retrieval Webhook' : '٤. رابط استرجاع المشتريات وخزنة العميل (Customer Vault Webhook)'}</span>
                <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {language === 'en' ? 'Self-Service' : 'الخدمة الذاتية'}
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={n8nCustomerVaultWebhookUrl}
                  onChange={(e) => setN8nCustomerVaultWebhookUrl(e.target.value)}
                  placeholder="https://n8n.yourdomain.com/webhook/shakhsi-vault"
                  dir="ltr"
                  className="flex-grow text-xs font-mono px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => handleTestAnyWebhook(n8nCustomerVaultWebhookUrl, 'Customer Vault')}
                  disabled={!n8nCustomerVaultWebhookUrl.trim() || testingWebhookTarget === 'Customer Vault'}
                  className="shrink-0 px-3.5 py-2 text-xs font-semibold bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-purple-800 rounded-lg border border-purple-200 transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testingWebhookTarget === 'Customer Vault' ? (language === 'en' ? 'Testing...' : 'جاري الفحص...') : (language === 'en' ? 'Test' : 'تجربة')}</span>
                </button>
              </div>
              <span className="block text-[10px] text-slate-400">
                Payload: <code>{'{ event: "customer_license_query", customer_email, verified_orders_count }'}</code>
              </span>
            </div>

            {/* Test result status feedback */}
            {n8nTestResult && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 animate-fade-in ${
                n8nTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {n8nTestResult.success ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{n8nTestResult.message}</span>
              </div>
            )}
          </div>
        </section>

        {/* SUBMIT ACTIONS */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-950 text-white font-bold text-sm hover:bg-slate-800 transition cursor-pointer shadow-md shadow-slate-950/10"
          >
            <Save className="w-4.5 h-4.5" />
            <span>{dictionary.save}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
