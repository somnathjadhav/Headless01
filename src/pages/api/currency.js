import { wooCommerceAPI } from '../../lib/woocommerce';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get a sample product to extract currency information
    const { products } = await wooCommerceAPI.getProducts({ per_page: 1 });
    
    if (products && products.length > 0) {
      const product = products[0];
      
      // Extract currency symbol from price_html
      let currencySymbol = '₹'; // Default fallback
      let currencyCode = 'INR'; // Default fallback
      
      if (product.price_html) {
        // Extract currency symbol from WooCommerce price HTML
        const currencyMatch = product.price_html.match(/<span class="woocommerce-Price-currencySymbol">([^<]+)<\/span>/);
        
        if (currencyMatch && currencyMatch[1]) {
          // Decode HTML entities (e.g., &#8377; → ₹)
          currencySymbol = currencyMatch[1]
            .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
        }
      }
      
      // Try to determine currency code from symbol
      const symbolToCode = {
        '₹': 'INR',
        '$': 'USD',
        '€': 'EUR',
        '£': 'GBP',
        '¥': 'JPY',
        '₽': 'RUB',
        '₩': 'KRW',
        '₪': 'ILS',
        '₦': 'NGN',
        '₨': 'PKR',
        '₫': 'VND',
        '₱': 'PHP',
        '₴': 'UAH',
        '₸': 'KZT',
        '₼': 'AZN',
        '₾': 'GEL',
        '₿': 'BTC'
      };
      
      currencyCode = symbolToCode[currencySymbol] || 'INR';
      
      const currencyInfo = {
        symbol: currencySymbol,
        code: currencyCode,
        position: 'before', // WooCommerce default
        decimal_separator: '.',
        thousand_separator: ',',
        decimals: 2
      };
      
      console.log('✅ Currency fetched from WooCommerce:', currencyInfo);
      
      return res.status(200).json(currencyInfo);
    }
    
    // Fallback if no products found
    return res.status(200).json({
      symbol: '₹',
      code: 'INR',
      position: 'before',
      decimal_separator: '.',
      thousand_separator: ',',
      decimals: 2
    });
    
  } catch (error) {
    console.error('Error fetching currency:', error);
    
    // Return default currency on error
    return res.status(200).json({
      symbol: '₹',
      code: 'INR',
      position: 'before',
      decimal_separator: '.',
      thousand_separator: ',',
      decimals: 2
    });
  }
}

