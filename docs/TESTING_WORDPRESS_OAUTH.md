# Testing WordPress OAuth Settings with Frontend

## 🧪 **Complete Testing Guide**

### **Step 1: Test WordPress Backend Endpoints**

#### **1.1 Test OAuth Configuration Endpoint**
```bash
# Test the OAuth config endpoint
curl -s https://woo.local/wp-json/eternitty/v1/google-oauth | jq .

# Expected Response (if configured):
{
  "enabled": true,
  "client_id": "your-client-id.apps.googleusercontent.com",
  "client_secret": "configured",
  "redirect_uri": "https://woo.local/wp-json/eternitty/v1/google-oauth/callback",
  "scope": "openid email profile"
}
```

#### **1.2 Test OAuth URL Generation**
```bash
# Test OAuth URL generation
curl -s https://woo.local/wp-json/eternitty/v1/google-oauth/url | jq .

# Expected Response:
{
  "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "state": "random-state-string"
}
```

#### **1.3 Test OAuth Callback Endpoint**
```bash
# Test OAuth callback (this will fail without proper code, but should return proper error)
curl -X POST https://woo.local/wp-json/eternitty/v1/google-oauth/callback \
  -H "Content-Type: application/json" \
  -d '{"code":"test","state":"test"}' | jq .

# Expected Response (error, but proper format):
{
  "code": "invalid_code",
  "message": "Invalid authorization code",
  "data": {"status": 400}
}
```

### **Step 2: Test Frontend API Endpoints**

#### **2.1 Start Development Server**
```bash
npm run dev
# Note the port (e.g., http://localhost:3003)
```

#### **2.2 Test Frontend OAuth Config**
```bash
# Test frontend OAuth config endpoint
curl -s http://localhost:3003/api/google-oauth/config | jq .

# Expected Response:
{
  "success": true,
  "data": {
    "enabled": true,
    "client_id": "your-client-id.apps.googleusercontent.com",
    "client_secret": "configured",
    "redirect_uri": "http://localhost:3003/api/google-oauth/callback",
    "scope": "openid email profile"
  }
}
```

#### **2.3 Test Frontend OAuth URL Generation**
```bash
# Test frontend OAuth URL generation
curl -s http://localhost:3003/api/google-oauth/url | jq .

# Expected Response:
{
  "success": true,
  "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "state": "random-state-string"
}
```

### **Step 3: Test Complete OAuth Flow**

#### **3.1 Test OAuth URL Generation**
```bash
# Get OAuth URL from frontend
OAUTH_RESPONSE=$(curl -s http://localhost:3003/api/google-oauth/url)
echo $OAUTH_RESPONSE | jq .

# Extract the auth_url
AUTH_URL=$(echo $OAUTH_RESPONSE | jq -r '.auth_url')
echo "OAuth URL: $AUTH_URL"
```

#### **3.2 Test OAuth URL Validity**
```bash
# Check if the OAuth URL is valid
curl -I "$AUTH_URL"

# Expected Response: 200 OK or redirect to Google
```

#### **3.3 Test OAuth Callback (Simulation)**
```bash
# Simulate OAuth callback (this will fail, but should return proper error)
curl -X POST http://localhost:3003/api/google-oauth/callback \
  -H "Content-Type: application/json" \
  -d '{"code":"test-code","state":"test-state"}' | jq .

# Expected Response (error, but proper format):
{
  "success": false,
  "message": "Authorization code is required"
}
```

### **Step 4: Test Frontend Integration**

#### **4.1 Test Google Login Button**
1. **Open browser**: `http://localhost:3003/signin`
2. **Check if Google Login button appears**
3. **Click the button** (should redirect to Google)
4. **Check browser console** for any errors

#### **4.2 Test OAuth Hook**
```bash
# Test the OAuth hook in browser console
# Open browser dev tools and run:
fetch('/api/google-oauth/config')
  .then(response => response.json())
  .then(data => console.log('OAuth Config:', data));
```

