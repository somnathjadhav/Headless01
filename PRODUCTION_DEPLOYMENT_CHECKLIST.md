# 🚀 Production Deployment Security Checklist

## 🔒 **Critical Security Tasks Before Going Live**

### **1. SSL Certificate Configuration**
- [ ] **Remove SSL bypass for production**
  - Current: SSL bypass only works in development with `woo.local`
  - Production: SSL verification automatically enabled
  - ✅ **Status**: Environment-aware SSL configuration implemented

### **2. Environment Variables**
- [ ] **Set production environment variables**:
  ```bash
  NODE_ENV=production
  NEXT_PUBLIC_WORDPRESS_URL=https://your-production-domain.com
  WOOCOMMERCE_CONSUMER_KEY=your_production_key
  WOOCOMMERCE_CONSUMER_SECRET=your_production_secret
  ```

### **3. API Key Security**
- [ ] **Generate new WooCommerce API keys for production**
- [ ] **Use read-only keys where possible**
- [ ] **Never expose API keys in client-side code**
- [ ] **Store keys securely (environment variables, not in code)**

### **4. WordPress Backend Security**
- [ ] **Install SSL certificate on WordPress backend**
- [ ] **Update WordPress to latest version**
- [ ] **Install security plugins**
- [ ] **Configure proper file permissions**

### **5. Domain Configuration**
- [ ] **Update WordPress URL from `woo.local` to production domain**
- [ ] **Configure CORS settings**
- [ ] **Update CSP headers in `next.config.js` if needed**

## 🛡️ **Security Features Already Implemented**

### ✅ **Completed Security Measures**:
- **Security Headers**: CSP, XSS Protection, HSTS
- **Input Validation**: All user inputs validated and sanitized
- **Rate Limiting**: API endpoints protected against abuse
- **Error Handling**: Secure error messages, no information disclosure
- **SSL Configuration**: Environment-aware SSL handling

## 🔧 **Deployment Steps**

### **Step 1: Environment Setup**
```bash
# Set production environment
export NODE_ENV=production

# Update WordPress URL
export NEXT_PUBLIC_WORDPRESS_URL=https://your-domain.com
```

### **Step 2: Build and Deploy**
```bash
# Build for production
npm run build

# Start production server
npm start
```

### **Step 3: Verify Security**
```bash
# Check SSL configuration
curl -I https://your-domain.com

# Verify security headers
curl -I https://your-domain.com | grep -E "(X-Frame-Options|X-Content-Type-Options|Content-Security-Policy)"
```

## ⚠️ **Important Notes**

### **Local Development (Current Setup)**:
- ✅ SSL bypass works only with `woo.local` in development
- ✅ Automatic warnings when SSL is disabled
- ✅ Safe for local development only

### **Production Deployment**:
- ✅ SSL verification automatically enabled
- ✅ No SSL bypass possible in production
- ✅ Security headers enforced
- ✅ Rate limiting active

## 🚨 **Critical Warnings**

1. **Never deploy with `NODE_ENV=development` to production**
2. **Never use `woo.local` URLs in production**
3. **Always use HTTPS in production**
4. **Never expose API keys in client-side code**

## 📋 **Post-Deployment Verification**

- [ ] SSL certificate working properly
- [ ] All API endpoints responding correctly
- [ ] Security headers present
- [ ] Rate limiting functional
- [ ] No console errors or warnings
- [ ] WordPress backend accessible via HTTPS

## 🔄 **Rollback Plan**

If issues occur:
1. Revert to previous deployment
2. Check environment variables
3. Verify WordPress backend accessibility
4. Test SSL configuration

---

**✅ This checklist ensures secure production deployment while maintaining local development functionality.**

