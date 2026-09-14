/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useCurrency } from '../CurrencyContext';
import { useBilingual } from '../BilingualContext';
import { CurrencyCode } from '../types';
import { Coins } from 'lucide-react';

interface CurrencySwitcherProps {
  compact?: boolean;
}

export default function CurrencySwitcher({ compact = false }: CurrencySwitcherProps) {
  const { currency, setCurrency, currencies } = useCurrency();
  const { language } = useBilingual();

  const options: { code: CurrencyCode; labelAr: string; labelEn: string; symbol: string }[] = [
    { code: 'SAR', labelAr: 'SAR (ر.س)', labelEn: 'SAR (ر.س)', symbol: 'ر.س' },
    { code: 'USD', labelAr: 'USD ($)', labelEn: 'USD ($)', symbol: '$' },
    { code: 'AED', labelAr: 'AED (د.إ)', labelEn: 'AED (د.إ)', symbol: 'د.إ' },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80 text-xs">
        {options.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => setCurrency(opt.code)}
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              currency === opt.code
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title={language === 'en' ? currencies[opt.code].name_en : currencies[opt.code].name_ar}
          >
            {opt.code}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
      <Coins className="w-3.5 h-3.5 text-slate-500 mx-1 shrink-0" />
      <div className="flex items-center gap-1">
        {options.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => setCurrency(opt.code)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currency === opt.code
                ? 'bg-white text-slate-950 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {opt.code}
          </button>
        ))}
      </div>
    </div>
  );
}
