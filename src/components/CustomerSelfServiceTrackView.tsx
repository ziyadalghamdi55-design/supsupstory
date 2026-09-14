/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBilingual } from '../BilingualContext';
import { StoreOrder } from '../types';
import TroubleshootTicketModal from './TroubleshootTicketModal';
import { 
  Search, 
  Key, 
  Copy, 
  Check, 
  ExternalLink, 
  Package, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  BookOpen, 
  HelpCircle,
  Download,
  Terminal,
  ShieldCheck,
  Sparkles,
  LifeBuoy
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerSelfServiceTrackView() {
  const { language, direction } = useBilingual();
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [troubleshootOrder, setTroubleshootOrder] = useState<StoreOrder | null>(null);

  // Auto-fill from localStorage on load
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('shakhsi_customer_email');
      if (savedEmail) {
        setEmailInput(savedEmail);
        // Automatically fetch orders if email was saved
        fetchOrdersForEmail(savedEmail);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const fetchOrdersForEmail = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch(`/api/customer/orders?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setSearched(true);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to retrieve orders');
      }
    } catch (err) {
      setErrorMsg(language === 'ar' ? 'تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.' : 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      try {
        localStorage.setItem('shakhsi_customer_email', emailInput.trim());
      } catch (e) {
        // ignore
      }
      fetchOrdersForEmail(emailInput.trim());
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
              ش
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">شخصي Platform</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {language === 'ar' ? 'الخدمة الذاتية' : 'Self Service'}
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            {direction === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{language === 'ar' ? 'العودة لكتالوج المتجر' : 'Back to Store'}</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 space-y-8">
        {/* Hero title */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'بوابة استرجاع التراخيص والخدمة الذاتية' : 'License Recovery & Self Service Portal'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {language === 'ar' ? 'استرجع مشترياتك وأكوادك فوراً' : 'Retrieve Your Purchased Keys'}
          </h1>
          <p className="text-sm text-slate-400">
            {language === 'ar'
              ? 'أدخل بريدك الإلكتروني الذي استخدمته أثناء الشراء لاستعراض كافة تراخيصك والوصول لدليل التفعيل المباشر.'
              : 'Enter the email address you purchased with to instantly display all your digital licenses and guides.'}
          </p>
        </div>

        {/* Email Lookup Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني (مثل: yourname@example.com)...' : 'Enter your purchase email address...'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Search className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? (language === 'ar' ? 'جاري البحث...' : 'Searching...') : (language === 'ar' ? 'استرجاع التراخيص' : 'Lookup Purchases')}</span>
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Results List */}
        {searched && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <span>
                  {language === 'ar' ? `المشتريات المسجلة (${orders.length})` : `Registered Purchases (${orders.length})`}
                </span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">{emailInput}</span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800/80 p-8">
                <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300 mb-1">
                  {language === 'ar' ? 'لم يتم العثور على مشتريات بهذا البريد' : 'No purchases found for this email'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {language === 'ar'
                    ? 'يرجى التأكد من كتابة البريد الإلكتروني الذي قمت بالشراء به تماماً، أو تواصل معنا عبر أيقونة الدعم الفني بالأسفل.'
                    : 'Please double-check the email address or reach out to our team via the live chat widget below.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-6 shadow-md space-y-4"
                  >
                    {/* Header line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/70 pb-3">
                      <div>
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded mr-2 ml-2">
                          #{order.id}
                        </span>
                        <h3 className="text-lg font-extrabold text-white mt-1 inline-block">
                          {order.product_name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        {order.amount !== undefined && (
                          <span className="font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-0.5 rounded-lg text-xs font-mono">
                            {order.amount} {order.currency || 'SAR'}
                          </span>
                        )}
                        <span>
                          {new Date(order.created_at).toLocaleDateString(
                            language === 'ar' ? 'ar-SA' : 'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </span>
                      </div>
                    </div>

                    {/* License Code Display Box */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4.5 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{language === 'ar' ? 'كود التفعيل الرقمي (كامل بدون إخفاء):' : 'Your Digital Activation Key:'}</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                          {language === 'ar' ? 'فعّال' : 'ACTIVE'}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
                        <div className="overflow-x-auto py-1">
                          <code className="font-mono text-emerald-300 font-extrabold text-base tracking-wider select-all block whitespace-nowrap">
                            {order.license_code}
                          </code>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(order.license_code)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-lg transition cursor-pointer shrink-0 shadow-sm"
                        >
                          {copiedCode === order.license_code ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{language === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{language === 'ar' ? 'نسخ الكود' : 'Copy Key'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Visual Notification Toast Banner */}
                      {copiedCode === order.license_code && (
                        <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>
                            {language === 'ar' ? 'تم نسخ الكود بنجاح!' : 'License key copied to clipboard!'}
                          </span>
                        </div>
                      )}

                      {/* Troubleshoot Ticket Button */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-xs">
                        <button
                          type="button"
                          onClick={() => setTroubleshootOrder(order)}
                          className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer py-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'أواجه مشكلة في التفعيل؟' : 'Having trouble activating?'}</span>
                        </button>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {language === 'ar' ? 'فريق الدعم متاح 24/7' : 'Support 24/7'}
                        </span>
                      </div>
                    </div>

                    {/* Product Activation & Installation Guide Section */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'ar' ? 'طريقة تفعيل وتثبيت المنتج:' : 'Activation & Installation Guide:'}</span>
                      </div>

                      <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside pl-1 pr-1 leading-relaxed">
                        <li>
                          {language === 'ar'
                            ? 'انسخ مفتاح الترخيص أعلاه واحتفظ به في مكان آمن.'
                            : 'Copy your license key above and keep it handy.'}
                        </li>
                        <li>
                          {language === 'ar'
                            ? 'توجه إلى بوابة التفعيل أو المستودع البرمجي عبر الرابط الرسمي أدناه.'
                            : 'Navigate to the activation portal or source repository via the official links below.'}
                        </li>
                        <li>
                          {language === 'ar'
                            ? 'في حقل إعدادات البيئة (ENV) أو شاشة التفعيل، الصق الكود ليتم تشغيل الصلاحيات فوراً.'
                            : 'Paste the key into your environment configuration (ENV) or initial setup screen.'}
                        </li>
                      </ol>

                      {/* Official Service Links */}
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <a
                          href="https://github.com"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-semibold"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'مستودع الكود والدليل الفني' : 'Documentation & Source'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-slate-700">•</span>
                        <button
                          type="button"
                          onClick={() => setTroubleshootOrder(order)}
                          className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline cursor-pointer"
                        >
                          <LifeBuoy className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'فتح تذكرة دعم فني لهذا الطلب' : 'Open Support Ticket'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Troubleshooting Ticket Modal */}
        {troubleshootOrder && (
          <TroubleshootTicketModal
            orderId={troubleshootOrder.id}
            productName={troubleshootOrder.product_name}
            customerEmail={troubleshootOrder.customer_email}
            onClose={() => setTroubleshootOrder(null)}
          />
        )}
      </main>
    </div>
  );
}
