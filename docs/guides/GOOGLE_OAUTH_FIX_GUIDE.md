# Google OAuth 2.0 Policy Compliance Fix Guide

## 🚨 **Current Issue: "Access blocked: authorization error"**

This error occurs when your Google OAuth app doesn't comply with Google's OAuth 2.0 policy requirements.

## 🔧 **Step-by-Step Fix**

### **1. ✅ Update Google Cloud Console OAuth Consent Screen**

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Select your project**
3. **Go to APIs & Services > OAuth consent screen**

#### **Configure OAuth Consent Screen:**
- **App name**: `Your Store Login` (or your preferred name)
- **User support email**: Your email address
- **Developer contact information**: Your email address
- **App domain**: 
  - Homepage URL: `http://localhost:3000` (for development)
  - Privacy policy URL: `https://yourdomain.com/privacy` (required for production)
  - Terms of service URL: `https://yourdomain.com/terms` (required for production)

#### **Add Authorized Domains:**
- `localhost` (for development)
- `yourdomain.com` (for production)

#### **Configure Scopes:**
- **Add these scopes only:**
  - `openid`
  - `email` 
  - `profile`
- **Remove any unnecessary scopes** that might trigger policy violations

### **2. ✅ Update OAuth 2.0 Credentials**

1. **Go to APIs & Services > Credentials**
2. **Edit your OAuth 2.0 Client ID**

#### **Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:3001
http://localhost:3002
http://localhost:3003
https://yourdomain.com
```

#### **Authorized redirect URIs:**
```
http://localhost:3000/api/google-oauth/callback
http://localhost:3001/api/google-oauth/callback
http://localhost:3002/api/google-oauth/callback
http://localhost:3003/api/google-oauth/callback
https://yourdomain.com/api/google-oauth/callback
```

### **3. ✅ Update Environment Variables**

Update your `.env.local` file:

```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your-google-client-id-here
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret-here
NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/google-oauth/callback

# WordPress Backend URL
NEXT_PUBLIC_WORDPRESS_URL=https://woo.local
WORDPRESS_URL=https://woo.local
```

### **4. ✅ Update WordPress Backend Settings**

Add these options to your WordPress database:

```php
// Enable Google OAuth
update_option('eternitty_google_oauth_enabled', true);

// Set your Google OAuth credentials
update_option('eternitty_google_oauth_client_id', 'YOUR_GOOGLE_CLIENT_ID');
update_option('eternitty_google_oauth_client_secret', 'YOUR_GOOGLE_CLIENT_SECRET');
update_option('eternitty_google_oauth_redirect_uri', 'http://localhost:3000/api/google-oauth/callback');
```

### **5. ✅ Test the Configuration**

#### **Test WordPress Backend:**
```bash
# Test Google OAuth config endpoint
curl https://woo.local/wp-json/eternitty/v1/google-oauth

# Test Google OAuth URL generation
curl https://woo.local/wp-json/eternitty/v1/google-oauth/url
```

#### **Test Frontend:**
```bash
# Test frontend Google OAuth config
curl http://localhost:3000/api/google-oauth/config

# Test frontend Google OAuth URL generation
curl http://localhost:3000/api/google-oauth/url
```

### **6. ✅ Common Issues and Solutions**

#### **Issue 1: "Invalid redirect URI"**
- **Solution**: Ensure the redirect URI in Google Console matches exactly with your environment variables
- **Check**: No trailing slashes, correct protocol (http/https)

#### **Issue 2: "Client ID not found"**
- **Solution**: Verify the client ID is correct and the project is active
- **Check**: Copy the client ID exactly from Google Console

#### **Issue 3: "Access denied"**
- **Solution**: Check that the Google+ API or Google Identity API is enabled
- **Check**: Go to APIs & Services > Library and enable the required APIs

#### **Issue 4: "State parameter mismatch"**
- **Solution**: Ensure the state parameter is properly handled in your WordPress backend
- **Check**: The state parameter should be generated and validated correctly

### **7. ✅ Production Setup**

For production deployment:

1. **Update Google Console:**
   - Add production domain to authorized domains
   - Add production redirect URI
   - Add privacy policy and terms of service URLs

2. **Update Environment Variables:**
   ```bash
   NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI=https://yourdomain.com/api/google-oauth/callback
   ```

3. **Update WordPress Options:**
   ```php
   update_option('eternitty_google_oauth_redirect_uri', 'https://yourdomain.com/api/google-oauth/callback');
   ```

### **8. ✅ Security Best Practices**

1. **Use HTTPS in production** - Google OAuth requires HTTPS for production
2. **Keep client secret secure** - Never expose it in frontend code
3. **Validate state parameter** - Always verify the state parameter for CSRF protection
4. **Set appropriate token expiration** - Configure token lifetime appropriately
5. **Use minimal scopes** - Only request the scopes you actually need

## 🎯 **Quick Fix Checklist**

- [ ] Update OAuth consent screen with proper app name and contact info
- [ ] Add privacy policy and terms of service URLs
- [ ] Configure only necessary scopes (openid, email, profile)
- [ ] Update authorized JavaScript origins with all possible localhost ports
- [ ] Update authorized redirect URIs to match your API endpoints
- [ ] Update environment variables with correct redirect URI
- [ ] Update WordPress backend settings
- [ ] Test all endpoints
- [ ] Verify the complete OAuth flow

## 🚀 **After Fixing**

Once you've completed these steps:

1. **Restart your development server**
2. **Clear browser cache and cookies**
3. **Test the Google OAuth flow**
4. **Check browser console for any remaining errors**

The Google OAuth integration should now work properly without policy compliance errors!
