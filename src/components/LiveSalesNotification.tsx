/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBilingual } from '../BilingualContext';
import { Zap, CheckCircle2, X } from 'lucide-react';

interface SimulatedSale {
  product_ar: string;
  product_en: string;
  city_ar: string;
  city_en: string;
  secondsAgo: number;
}

const SAMPLE_SALES: SimulatedSale[] = [
  { product_ar: 'اشتراك شات جي بي تي بلس (ChatGPT Plus)', product_en: 'ChatGPT Plus 1-Month', city_ar: 'الرياض', city_en: 'Riyadh', secondsAgo: 14 },
  { product_ar: 'مفتاح ويندوز 11 برو الأصلي (Windows 11 Pro)', product_en: 'Windows 11 Pro Key', city_ar: 'جدة', city_en: 'Jeddah', secondsAgo: 38 },
  { product_ar: 'بطاقة ستيم 50 دولار (Steam Wallet $50)', product_en: 'Steam Wallet $50 Card', city_ar: 'الدمام', city_en: 'Dammam', secondsAgo: 52 },
  { product_ar: 'اشتراك كانفا برو سنوي (Canva Pro 1 Year)', product_en: 'Canva Pro 1-Year', city_ar: 'مكة المكرمة', city_en: 'Makkah', secondsAgo: 85 },
  { product_ar: 'اشتراك يوتيوب بريميوم 6 أشهر', product_en: 'YouTube Premium 6-Months', city_ar: 'المدينة المنورة', city_en: 'Madinah', secondsAgo: 110 }
];

export default function LiveSalesNotification() {
  const { language } = useBilingual();
  const [currentSale, setCurrentSale] = useState<SimulatedSale | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Initial popup after 4 seconds
    const initialTimer = setTimeout(() => {
      showRandomSale();
    }, 4000);

    // Periodic interval every 18-28 seconds
    const interval = setInterval(() => {
      showRandomSale();
    }, 22000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed]);

  const showRandomSale = () => {
    if (isDismissed) return;
    const randomIndex = Math.floor(Math.random() * SAMPLE_SALES.length);
    setCurrentSale(SAMPLE_SALES[randomIndex]);
    setIsVisible(true);

    // Auto-hide after 5.5 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 5500);
  };

  if (!currentSale || !isVisible || isDismissed) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-5 left-5 rtl:left-auto rtl:right-5 z-40 max-w-xs sm:max-w-sm bg-slate-900/95 backdrop-blur-md text-white p-3 sm:p-3.5 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-3 transition-all duration-300 animate-in slide-in-from-bottom-4"
    >
      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
        <Zap className="w-4.5 h-4.5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
          <CheckCircle2 className="w-3 h-3" />
          <span>{language === 'ar' ? 'عملية تسليم فوري تمت للتو' : 'Live Delivery Confirmed'}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono">
            {currentSale.secondsAgo} {language === 'ar' ? 'ث' : 's'}
          </span>
        </div>

        <p className="text-xs font-bold text-slate-100 truncate mt-0.5">
          {language === 'ar' ? currentSale.product_ar : currentSale.product_en}
        </p>

        <p className="text-[10px] text-slate-400 truncate">
          {language === 'ar' 
            ? `عميل موثق في ${currentSale.city_ar} استلم كوده الآن` 
            : `Verified buyer in ${currentSale.city_en} just received the key`}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer self-start"
        title={language === 'ar' ? 'إغلاق' : 'Dismiss'}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
