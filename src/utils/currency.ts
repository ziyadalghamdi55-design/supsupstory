/**
 * Currency management and exchange rates
 * Default base: SAR (Saudi Riyal = 1.0)
 * GCC Currencies supported:
 * - SAR: Saudi Riyal (Base: 1.0)
 * - AED: UAE Dirham (approx 0.98)
 * - KWD: Kuwaiti Dinar (approx 0.082)
 * - QAR: Qatari Riyal (approx 0.97)
 * - BHD: Bahraini Dinar (approx 0.10)
 * - OMR: Omani Rial (approx 0.103)
 * - USD: US Dollar (approx 0.27)
 */

import { CurrencyCode, CurrencyConfig } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  SAR: {
    code: 'SAR',
    name_ar: 'ريال سعودي',
    name_en: 'Saudi Riyal',
    symbol_ar: 'ر.س',
    symbol_en: 'SAR',
    rate: 1.0,
    flag: '🇸🇦',
    country_ar: 'المملكة العربية السعودية',
    country_en: 'Saudi Arabia',
  },
  AED: {
    code: 'AED',
    name_ar: 'درهم إماراتي',
    name_en: 'UAE Dirham',
    symbol_ar: 'د.إ',
    symbol_en: 'AED',
    rate: 0.98,
    flag: '🇦🇪',
    country_ar: 'الإمارات العربية المتحدة',
    country_en: 'United Arab Emirates',
  },
  KWD: {
    code: 'KWD',
    name_ar: 'دينار كويتي',
    name_en: 'Kuwaiti Dinar',
    symbol_ar: 'د.ك',
    symbol_en: 'KWD',
    rate: 0.082,
    flag: '🇰🇼',
    country_ar: 'الكويت',
    country_en: 'Kuwait',
  },
  QAR: {
    code: 'QAR',
    name_ar: 'ريال قطري',
    name_en: 'Qatari Riyal',
    symbol_ar: 'ر.ق',
    symbol_en: 'QAR',
    rate: 0.97,
    flag: '🇶🇦',
    country_ar: 'قطر',
    country_en: 'Qatar',
  },
  BHD: {
    code: 'BHD',
    name_ar: 'دينار بحريني',
    name_en: 'Bahraini Dinar',
    symbol_ar: 'د.ب',
    symbol_en: 'BHD',
    rate: 0.10,
    flag: '🇧🇭',
    country_ar: 'البحرين',
    country_en: 'Bahrain',
  },
  OMR: {
    code: 'OMR',
    name_ar: 'ريال عماني',
    name_en: 'Omani Rial',
    symbol_ar: 'ر.ع',
    symbol_en: 'OMR',
    rate: 0.103,
    flag: '🇴🇲',
    country_ar: 'سلطنة عمان',
    country_en: 'Oman',
  },
  USD: {
    code: 'USD',
    name_ar: 'دولار أمريكي',
    name_en: 'US Dollar',
    symbol_ar: '$',
    symbol_en: 'USD',
    rate: 0.27,
    flag: '🇺🇸',
    country_ar: 'الولايات المتحدة',
    country_en: 'United States',
  },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'SAR';

export function getSavedCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  const saved = localStorage.getItem('shakhsi_currency') as CurrencyCode;
  if (saved && CURRENCIES[saved]) {
    return saved;
  }
  return DEFAULT_CURRENCY;
}

export function saveCurrency(code: CurrencyCode) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('shakhsi_currency', code);
  }
}

/**
 * Convert an amount given in SAR to the target currency
 */
export function convertFromSAR(amountInSAR: number, targetCurrency: CurrencyCode): number {
  const config = CURRENCIES[targetCurrency] || CURRENCIES.SAR;
  const converted = amountInSAR * config.rate;

  // Decimal currencies with precision requirements
  if (['KWD', 'BHD', 'OMR', 'USD'].includes(targetCurrency)) {
    return Math.round(converted * 100) / 100;
  }

  // SAR, AED, QAR: round to 2 decimals if fractional, else round to whole integer
  const rounded = Math.round(converted * 100) / 100;
  return rounded % 1 === 0 ? Math.round(converted) : rounded;
}

/**
 * Format an amount given in SAR for display in target currency
 */
export function formatCurrency(
  amountInSAR: number,
  targetCurrency: CurrencyCode = 'SAR',
  language: 'ar' | 'en' = 'ar'
): string {
  const config = CURRENCIES[targetCurrency] || CURRENCIES.SAR;
  const converted = convertFromSAR(amountInSAR, targetCurrency);
  const symbol = language === 'ar' ? config.symbol_ar : config.symbol_en;

  let formattedValue: string;
  if (['KWD', 'BHD', 'OMR'].includes(targetCurrency)) {
    formattedValue = converted.toFixed(2);
  } else if (targetCurrency === 'USD') {
    formattedValue = converted.toFixed(converted % 1 === 0 ? 0 : 2);
  } else {
    formattedValue = converted % 1 === 0 ? converted.toString() : converted.toFixed(2);
  }

  if (language === 'ar') {
    return `${formattedValue} ${symbol}`;
  }
  return `${symbol} ${formattedValue}`;
}
