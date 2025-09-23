# Address Persistence Solution

## Problem
Address changes were being wiped out after page refresh because the in-memory storage (`addressStorage` Map) was not persistent across server restarts.

## Root Cause
The previous implementation used an in-memory `Map` for storing addresses, which gets cleared when:
- Next.js server restarts
- Page refreshes
- Server deployment

## Solution Implemented

### 1. Hybrid Storage System
Created a **hybrid approach** that combines the best of both worlds:

#### **Primary: WooCommerce API Integration** (September 19th Implementation)
- **First Priority**: Try to sync with WooCommerce REST API
- **Benefits**: Real backend integration, data consistency
- **Fallback**: When WooCommerce API permissions are not configured

#### **Secondary: Persistent File Storage**
- **Fallback**: When WooCommerce API fails
- **Benefits**: Data persists across server restarts
- **Location**: `data/addresses.json`

### 2. Implementation Details

#### **File Structure**
```
data/
└── addresses.json  # Persistent storage for all user addresses
```

#### **Storage Format**
```json
{
  "1": [
    {
      "id": "billing",
      "type": "billing",
      "isDefault": false,
      "name": "Somnath Jadhav",
      "street": "B-1104, Mantra Senses, Nyati Estate Road, Handewadi",
      "city": "Pune",
      "state": "Maharashtra",
      "postcode": "412308",
      "country": "IN",
      "phone": "+919270153230",
      "company": "Eternity Web Solutions Private Limited"
    }
  ]
}
```

#### **API Flow**
1. **GET Addresses**:
   - Try WooCommerce API first
   - Fallback to persistent file storage
   - Final fallback: Create default addresses

2. **UPDATE Addresses**:
   - Try WooCommerce API first
   - Fallback to persistent file storage
   - Always save to file for persistence

### 3. Key Functions

#### **WooCommerce Integration** (Restored from September 19th)
```javascript
// Get addresses from WooCommerce API
async function getWooCommerceAddresses(userId)

// Update address in WooCommerce API  
async function updateWooCommerceAddress(userId, addressData)
```

#### **Persistent Storage**
```javascript
// Load addresses from file
function loadAddressesFromFile()

// Save addresses to file
function saveAddressesToFile(addresses)

// Get addresses from storage (with WordPress fallback)
async function getWordPressAddresses(userId)

// Save addresses to storage (with WordPress fallback)
async function saveWordPressAddresses(userId, addresses)
```

### 4. Benefits

#### **Immediate Benefits**
- ✅ **Addresses persist across page refreshes**
- ✅ **Addresses persist across server restarts**
- ✅ **No data loss during development**
- ✅ **Backward compatible with existing code**

#### **Future Benefits**
- ✅ **Ready for WooCommerce API when permissions are fixed**
- ✅ **Automatic fallback system**
- ✅ **Data migration path available**

### 5. Testing Results

#### **Before Fix**
```
❌ Address changes lost after refresh
❌ In-memory storage cleared on restart
❌ No persistence mechanism
```

#### **After Fix**
```
✅ Addresses persist across refreshes
✅ File-based storage survives restarts
✅ Hybrid system with WooCommerce fallback
✅ All tests passing
```

### 6. Configuration

#### **Environment Variables Required**
```bash
# WooCommerce API (for primary sync)
WOOCOMMERCE_CONSUMER_KEY=ck_...
WOOCOMMERCE_CONSUMER_SECRET=cs_...
NEXT_PUBLIC_WORDPRESS_URL=http://woocommerce.local
```

#### **File Permissions**
- `data/` directory created automatically
- `data/addresses.json` created automatically
- Added to `.gitignore` to prevent committing user data

### 7. Migration Path

#### **When WooCommerce API Permissions Are Fixed**
1. The system will automatically start using WooCommerce API
2. Existing file data can be migrated to WooCommerce
3. No code changes required

#### **Current Status**
- **WooCommerce API**: ❌ Permission issues (401 Unauthorized)
- **File Storage**: ✅ Working perfectly
- **Hybrid System**: ✅ Ready for both scenarios

### 8. Troubleshooting

#### **If Addresses Still Don't Persist**
1. Check file permissions on `data/` directory
2. Verify `data/addresses.json` exists and is writable
3. Check server logs for file system errors

#### **If WooCommerce API Fails**
1. Run `node diagnose-woocommerce-api.js` to check permissions
2. Verify API credentials in `.env.local`
3. Check WordPress admin for API key permissions

### 9. Future Improvements

#### **Database Integration**
- Replace file storage with proper database
- Add data validation and backup
- Implement data migration tools

#### **Real-time Sync**
- Add webhook support for real-time updates
- Implement conflict resolution
- Add data synchronization status

## Summary

The address persistence issue has been **completely resolved** with a robust hybrid system that:

1. **Tries WooCommerce API first** (like the September 19th implementation)
2. **Falls back to persistent file storage** when API fails
3. **Ensures data never gets lost** across refreshes or restarts
4. **Provides a migration path** for when WooCommerce permissions are fixed

**Result**: Addresses now persist perfectly across page refreshes and server restarts! 🎉
