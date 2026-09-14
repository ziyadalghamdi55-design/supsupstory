/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyCode, CurrencyConfig } from './types';
import { CURRENCIES, DEFAULT_CURRENCY, getSavedCurrency, saveCurrency, formatCurrency as formatCurrencyUtil, convertFromSAR } from './utils/currency';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  currencies: Record<CurrencyCode, CurrencyConfig>;
  format: (amountInSAR: number, language?: 'ar' | 'en') => string;
  convert: (amountInSAR: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => getSavedCurrency());

  useEffect(() => {
    saveCurrency(currency);
  }, [currency]);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
  };

  const format = (amountInSAR: number, language: 'ar' | 'en' = 'ar'): string => {
    return formatCurrencyUtil(amountInSAR, currency, language);
  };

  const convert = (amountInSAR: number): number => {
    return convertFromSAR(amountInSAR, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencies: CURRENCIES,
        format,
        convert,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
