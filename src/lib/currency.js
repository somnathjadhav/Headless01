/**
 * Currency utility functions for WooCommerce integration
 */

// Default currency fallback
const DEFAULT_CURRENCY = {
  symbol: '₹',
  code: 'INR',
  position: 'before'
};

/**
 * Extract currency symbol from WooCommerce price HTML
 * @param {string} priceHtml - WooCommerce price HTML string
 * @returns {string} Currency symbol
 */
export function extractCurrencySymbol(priceHtml) {
  if (!priceHtml) return DEFAULT_CURRENCY.symbol;
  
  try {
    // Extract currency symbol from price HTML
    // Example: <span class="woocommerce-Price-currencySymbol">&#8377;</span>
    const currencyMatch = priceHtml.match(/<span class="woocommerce-Price-currencySymbol">([^<]+)<\/span>/);
    
    if (currencyMatch && currencyMatch[1]) {
      // Decode HTML entities (e.g., &#8377; → ₹)
      const currencySymbol = currencyMatch[1]
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
      
      return currencySymbol;
    }
  } catch (error) {
    console.warn('Error extracting currency symbol:', error);
  }
  
  return DEFAULT_CURRENCY.symbol;
}

/**
 * Format price with currency symbol
 * @param {number|string} price - Price value
 * @param {string} currencySymbol - Currency symbol (optional, will use default if not provided)
 * @param {string} position - Currency position: 'before' or 'after' (default: 'before')
 * @returns {string} Formatted price string
 */
export function formatPrice(price, currencySymbol = DEFAULT_CURRENCY.symbol, position = 'before') {
  const numericPrice = parseFloat(price || 0);
  const formattedPrice = numericPrice.toFixed(2);
  
  if (position === 'after') {
    return `${formattedPrice}${currencySymbol}`;
  }
  
  return `${currencySymbol}${formattedPrice}`;
}

/**
 * Get currency information from product data
 * @param {Object} product - Product object with price_html
 * @returns {Object} Currency information
 */
export function getCurrencyFromProduct(product) {
  const symbol = extractCurrencySymbol(product?.price_html);
  
  return {
    symbol,
    code: DEFAULT_CURRENCY.code, // Could be enhanced to detect currency code
    position: DEFAULT_CURRENCY.position
  };
}

/**
 * Create a price formatter function for a specific currency
 * @param {string} currencySymbol - Currency symbol
 * @param {string} position - Currency position
 * @returns {Function} Price formatter function
 */
export function createPriceFormatter(currencySymbol = DEFAULT_CURRENCY.symbol, position = 'before') {
  return (price) => formatPrice(price, currencySymbol, position);
}

// Export default currency for backward compatibility
export const defaultCurrency = DEFAULT_CURRENCY;
