/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBilingual } from '../BilingualContext';
import { Lock, KeyRound, ShieldCheck, ArrowRight, ArrowLeft, Store, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminLockModalProps {
  onSuccess: () => void;
}

export default function AdminLockModal({ onSuccess }: AdminLockModalProps) {
  const { language, direction } = useBilingual();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Authorized client-side PINs
  const VALID_PINS = ['1234', 'admin', '2026', 'shakhsi123', 'root', 'owner', '1111', '0000'];

  const executeSuccessfulLogin = () => {
    // 1. Save authentication state locally in localStorage
    localStorage.setItem('shakhsi_admin_authed', 'true');
    localStorage.setItem(
      'shakhsi_current_user',
      JSON.stringify({
        id: 'owner_master',
        name: 'مدير المتجر',
        email: 'ziyadalghamdi55@gmail.com',
        role: 'owner',
      })
    );
    setErrorMsg('');
    // 2. Invoke onSuccess callback directly without server dependencies
    onSuccess();
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim().toLowerCase();
    if (!cleanPin) return;

    // Validate directly in browser
    if (VALID_PINS.includes(cleanPin) || cleanPin === '1234') {
      executeSuccessfulLogin();
    } else {
      setErrorMsg(
        language === 'ar'
          ? 'رمز الدخول غير مطابق. أدخل 1234 أو اضغط على أحد الأزرار السريعة بالأسفل.'
          : 'Incorrect PIN. Enter 1234 or click any quick access button below.'
      );
    }
  };

  const handleQuickAccess = (demoPin: string) => {
    setPin(demoPin);
    executeSuccessfulLogin();
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
              <span>{language === 'ar' ? 'مصادقة محلية فورية' : 'Instant Client-Side Auth'}</span>
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {language === 'ar' ? 'بوابة إدارة شخصي Platform' : 'Shakhsi Platform Admin Portal'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              {language === 'ar'
                ? 'أدخل الرمز 1234 أو اضغط على أي زر سريع للدخول إلى لوحة التحكم فوراً دون انتظار.'
                : 'Enter PIN 1234 or click any quick access button below to unlock the workspace.'}
            </p>
          </div>
        </div>

        {/* PIN Submission Form */}
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2 font-mono flex items-center justify-between">
              <span>{language === 'ar' ? 'رمز الدخول (Master PIN)' : 'Master Admin PIN'}</span>
              <span className="text-[11px] text-emerald-400 font-normal">
                {language === 'ar' ? 'الرمز: 1234' : 'PIN: 1234'}
              </span>
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500 rtl:right-3.5 rtl:left-auto" />
              <input
                type="text"
                required
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="1234"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-11 py-3 text-white text-lg tracking-widest text-center font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={!pin.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{language === 'ar' ? 'فتح لوحة التحكم فوراً' : 'Unlock Dashboard Instantly'}</span>
            {direction === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Quick Instant Bypass Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-2.5">
          <span className="text-[11px] text-slate-400 block font-medium flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ar' ? 'دخول مباشر فوري بنقرة واحدة:' : 'One-Click Quick Access Buttons:'}</span>
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickAccess('1234')}
              className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 transition cursor-pointer shadow-xs active:scale-95"
            >
              1234 ⚡
            </button>
            <button
              type="button"
              onClick={() => handleQuickAccess('admin')}
              className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition cursor-pointer active:scale-95"
            >
              admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickAccess('2026')}
              className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition cursor-pointer active:scale-95"
            >
              2026
            </button>
            <button
              type="button"
              onClick={() => handleQuickAccess('shakhsi123')}
              className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 transition cursor-pointer active:scale-95"
            >
              shakhsi123
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
