/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBilingual } from '../BilingualContext';
import { Lock, KeyRound, ShieldCheck, ArrowRight, ArrowLeft, Loader2, Sparkles, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminLockModalProps {
  onSuccess: () => void;
}

export default function AdminLockModal({ onSuccess }: AdminLockModalProps) {
  const { language, direction } = useBilingual();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/admin-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('shakhsi_admin_authed', 'true');
        onSuccess();
      } else {
        setErrorMsg(
          data.error || 
          (language === 'ar' ? 'رمز الدخول غير صحيح. الرمز الافتراضي: shakhsi123' : 'Incorrect Admin PIN. Default: shakhsi123')
        );
      }
    } catch (err) {
      setErrorMsg(language === 'ar' ? 'تعذر التحقق من الرمز' : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (demoPin: string) => {
    setPin(demoPin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div 
        id="admin-lock-card"
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-slate-100"
      >
        {/* Glow ambient background accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logotype & Shield Badge */}
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
            <Lock className="w-8 h-8 text-slate-950" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 text-[11px] font-mono font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'ar' ? 'منطقة إدارية محمية' : 'Admin Protected Zone'}</span>
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {language === 'ar' ? 'بوابة إدارة شخصي Platform' : 'Shakhsi Platform Admin Portal'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              {language === 'ar'
                ? 'يرجى إدخال رمز المرور الإداري (Admin PIN) للوصول إلى لوحة التحكم والطلبات.'
                : 'Please enter the Master Admin PIN or Owner Password to unlock workspace controls.'}
            </p>
          </div>
        </div>

        {/* PIN Submission Form */}
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2 font-mono">
              {language === 'ar' ? 'رمز الدخول (Master PIN / Password)' : 'Master Admin PIN / Password'}
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500 rtl:right-3.5 rtl:left-auto" />
              <input
                type="password"
                required
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••••••••"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-11 py-3 text-white text-base tracking-widest text-center font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium animate-shake">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !pin.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'ar' ? 'جاري التحقق...' : 'Unlocking...'}</span>
              </>
            ) : (
              <>
                <span>{language === 'ar' ? 'فتح لوحة التحكم' : 'Unlock Dashboard'}</span>
                {direction === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Assist / Bypass for ease of evaluation */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-2">
          <span className="text-[11px] text-slate-500 block">
            {language === 'ar' ? 'أزرار سريعة للمعاينة والتجربة:' : 'Quick Demo Fill Buttons:'}
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('shakhsi123')}
              className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition cursor-pointer"
            >
              shakhsi123
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('admin')}
              className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition cursor-pointer"
            >
              admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('2026')}
              className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition cursor-pointer"
            >
              2026
            </button>
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <Store className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'الرجوع إلى المتجر العام' : 'Return to Public Storefront'}</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
