import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'INR' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountInInr: number) => string;
  convertPrice: (amountInInr: number) => number;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const EXCHANGE_RATE_INR_TO_USD = 0.012; // ~83.3 INR per USD

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('aura_currency') as Currency) || 'INR';
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('aura_currency', c);
  };

  const convertPrice = (amountInInr: number): number => {
    if (currency === 'USD') {
      return Math.round(amountInInr * EXCHANGE_RATE_INR_TO_USD * 100) / 100;
    }
    return amountInInr;
  };

  const formatPrice = (amountInInr: number): string => {
    if (currency === 'USD') {
      const usdVal = convertPrice(amountInInr);
      return `$${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₹${amountInInr.toLocaleString('en-IN')}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        symbol: currency === 'USD' ? '$' : '₹',
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

