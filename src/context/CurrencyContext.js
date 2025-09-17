import React, { createContext, useContext, useState, useEffect } from 'react';
import { extractCurrencySymbol, formatPrice, defaultCurrency } from '../lib/currency';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch currency from WooCommerce settings
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await fetch('/api/currency');
        if (response.ok) {
          const currencyData = await response.json();
          setCurrency(currencyData);
          console.log('✅ Currency context updated:', currencyData);
        } else {
          console.warn('Failed to fetch currency from API, using default');
        }
      } catch (error) {
        console.warn('Failed to fetch currency from WooCommerce, using default:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrency();
  }, []);

  // Update currency from product data
  const updateCurrencyFromProduct = (product) => {
    if (product?.price_html) {
      const symbol = extractCurrencySymbol(product.price_html);
      setCurrency(prev => ({
        ...prev,
        symbol
      }));
    }
  };

  // Format price using current currency
  const formatPriceWithCurrency = (price) => {
    return formatPrice(price, currency.symbol, currency.position);
  };

  const value = {
    currency,
    isLoading,
    updateCurrencyFromProduct,
    formatPrice: formatPriceWithCurrency,
    setCurrency
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
