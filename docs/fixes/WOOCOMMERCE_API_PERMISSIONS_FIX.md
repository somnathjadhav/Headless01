# WooCommerce API Permissions Fix

## Problem Identified
The user reported that addresses shown in the frontend are different from what's in the backend, with username "headless". Investigation revealed:

1. **WooCommerce API Permission Issue**: The API credentials don't have permission to read/write customer data
2. **Fallback Mode Active**: The system is using fallback mode instead of real WooCommerce API
3. **Data Mismatch**: Frontend shows default addresses while backend has different data

## Root Cause Analysis

### **Current State:**
- ✅ **User ID**: `1` (correct for "headless" user)
- ✅ **WordPress URL**: `http://woocommerce.local` (correct)
- ✅ **API Credentials**: Present in `.env.local`
- ❌ **API Permissions**: Insufficient permissions for customer data access

### **Error Messages:**
```
❌ UPDATE address failed: WooCommerce API error: Sorry, you are not allowed to edit this resource.
❌ WooCommerce API error: Sorry, you cannot view this resource. (401)
```

### **Current Behavior:**
- **GET addresses**: ✅ Works (using fallback mode)
- **UPDATE address**: ❌ Fails (WooCommerce API permission denied)
- **Address sync**: ✅ Works (using fallback mode)

## Solution Required

### **1. WooCommerce API Key Permissions**
The current API keys need to be configured with proper permissions:

**Required Permissions:**
- ✅ **Read** - View customer data
- ✅ **Write** - Update customer data
- ✅ **Customer Management** - Full customer access

### **2. WooCommerce API Key Configuration**
In WordPress Admin → WooCommerce → Settings → Advanced → REST API:

**Current Keys:**
```
Consumer Key: ck_609af559e29fe87aff4bf1137d0aa9b8019c40b6
Consumer Secret: cs_54eb331143c9e80a6b19e58bcf3ecf0c7dadf4cf
```

**Required Settings:**
- **Description**: "Frontend Address Management"
- **User**: Select a user with proper permissions
- **Permissions**: "Read/Write" (not just "Read")

### **3. WordPress User Permissions**
The user associated with the API key needs:
- ✅ **WooCommerce Manager** role (minimum)
- ✅ **Customer data access** permissions
- ✅ **API access** permissions

## Step-by-Step Fix

### **Step 1: Check Current API Key Permissions**
1. Go to WordPress Admin → WooCommerce → Settings → Advanced → REST API
2. Find the existing API key
3. Check if it has "Read/Write" permissions
4. Verify the associated user has proper roles

### **Step 2: Update API Key Permissions**
If permissions are insufficient:
1. Edit the existing API key
2. Change permissions to "Read/Write"
3. Ensure the user has "WooCommerce Manager" or "Administrator" role
4. Save changes

### **Step 3: Create New API Key (if needed)**
If the current key can't be updated:
1. Create a new API key
2. Set permissions to "Read/Write"
3. Associate with a user with proper permissions
4. Update `.env.local` with new credentials

### **Step 4: Test API Access**
```bash
# Test customer read access
curl -s "http://woocommerce.local/wp-json/wc/v3/customers/1" \
  -H "Authorization: Basic $(echo -n 'NEW_KEY:NEW_SECRET' | base64)" \
  -H "Content-Type: application/json"

# Should return customer data, not 401 error
```

### **Step 5: Update Environment Variables**
Update `.env.local` with new credentials:
```env
WOOCOMMERCE_CONSUMER_KEY=new_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=new_consumer_secret_here
```

### **Step 6: Restart Frontend Application**
```bash
npm run dev
```

## Alternative Solutions

### **Option 1: WordPress REST API Fallback**
If WooCommerce API can't be fixed, enhance the WordPress REST API fallback:
- ✅ Already implemented
- ✅ Works for basic operations
- ❌ Limited WooCommerce integration

### **Option 2: Custom WordPress Plugin**
Create a custom plugin with proper permissions:
- ✅ Full control over permissions
- ✅ Custom endpoints
- ❌ Requires development

### **Option 3: Direct Database Access**
Use WordPress database directly:
- ✅ Bypasses API limitations
- ❌ Not recommended for production
- ❌ Security concerns

## Testing the Fix

### **Before Fix:**
```bash
# This should fail with 401
curl -s "http://woocommerce.local/wp-json/wc/v3/customers/1" \
  -H "Authorization: Basic $(echo -n 'ck_609af559e29fe87aff4bf1137d0aa9b8019c40b6:cs_54eb331143c9e80a6b19e58bcf3ecf0c7dadf4cf' | base64)"
# Returns: {"code":"woocommerce_rest_cannot_view","message":"Sorry, you cannot view this resource.","data":{"status":401}}
```

### **After Fix:**
```bash
# This should return customer data
curl -s "http://woocommerce.local/wp-json/wc/v3/customers/1" \
  -H "Authorization: Basic $(echo -n 'NEW_KEY:NEW_SECRET' | base64)"
# Should return: {"id":1,"date_created":"...","email":"...","first_name":"...","last_name":"...","billing":{...},"shipping":{...}}
```

## Expected Results After Fix

### **Frontend Behavior:**
- ✅ **Real-time sync** with WooCommerce backend
- ✅ **Persistent changes** across page reloads
- ✅ **Accurate data** matching backend
- ✅ **No more fallback mode** messages

### **API Responses:**
- ✅ **GET addresses**: Real WooCommerce data
- ✅ **UPDATE address**: Successful updates
- ✅ **Address sync**: Real backend synchronization

### **User Experience:**
- ✅ **Consistent data** between frontend and backend
- ✅ **Reliable updates** that persist
- ✅ **No data mismatch** issues

## Files That Will Be Affected

### **Configuration:**
- ✅ `.env.local` - Update API credentials
- ✅ WooCommerce settings - Update API key permissions

### **No Code Changes Needed:**
- ✅ `src/pages/api/user/addresses.js` - Already handles both modes
- ✅ `src/hooks/useAddresses.js` - Already handles both modes
- ✅ `src/hooks/useWordPressStorage.js` - Already handles both modes

## Priority

**HIGH PRIORITY** - This affects core functionality:
- ❌ Address updates don't persist
- ❌ Data mismatch between frontend and backend
- ❌ User confusion about data accuracy

## Next Steps

1. **Immediate**: Check and fix WooCommerce API key permissions
2. **Test**: Verify API access works
3. **Update**: Environment variables if needed
4. **Verify**: Frontend-backend data synchronization

The fix is primarily a configuration issue, not a code issue. Once the WooCommerce API permissions are properly configured, the existing code will work correctly with real backend data instead of fallback mode.
