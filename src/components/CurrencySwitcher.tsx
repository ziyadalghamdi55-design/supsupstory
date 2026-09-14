/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../CurrencyContext';
import { useBilingual } from '../BilingualContext';
import { CurrencyCode } from '../types';
import { ChevronDown, Check, Coins } from 'lucide-react';

interface CurrencySwitcherProps {
  compact?: boolean;
  className?: string;
  variant?: 'dark' | 'light';
  align?: 'start' | 'end' | 'auto';
}

interface CurrencyItem {
  code: CurrencyCode;
  flag: string;
  nameAr: string;
  nameEn: string;
  symbolAr: string;
  symbolEn: string;
  rateDescAr: string;
  rateDescEn: string;
  isGcc?: boolean;
}

const ALL_CURRENCY_OPTIONS: CurrencyItem[] = [
  {
    code: 'SAR',
    flag: '🇸🇦',
    nameAr: 'ريال سعودي',
    nameEn: 'Saudi Riyal',
    symbolAr: 'ر.س',
    symbolEn: 'SAR',
    rateDescAr: 'العملة الأساسية (1.0)',
    rateDescEn: 'Base Currency (1.0)',
    isGcc: true,
  },
  {
    code: 'AED',
    flag: '🇦🇪',
    nameAr: 'درهم إماراتي',
    nameEn: 'UAE Dirham',
    symbolAr: 'د.إ',
    symbolEn: 'AED',
    rateDescAr: '1 ر.س ≈ 0.98 د.إ',
    rateDescEn: '1 SAR ≈ 0.98 AED',
    isGcc: true,
  },
  {
    code: 'KWD',
    flag: '🇰🇼',
    nameAr: 'دينار كويتي',
    nameEn: 'Kuwaiti Dinar',
    symbolAr: 'د.ك',
    symbolEn: 'KWD',
    rateDescAr: '1 ر.س ≈ 0.082 د.ك',
    rateDescEn: '1 SAR ≈ 0.082 KWD',
    isGcc: true,
  },
  {
    code: 'QAR',
    flag: '🇶🇦',
    nameAr: 'ريال قطري',
    nameEn: 'Qatari Riyal',
    symbolAr: 'ر.ق',
    symbolEn: 'QAR',
    rateDescAr: '1 ر.س ≈ 0.97 ر.ق',
    rateDescEn: '1 SAR ≈ 0.97 QAR',
    isGcc: true,
  },
  {
    code: 'BHD',
    flag: '🇧🇭',
    nameAr: 'دينار بحريني',
    nameEn: 'Bahraini Dinar',
    symbolAr: 'د.ب',
    symbolEn: 'BHD',
    rateDescAr: '1 ر.س ≈ 0.10 د.ب',
    rateDescEn: '1 SAR ≈ 0.10 BHD',
    isGcc: true,
  },
  {
    code: 'OMR',
    flag: '🇴🇲',
    nameAr: 'ريال عماني',
    nameEn: 'Omani Rial',
    symbolAr: 'ر.ع',
    symbolEn: 'OMR',
    rateDescAr: '1 ر.س ≈ 0.103 ر.ع',
    rateDescEn: '1 SAR ≈ 0.103 OMR',
    isGcc: true,
  },
  {
    code: 'USD',
    flag: '🇺🇸',
    nameAr: 'دولار أمريكي',
    nameEn: 'US Dollar',
    symbolAr: '$',
    symbolEn: 'USD',
    rateDescAr: '1 ر.س ≈ 0.27 $',
    rateDescEn: '1 SAR ≈ 0.27 USD',
    isGcc: false,
  },
];

