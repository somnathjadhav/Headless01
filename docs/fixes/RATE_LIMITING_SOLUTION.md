# Rate Limiting Solution for 429 Errors

## Problem
You were experiencing HTTP 429 errors when loading products, which indicates rate limiting is being triggered.

## Root Cause
The API rate limiter was set to 10 requests per minute, which is too restrictive for development and testing.

## Solution Implemented

### 1. **Enhanced Rate Limiting Configuration**
- **Development Mode**: Increased to 60 requests per minute
- **Production Mode**: Kept at 10 requests per minute
- **Window**: 1 minute rolling window

### 2. **API Retry Mechanism**
- Added automatic retry logic with exponential backoff
- Retries up to 2 times with 1-second base delay
- Only retries on 429 (rate limit) errors, not other 4xx errors

### 3. **Rate Limit Management Tools**

#### **Frontend Admin Dashboard**
- New "Rate Limiting" tab in `/frontend-admin`
- Clear rate limits button (development only)
- Real-time rate limit status display
- Troubleshooting guide

#### **Command Line Tool**
```bash
npm run clear-rate-limits
# or
node clear-rate-limits.js
```

#### **API Endpoint**
```bash
POST /api/rate-limit/clear
```
(Development mode only)

### 4. **Better Error Handling**
- Graceful 429 error handling with user-friendly messages
- Automatic retry suggestions
- Development mode indicators

## Files Modified

### Core Rate Limiting
- `src/pages/api/products/index.js` - Enhanced rate limiting with dev/prod differentiation
- `src/context/WooCommerceContext.js` - Added retry logic and better error handling
- `src/lib/rateLimiter.js` - Existing rate limiter (no changes needed)

### New Utilities
- `src/lib/apiRetry.js` - Retry mechanism with exponential backoff
- `src/lib/rateLimitHelper.js` - Development utilities for rate limiting
- `src/pages/api/rate-limit/clear.js` - API endpoint to clear rate limits

### Admin Interface
- `src/pages/frontend-admin.js` - Added rate limiting management tab

### Command Line Tools
- `clear-rate-limits.js` - CLI tool to clear rate limits
- `package.json` - Added npm script for rate limit clearing

## How to Use

### 1. **If You Get 429 Errors**
1. Wait a moment (rate limits reset every minute)
2. In development: Use the admin dashboard or CLI to clear limits
3. Check if you're making too many requests

### 2. **Clear Rate Limits (Development Only)**
```bash
# Via npm script
npm run clear-rate-limits

# Via CLI directly
node clear-rate-limits.js

# Via admin dashboard
# Go to /frontend-admin → Rate Limiting tab → Clear Rate Limits button
```

### 3. **Monitor Rate Limits**
- Visit `/frontend-admin` and go to the "Rate Limiting" tab
- See current environment, limits, and status
- Get troubleshooting tips

## Rate Limit Configuration

| Environment | Requests per Minute | Window | Notes |
|-------------|-------------------|---------|-------|
| Development | 60 | 1 minute | Can be cleared manually |
| Production | 10 | 1 minute | Standard protection |

## Best Practices

### 1. **Request Optimization**
- Use caching when possible
- Batch requests when feasible
- Implement request deduplication

### 2. **Error Handling**
- Always handle 429 errors gracefully
- Show user-friendly messages
- Implement retry logic with backoff

### 3. **Development**
- Use the rate limit clearing tools when testing
- Monitor rate limit usage in admin dashboard
- Test with realistic request patterns

## Testing the Solution

1. **Test Rate Limiting**:
   ```bash
   # Make multiple requests quickly to trigger rate limiting
   curl http://localhost:3000/api/products
   curl http://localhost:3000/api/products
   # ... repeat until you get 429
   ```

2. **Test Rate Limit Clearing**:
   ```bash
   npm run clear-rate-limits
   # Should show success message
   ```

3. **Test Admin Dashboard**:
   - Go to `http://localhost:3000/frontend-admin`
   - Click "Rate Limiting" tab
   - Use "Clear Rate Limits" button

## Production Considerations

- Rate limits are more restrictive in production (10 req/min)
- Rate limit clearing is disabled in production
- Monitor rate limit usage in production
- Consider implementing request queuing for high-traffic scenarios

## Troubleshooting

### Common Issues

1. **Still getting 429 errors**:
   - Check if you're in development mode
   - Wait for the rate limit window to reset
   - Clear rate limits using the tools provided

2. **Rate limit clearing not working**:
   - Ensure you're in development mode
   - Check that the Next.js server is running
   - Verify the API endpoint is accessible

3. **Too many requests in production**:
   - Implement request batching
   - Use caching strategies
   - Consider increasing rate limits if justified

### Debug Information

The system provides detailed logging for rate limiting:
- API request logs show rate limit status
- Admin dashboard shows current configuration
- Error messages include retry suggestions

## Conclusion

This solution provides:
- ✅ **Flexible rate limiting** (dev vs prod)
- ✅ **Automatic retry logic** with backoff
- ✅ **Easy rate limit management** via admin dashboard
- ✅ **Command line tools** for development
- ✅ **Better error handling** and user feedback
- ✅ **Production-ready** configuration

The 429 errors should now be resolved, and you have tools to manage rate limiting effectively in both development and production environments.
