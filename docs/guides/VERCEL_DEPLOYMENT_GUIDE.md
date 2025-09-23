# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Prepare your production environment variables

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Add wishlist authentication and prepare for deployment"
git push origin main
```

### 1.2 Verify Build Locally
```bash
npm run build
npm run start
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import Your Repository**
   - Connect your GitHub account
   - Select your repository
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow the prompts**
   - Link to existing project or create new
   - Set up environment variables
   - Deploy

## Step 3: Configure Environment Variables

### Required Environment Variables

In your Vercel dashboard, go to **Settings > Environment Variables** and add:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com/headless-woo
WORDPRESS_URL=https://your-wordpress-site.com/headless-woo

# WooCommerce API
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret_here

# Security
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-vercel-app.vercel.app

# reCAPTCHA (if using)
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Email Configuration (if using)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@yourdomain.com

# Performance
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Environment Variable Setup

1. **Go to Project Settings**
   - In Vercel dashboard, select your project
   - Go to "Settings" tab
   - Click "Environment Variables"

2. **Add Variables**
   - Add each variable with its value
   - Set environment to "Production" (or "All" for all environments)
   - Click "Save"

3. **Redeploy**
   - After adding environment variables, redeploy your project
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment

## Step 4: Configure Custom Domain (Optional)

1. **Add Domain**
   - Go to "Settings" > "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **SSL Certificate**
   - Vercel automatically provides SSL certificates
   - No additional configuration needed

## Step 5: Configure WordPress Backend

### Update WordPress Configuration

1. **Update CORS Settings**
   - In your WordPress backend, update CORS to allow your Vercel domain
   - Add your Vercel app URL to allowed origins

2. **Update API Endpoints**
   - Ensure your WordPress REST API is accessible
   - Test API endpoints from your Vercel deployment

## Step 6: Test Your Deployment

### 1. Basic Functionality Test
- Visit your Vercel app URL
- Test product browsing
- Test wishlist functionality (requires authentication)
- Test cart functionality
- Test user authentication

### 2. API Integration Test
- Test WordPress API connectivity
- Test WooCommerce API calls
- Test authentication endpoints

### 3. Performance Test
- Check page load times
- Test on mobile devices
- Verify image optimization

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Redeploy after adding variables

3. **API Connectivity**
   - Verify WordPress backend is accessible
   - Check CORS configuration
   - Test API endpoints directly

4. **Authentication Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain
   - Ensure OAuth configuration is correct

### Debug Commands

```bash
# Check build locally
npm run build

# Test production build
npm run start

# Check environment variables
vercel env ls

# View deployment logs
vercel logs [deployment-url]
```

## Performance Optimization

### 1. Enable Vercel Analytics
- Go to "Analytics" tab in Vercel dashboard
- Enable Web Analytics
- Monitor Core Web Vitals

### 2. Configure Edge Functions
- Use Vercel Edge Functions for API routes
- Optimize for global performance

### 3. Image Optimization
- Vercel automatically optimizes Next.js images
- Ensure images are in supported formats

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to repository
   - Use Vercel's environment variable system
   - Rotate secrets regularly

2. **API Security**
   - Use HTTPS for all API calls
   - Implement rate limiting
   - Validate all inputs

3. **Authentication**
   - Use secure session management
   - Implement proper CORS policies
   - Use secure cookies

## Monitoring and Maintenance

### 1. Set Up Monitoring
- Enable Vercel Analytics
- Set up error tracking (Sentry)
- Monitor API response times

### 2. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Test deployments in staging

### 3. Backup Strategy
- Regular database backups
- Code repository backups
- Environment variable documentation

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)
