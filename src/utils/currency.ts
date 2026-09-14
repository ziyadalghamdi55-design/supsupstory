/**
 * Currency management and exchange rates
 * Default base: SAR (Saudi Riyal = 1.0)
 * Exchange rates:
 * SAR: 1.0
 * USD: 0.2666 (approx 1 USD = 3.75 SAR) -> let's use 0.27
 * AED: 0.98 (1 SAR = 0.98 AED)
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
  },
  USD: {
    code: 'USD',
    name_ar: 'دولار أمريكي',
    name_en: 'US Dollar',
    symbol_ar: '$',
    symbol_en: 'USD',
    rate: 0.27, // 1 SAR = 0.27 USD
  },
  AED: {
    code: 'AED',
    name_ar: 'درهم إماراتي',
    name_en: 'UAE Dirham',
    symbol_ar: 'د.إ',
    symbol_en: 'AED',
    rate: 0.98, // 1 SAR = 0.98 AED
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
  // For USD, round to 2 decimals or 1 decimal if cents
  if (targetCurrency === 'USD') {
    return Math.round(converted * 100) / 100;
  }
  // For SAR and AED, integer or 1 decimal if required
  return Math.round(converted);
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

  const formattedValue = targetCurrency === 'USD' 
    ? converted.toFixed(converted % 1 === 0 ? 0 : 2)
    : converted.toString();

  if (language === 'ar') {
    return `${formattedValue} ${symbol}`;
  }
  return `${symbol} ${formattedValue}`;
}
