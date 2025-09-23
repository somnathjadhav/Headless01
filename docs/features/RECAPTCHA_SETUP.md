# Google reCAPTCHA Setup Guide

## Environment Variables Required

Add these environment variables to your `.env.local` file and Vercel deployment:

### Required for reCAPTCHA
```bash
# Google reCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc_your_site_key_here
RECAPTCHA_SECRET_KEY=6Lc_your_secret_key_here
```

### Other Required Variables
```bash
# WordPress Backend Configuration
NEXT_PUBLIC_WORDPRESS_URL=https://staging.eternitty.com/headless-woo
WORDPRESS_URL=https://staging.eternitty.com/headless-woo

# WooCommerce API Configuration
WOOCOMMERCE_CONSUMER_KEY=ck_your_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_consumer_secret_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
```

## How to Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" to create a new site
3. Choose reCAPTCHA v2 ("I'm not a robot" Checkbox)
4. Add your domains:
   - `localhost` (for development)
   - `your-production-domain.com` (for production)
5. Copy the Site Key and Secret Key
6. Add them to your environment variables

## Pages with reCAPTCHA

✅ **Sign In Page** (`/signin`) - Google reCAPTCHA enabled
✅ **Sign Up Page** (`/signup`) - Google reCAPTCHA enabled  
✅ **Forgot Password Page** (`/forgot-password`) - Google reCAPTCHA enabled
✅ **System Status Login** (`/status`) - Google reCAPTCHA enabled

## Fallback Behavior

If reCAPTCHA keys are not configured:
- The system will fall back to SimpleCaptcha (math questions)
- This ensures security is maintained even without Google reCAPTCHA

## Testing

1. **With reCAPTCHA Keys**: You'll see the Google reCAPTCHA checkbox
2. **Without reCAPTCHA Keys**: You'll see a math question (e.g., "What is 3 + 8?")

## Deployment

Make sure to add the reCAPTCHA environment variables to your Vercel deployment:

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the reCAPTCHA keys
5. Redeploy your application
