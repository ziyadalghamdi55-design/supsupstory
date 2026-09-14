/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBilingual } from '../BilingualContext';
import { StoreProduct } from '../types';
import { Bell, X, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

interface StockAlertModalProps {
  product: StoreProduct | null;
  onClose: () => void;
}

export default function StockAlertModal({ product, onClose }: StockAlertModalProps) {
  const { language } = useBilingual();
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('shakhsi_customer_email') || '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage(
        language === 'en'
          ? 'Please enter a valid email address.'
          : 'يرجى كتابة بريد إلكتروني صالح لاستلام التنبيه.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await fetch('/api/store/stock-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register stock alert');
      }

      localStorage.setItem('shakhsi_customer_email', email.trim());
      setSuccessMessage(data.message || 'تم تسجيل بريدك بنجاح! سنرسل لك إشعاراً فور توفر الدفعة الجديدة.');
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ التنبيه');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {language === 'en' ? 'Stock Notification' : 'تنبيه توفر المنتج (Back in Stock)'}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1">
              {language === 'en' ? product.name : product.name_ar || product.name}
            </p>
          </div>
        </div>

        {successMessage ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{language === 'en' ? 'Alert Activated!' : 'تم تفعيل التنبيه بنجاح'}</p>
                <p className="text-xs mt-1 leading-relaxed text-emerald-700 dark:text-emerald-400">
                  {successMessage}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              {language === 'en' ? 'Close' : 'إغلاق'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'en'
                ? 'This digital product is currently out of stock. Leave your email below to be the first to know when new license keys are restocked!'
                : 'هذا المنتج الرقمي نفد مؤقتاً لكثرة الطلب. سجل بريدك أدناه وسيقوم النظام بإرسال إشعار فوري وتنبيه على بريدك عند توفر مفاتيح إضافية.'}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'en' ? 'Your Email Address' : 'بريدك الإلكتروني لاستلام التنبيه'}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? language === 'en'
                      ? 'Saving...'
                      : 'جاري الحفظ...'
                    : language === 'en'
                    ? 'Notify Me When Available'
                    : 'أعلمني فور التوفر'}
                </span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'إلغاء'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