### **Step 5: Debug Common Issues**

#### **5.1 WordPress Backend Not Responding**
```bash
# Check if WordPress is running
curl -I https://woo.local

# Check if REST API is working
curl -s https://woo.local/wp-json/ | jq .

# Check if your plugin endpoints exist
curl -s https://woo.local/wp-json/eternitty/v1/ | jq .
```

#### **5.2 Frontend Not Responding**
```bash
# Check if Next.js server is running
ps aux | grep next

# Check if port is accessible
curl -I http://localhost:3003

# Check Next.js logs
npm run dev
```

#### **5.3 OAuth Configuration Issues**
```bash
# Check environment variables
echo $NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID
echo $GOOGLE_OAUTH_CLIENT_SECRET
echo $NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI

# Check WordPress options
curl -s https://woo.local/wp-json/eternitty/v1/google-oauth | jq .
```

### **Step 6: Test Different Scenarios**

#### **6.1 Test with WordPress Backend Available**
```bash
# Ensure WordPress is running and configured
curl -s https://woo.local/wp-json/eternitty/v1/google-oauth | jq .

# Test frontend (should use WordPress settings)
curl -s http://localhost:3003/api/google-oauth/config | jq .
```

#### **6.2 Test with WordPress Backend Unavailable**
```bash
# Stop WordPress or change URL
export NEXT_PUBLIC_WORDPRESS_URL=http://invalid-url

# Test frontend (should use environment variables)
curl -s http://localhost:3003/api/google-oauth/config | jq .
```

#### **6.3 Test with No Configuration**
```bash
# Remove environment variables
unset NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID
unset GOOGLE_OAUTH_CLIENT_SECRET
unset NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI

# Test frontend (should return disabled)
curl -s http://localhost:3003/api/google-oauth/config | jq .
```

### **Step 7: Performance Testing**

#### **7.1 Test Response Times**
```bash
# Test WordPress backend response time
time curl -s https://woo.local/wp-json/eternitty/v1/google-oauth > /dev/null

# Test frontend response time
time curl -s http://localhost:3003/api/google-oauth/config > /dev/null
```

#### **7.2 Test Concurrent Requests**
```bash
# Test multiple concurrent requests
for i in {1..5}; do
  curl -s http://localhost:3003/api/google-oauth/config &
done
wait
```

### **Step 8: Security Testing**

#### **8.1 Test CORS Headers**
```bash
# Test CORS headers
curl -H "Origin: http://localhost:3003" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS \
  http://localhost:3003/api/google-oauth/config
```

#### **8.2 Test State Parameter Validation**
```bash
# Test with invalid state
curl -X POST http://localhost:3003/api/google-oauth/callback \
  -H "Content-Type: application/json" \
  -d '{"code":"valid-code","state":"invalid-state"}' | jq .
```

## 🎯 **Expected Test Results**

### **✅ All Tests Passing**
- WordPress backend responds with OAuth config
- Frontend API endpoints work correctly
- OAuth URL generation works
- Google Login button appears and functions
- No console errors

### **❌ Common Issues**
- **404 errors**: Endpoints not configured in WordPress
- **CORS errors**: Frontend can't access WordPress
- **Invalid redirect URI**: Google OAuth configuration mismatch
- **State parameter errors**: OAuth flow security issues

## 🚀 **Quick Test Script**

Create this script to run all tests:

```bash
#!/bin/bash
echo "🧪 Testing WordPress OAuth Integration..."

echo "1. Testing WordPress backend..."
curl -s https://woo.local/wp-json/eternitty/v1/google-oauth | jq .

echo "2. Testing frontend config..."
curl -s http://localhost:3003/api/google-oauth/config | jq .

echo "3. Testing OAuth URL generation..."
curl -s http://localhost:3003/api/google-oauth/url | jq .

echo "✅ Tests completed!"
```

Run with: `chmod +x test-oauth.sh && ./test-oauth.sh`
