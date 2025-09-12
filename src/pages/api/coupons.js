import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

// Initialize WooCommerce API
const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://staging.eternitty.com/headless-woo',
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_1234567890abcdef',
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1234567890abcdef',
  version: 'wc/v3'
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { couponCode, cartTotal } = req.body;

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    console.log('🎫 Validating coupon code:', couponCode);

    // Get coupon details from WooCommerce
    try {
      const response = await api.get(`coupons`, {
        code: couponCode
      });

      if (response.data && response.data.length > 0) {
        const coupon = response.data[0];
        console.log('🎫 Found WooCommerce coupon:', coupon.code);

        // Check if coupon is valid
        const now = new Date();
        const expiryDate = coupon.date_expires ? new Date(coupon.date_expires) : null;

        if (expiryDate && now > expiryDate) {
          return res.status(400).json({
            success: false,
            message: 'Coupon has expired',
            error: 'EXPIRED'
          });
        }

        // Check usage limits
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
          return res.status(400).json({
            success: false,
            message: 'Coupon usage limit reached',
            error: 'USAGE_LIMIT_REACHED'
          });
        }

        // Check minimum amount
        if (coupon.minimum_amount && cartTotal < parseFloat(coupon.minimum_amount)) {
          return res.status(400).json({
            success: false,
            message: `Minimum order amount of ₹${coupon.minimum_amount} required`,
            error: 'MINIMUM_AMOUNT_NOT_MET'
          });
        }

        // Check maximum amount
        if (coupon.maximum_amount && cartTotal > parseFloat(coupon.maximum_amount)) {
          return res.status(400).json({
            success: false,
            message: `Maximum order amount of ₹${coupon.maximum_amount} exceeded`,
            error: 'MAXIMUM_AMOUNT_EXCEEDED'
          });
        }

        return res.status(200).json({
          success: true,
          coupon: {
            id: coupon.id,
            code: coupon.code,
            amount: coupon.amount,
            discount_type: coupon.discount_type,
            description: coupon.description,
            minimum_amount: coupon.minimum_amount,
            maximum_amount: coupon.maximum_amount,
            individual_use: coupon.individual_use,
            exclude_sale_items: coupon.exclude_sale_items,
            usage_limit: coupon.usage_limit,
            usage_count: coupon.usage_count,
            usage_limit_per_user: coupon.usage_limit_per_user,
            limit_usage_to_x_items: coupon.limit_usage_to_x_items,
            free_shipping: coupon.free_shipping,
            product_categories: coupon.product_categories,
            excluded_product_categories: coupon.excluded_product_categories,
            product_ids: coupon.product_ids,
            excluded_product_ids: coupon.excluded_product_ids,
            customer_email: coupon.customer_email,
            date_expires: coupon.date_expires,
            date_expires_gmt: coupon.date_expires_gmt
          }
        });
      } else {
        console.log('🎫 Coupon not found:', couponCode);
        return res.status(404).json({
          success: false,
          message: 'Invalid coupon code',
          error: 'INVALID_CODE'
        });
      }
    } catch (wcError) {
      console.log('🎫 WooCommerce API error:', wcError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to validate coupon. Please try again.',
        error: 'WOOCOMMERCE_API_ERROR'
      });
    }

  } catch (error) {
    console.error('🎫 Coupon validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
