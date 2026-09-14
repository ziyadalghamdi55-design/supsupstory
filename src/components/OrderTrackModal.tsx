/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBilingual } from '../BilingualContext';
import { StoreOrder } from '../types';
import { 
  X, 
  Search, 
  PackageCheck, 
  KeyRound, 
  Mail, 
  Copy, 
  Check, 
  Calendar, 
  AlertCircle,
  Loader2,
  ShieldAlert,
  Clock
} from 'lucide-react';

interface OrderTrackModalProps {
  onClose: () => void;
}

export default function OrderTrackModal({ onClose }: OrderTrackModalProps) {
  const { language } = useBilingual();
  const [orderQuery, setOrderQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState<StoreOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          setRateLimitError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim() || cooldownSeconds > 0) return;

    setIsSearching(true);
    setNotFound(false);
    setSearchedOrder(null);
    setRateLimitError(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderQuery.trim())}`);
      const data = await res.json();

      if (res.status === 429) {
        const cd = data.cooldown || 30;
        setCooldownSeconds(cd);
        setRateLimitError(data.error || (language === 'en' ? `Security rate limit active. Please wait ${cd}s.` : `تم تفعيل الحماية ضد التخمين. يرجى الانتظار ${cd} ثانية.`));
        return;
      }

      if (res.ok && data.order) {
        setSearchedOrder(data.order);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      id="order-track-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="order-track-modal-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              {language === 'en' ? 'Track Digital Order & License' : 'تتبع الطلب واسترجاع كود التفعيل'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form & Results */}
        <div className="p-5 space-y-4">
          <form onSubmit={handleSearchOrder} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              {language === 'en' ? 'Enter Order ID or License Code' : 'أدخل رقم الطلب أو كود التفعيل'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 rtl:right-3 rtl:left-auto" />
                <input
                  type="text"
                  required
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. ord_abc123 or SHK-...' : 'مثال: ord_abc123 أو SHK-...'}
                  dir="ltr"
                  className="w-full text-xs font-mono pl-9 pr-3 py-2.5 rtl:pr-9 rtl:pl-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !orderQuery.trim() || cooldownSeconds > 0}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 gap-1.5"
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : cooldownSeconds > 0 ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>{cooldownSeconds}s</span>
                  </>
                ) : (
                  language === 'en' ? 'Search' : 'بحث'
                )}
              </button>
            </div>
          </form>

          {rateLimitError && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-950">
                  {language === 'en' ? 'Anti-Brute Force Protection' : 'جدار الحماية من التخمين العشوائي'}
                </p>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  {rateLimitError}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 pt-1">
                  <Clock className="w-3 h-3" />
                  <span>{language === 'en' ? `Cooldown remaining: ${cooldownSeconds}s` : `الوقت المتبقي لفك الحظر: ${cooldownSeconds} ثانية`}</span>
                </div>
              </div>
            </div>
          )}

          {notFound && !rateLimitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {language === 'en' 
                  ? 'No matching order found. Please verify your reference number or check your email.' 
                  : 'لم يتم العثور على طلب مطابق. تأكد من صحة الرمز أو راجع بريدك الإلكتروني.'}
              </span>
            </div>
          )}

          {searchedOrder && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-900">{searchedOrder.product_name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {language === 'en' ? 'DELIVERED' : 'تم التسليم بنجاح'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{language === 'en' ? 'Recipient Email:' : 'البريد المسجل:'}</span>
                  <span className="font-mono font-medium text-slate-800">{searchedOrder.customer_email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{language === 'en' ? 'Amount Paid:' : 'المبلغ المدفوع:'}</span>
                  <span className="font-mono font-bold text-slate-900">{searchedOrder.amount} {language === 'en' ? 'SAR' : 'ر.س'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{language === 'en' ? 'Date:' : 'التاريخ:'}</span>
                  <span className="font-mono text-slate-600">
                    {new Date(searchedOrder.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* License Code Display */}
              <div className="bg-slate-950 p-3 rounded-lg flex items-center justify-between text-white">
                <div className="flex items-center gap-2 overflow-hidden">
                  <KeyRound className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-xs text-emerald-300 font-bold truncate select-all">
                    {searchedOrder.license_code}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(searchedOrder.license_code)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold rounded text-white transition flex items-center gap-1 shrink-0 ml-2 rtl:mr-2 rtl:ml-0 cursor-pointer"
                >
                  {copiedKey ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{language === 'en' ? 'Copied' : 'تم'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{language === 'en' ? 'Copy' : 'نسخ'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