export default function CurrencySwitcher({ 
  compact = false, 
  className = '', 
  variant = 'dark',
  align = 'auto',
}: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();
  const { language, direction } = useBilingual();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = ALL_CURRENCY_OPTIONS.find((c) => c.code === currency) || ALL_CURRENCY_OPTIONS[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectCurrency = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  const gccCurrencies = ALL_CURRENCY_OPTIONS.filter((c) => c.isGcc);
  const otherCurrencies = ALL_CURRENCY_OPTIONS.filter((c) => !c.isGcc);

  // Determine alignment
  let alignClasses = direction === 'rtl' ? 'left-0 sm:left-0' : 'right-0 sm:right-0';
  if (align === 'start') {
    alignClasses = direction === 'rtl' ? 'right-0' : 'left-0';
  } else if (align === 'end') {
    alignClasses = direction === 'rtl' ? 'left-0' : 'right-0';
  }

  // Trigger button styling
  const isLight = variant === 'light';
  const triggerButtonClasses = isLight
    ? `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border bg-slate-100/90 hover:bg-slate-200 text-slate-900 border-slate-300 shadow-2xs ${
        isOpen ? 'ring-2 ring-emerald-500/50 border-emerald-500' : ''
      }`
    : `flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
        compact
          ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 shadow-2xs'
          : 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700/90 shadow-xs'
      } ${isOpen ? 'ring-2 ring-emerald-500/50 border-emerald-500/80' : ''}`;

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={triggerButtonClasses}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={language === 'en' ? 'Select currency' : 'اختر عملة التسوق'}
      >
        <span className="text-sm leading-none" role="img" aria-label={activeOption.code}>
          {activeOption.flag}
        </span>
        <span className={`font-mono tracking-tight font-extrabold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
          {activeOption.code}
        </span>
        <span className={`${isLight ? 'text-slate-500' : 'text-slate-400'} text-[11px] hidden xs:inline`}>
          ({language === 'en' ? activeOption.symbolEn : activeOption.symbolAr})
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isLight ? (isOpen ? 'rotate-180 text-emerald-600' : 'text-slate-500') : (isOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400')
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute z-50 mt-2 w-64 max-h-[85vh] overflow-y-auto rounded-xl bg-slate-900 border border-slate-700/90 shadow-2xl shadow-black/60 p-1.5 text-xs text-slate-200 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${alignClasses}`}
        >
          {/* Header Title */}
          <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white text-[11px]">
                {language === 'en' ? 'Select Store Currency' : 'اختر عملة التسوق'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">GCC / SAR</span>
          </div>

          {/* GCC Currencies Section */}
          <div className="px-2 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            {language === 'en' ? 'GCC Currencies (دول الخليج)' : 'عملات دول الخليج العربي (GCC)'}
          </div>

          <div className="space-y-0.5">
            {gccCurrencies.map((opt) => {
              const isSelected = currency === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectCurrency(opt.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-right transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none" role="img" aria-label={opt.code}>
                      {opt.flag}
                    </span>
                    <div className="text-start">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold font-mono text-white text-xs">{opt.code}</span>
                        <span className="text-[11px] text-slate-400">
                          {language === 'en' ? opt.nameEn : opt.nameAr}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        {language === 'en' ? opt.rateDescEn : opt.rateDescAr}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-800/90 text-amber-300 font-bold">
                      {language === 'en' ? opt.symbolEn : opt.symbolAr}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Other / International Currencies */}
          <div className="mt-2 pt-1 border-t border-slate-800">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'en' ? 'International Currencies' : 'عملات دولية أخرى'}
            </div>
            <div className="space-y-0.5">
              {otherCurrencies.map((opt) => {
                const isSelected = currency === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectCurrency(opt.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-right transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold'
                        : 'hover:bg-slate-800/80 text-slate-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none" role="img" aria-label={opt.code}>
                        {opt.flag}
                      </span>
                      <div className="text-start">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold font-mono text-white text-xs">{opt.code}</span>
                          <span className="text-[11px] text-slate-400">
                            {language === 'en' ? opt.nameEn : opt.nameAr}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          {language === 'en' ? opt.rateDescEn : opt.rateDescAr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-800/90 text-amber-300 font-bold">
                        {language === 'en' ? opt.symbolEn : opt.symbolAr}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

