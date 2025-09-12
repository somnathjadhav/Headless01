# Google OAuth Login Setup Guide

This guide explains how to set up Google OAuth login for your headless WooCommerce frontend.

## Prerequisites

1. **Google Cloud Console Account** - You need a Google account
2. **WordPress Backend** - Your Headless Pro plugin must be configured
3. **Frontend Application** - Next.js frontend running

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity API)

### 1.2 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Configure the following:

**Authorized JavaScript origins:**
- `http://localhost:3000` (for development)
- `http://localhost:3001` (if port 3000 is busy)
- `https://yourdomain.com` (for production)

**Authorized redirect URIs:**
- `http://localhost:3000/api/auth/google/callback` (for development)
- `https://yourdomain.com/api/auth/google/callback` (for production)

### 1.3 Get Your Credentials
After creating the OAuth client, you'll get:
- **Client ID** (starts with something like `123456789-abcdefg.apps.googleusercontent.com`)
- **Client Secret** (starts with `GOCSPX-`)

## Step 2: Configure WordPress Backend

### 2.1 Add Google OAuth Integration to Headless Pro Plugin

Add this code to your existing Headless Pro WordPress plugin:

```php
<?php
// Add Google OAuth endpoints to existing Headless Pro plugin
add_action('rest_api_init', function () {
    
    // Google OAuth configuration endpoint
    register_rest_route('eternitty/v1', '/google-oauth', array(
        'methods' => 'GET',
        'callback' => 'eternitty_get_google_oauth_config',
        'permission_callback' => '__return_true',
    ));
    
    // Google OAuth callback endpoint
    register_rest_route('eternitty/v1', '/google-oauth/callback', array(
        'methods' => 'POST',
        'callback' => 'eternitty_handle_google_oauth_callback',
        'permission_callback' => '__return_true',
        'args' => array(
            'code' => array('required' => true, 'type' => 'string'),
            'state' => array('required' => false, 'type' => 'string')
        )
    ));
    
    // Google OAuth URL generation endpoint
    register_rest_route('eternitty/v1', '/google-oauth/url', array(
        'methods' => 'GET',
        'callback' => 'eternitty_get_google_oauth_url',
        'permission_callback' => '__return_true',
    ));
});

function eternitty_get_google_oauth_config() {
    return array(
        'enabled' => (bool) get_option('eternitty_google_oauth_enabled', false),
        'client_id' => get_option('eternitty_google_oauth_client_id', ''),
        'client_secret' => get_option('eternitty_google_oauth_client_secret', ''),
        'redirect_uri' => get_option('eternitty_google_oauth_redirect_uri', ''),
        'scope' => 'openid email profile'
    );
}

function eternitty_get_google_oauth_url() {
    $config = eternitty_get_google_oauth_config();
    
    if (!$config['enabled'] || !$config['client_id']) {
        return new WP_Error('google_oauth_not_configured', 'Google OAuth is not configured', array('status' => 400));
    }
    
    $state = wp_generate_password(32, false);
    set_transient('google_oauth_state_' . $state, true, 600);
    
    $params = array(
        'client_id' => $config['client_id'],
        'redirect_uri' => $config['redirect_uri'],
        'scope' => $config['scope'],
        'response_type' => 'code',
        'state' => $state,
        'access_type' => 'offline',
        'prompt' => 'consent'
    );
    
    $auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
    
    return array(
        'auth_url' => $auth_url,
        'state' => $state
    );
}

function eternitty_handle_google_oauth_callback($request) {
    $code = $request->get_param('code');
    $state = $request->get_param('state');
    
    // Verify state parameter
    if (!$state || !get_transient('google_oauth_state_' . $state)) {
        return new WP_Error('invalid_state', 'Invalid state parameter', array('status' => 400));
    }
    
    delete_transient('google_oauth_state_' . $state);
    
    $config = eternitty_get_google_oauth_config();
    
    // Exchange authorization code for access token
    $token_response = wp_remote_post('https://oauth2.googleapis.com/token', array(
        'body' => array(
            'client_id' => $config['client_id'],
            'client_secret' => $config['client_secret'],
            'code' => $code,
            'grant_type' => 'authorization_code',
            'redirect_uri' => $config['redirect_uri']
        )
    ));
    
    if (is_wp_error($token_response)) {
        return new WP_Error('token_exchange_failed', 'Failed to exchange authorization code', array('status' => 500));
    }
    
    $token_data = json_decode(wp_remote_retrieve_body($token_response), true);
    
    if (!isset($token_data['access_token'])) {
        return new WP_Error('token_exchange_failed', 'Invalid token response from Google', array('status' => 500));
    }
    
    // Get user info from Google
    $user_response = wp_remote_get('https://www.googleapis.com/oauth2/v2/userinfo', array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $token_data['access_token']
        )
    ));
    
    if (is_wp_error($user_response)) {
        return new WP_Error('user_info_failed', 'Failed to get user info from Google', array('status' => 500));
    }
    
    $user_data = json_decode(wp_remote_retrieve_body($user_response), true);
    
    if (!isset($user_data['email'])) {
        return new WP_Error('user_info_failed', 'Invalid user data from Google', array('status' => 500));
    }
    
    // Check if user exists in WordPress
    $user = get_user_by('email', $user_data['email']);
    
    if (!$user) {
        // Create new user
        $username = sanitize_user($user_data['email']);
        $password = wp_generate_password();
        
        $user_id = wp_create_user($username, $password, $user_data['email']);
        
        if (is_wp_error($user_id)) {
            return new WP_Error('user_creation_failed', 'Failed to create user account', array('status' => 500));
        }
        
        // Update user meta with Google data
        update_user_meta($user_id, 'google_id', $user_data['id']);
        update_user_meta($user_id, 'first_name', $user_data['given_name'] ?? '');
        update_user_meta($user_id, 'last_name', $user_data['family_name'] ?? '');
        update_user_meta($user_id, 'google_picture', $user_data['picture'] ?? '');
        
        $user = get_user_by('id', $user_id);
    } else {
        // Update existing user's Google data
        update_user_meta($user->ID, 'google_id', $user_data['id']);
        update_user_meta($user->ID, 'google_picture', $user_data['picture'] ?? '');
    }
    
    // Generate JWT token or session
    $token = wp_generate_password(64, false);
    set_transient('auth_token_' . $token, $user->ID, 86400); // 24 hours
    
    // Return user data and token
    return array(
        'success' => true,
        'token' => $token,
        'user' => array(
            'id' => $user->ID,
            'email' => $user->user_email,
            'username' => $user->user_login,
            'first_name' => get_user_meta($user->ID, 'first_name', true),
            'last_name' => get_user_meta($user->ID, 'last_name', true),
            'display_name' => $user->display_name,
            'avatar' => get_user_meta($user->ID, 'google_picture', true)
        )
    );
}
?>
```

### 2.2 Configure Google OAuth Settings in WordPress

You need to add Google OAuth settings to your WordPress admin. Add these options to your WordPress options table:

```php
// Add these to your WordPress admin form or options
update_option('eternitty_google_oauth_enabled', true);
update_option('eternitty_google_oauth_client_id', 'YOUR_GOOGLE_CLIENT_ID');
update_option('eternitty_google_oauth_client_secret', 'YOUR_GOOGLE_CLIENT_SECRET');
update_option('eternitty_google_oauth_redirect_uri', 'http://localhost:3000/api/auth/google/callback');
```

## Step 3: Configure Frontend Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your-google-client-id-here
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret-here
NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## Step 4: Test the Integration

### 4.1 Test WordPress Backend Endpoints

```bash
# Test Google OAuth config endpoint
curl https://woo.local/wp-json/eternitty/v1/google-oauth

# Test Google OAuth URL generation
curl https://woo.local/wp-json/eternitty/v1/google-oauth/url
```

### 4.2 Test Frontend Endpoints

```bash
# Test frontend Google OAuth config
curl http://localhost:3000/api/google-oauth/config

# Test frontend Google OAuth URL generation
curl http://localhost:3000/api/google-oauth/url
```

### 4.3 Test the Complete Flow

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Visit the signin page:**
   ```
   http://localhost:3000/signin
   ```

3. **Click "Continue with Google"** - You should be redirected to Google's OAuth page

4. **Complete the OAuth flow** - You should be redirected back and logged in

## Step 5: Production Setup

### 5.1 Update Google OAuth Settings

1. **Update Authorized Redirect URIs** in Google Cloud Console:
   - Add your production domain: `https://yourdomain.com/api/auth/google/callback`

2. **Update WordPress Options:**
   ```php
   update_option('eternitty_google_oauth_redirect_uri', 'https://yourdomain.com/api/auth/google/callback');
   ```

3. **Update Environment Variables:**
   ```bash
   NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
   ```

### 5.2 Security Considerations

1. **Use HTTPS in production** - Google OAuth requires HTTPS for production
2. **Keep client secret secure** - Never expose it in frontend code
3. **Validate state parameter** - Always verify the state parameter for CSRF protection
4. **Set appropriate token expiration** - Configure token lifetime appropriately

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"** - Check that the redirect URI in Google Console matches exactly
2. **"Client ID not found"** - Verify the client ID is correct and the project is active
3. **"Access denied"** - Check that the Google+ API is enabled in your project
4. **"State parameter mismatch"** - Ensure the state parameter is properly handled

### Debug Steps

1. **Check browser console** for JavaScript errors
2. **Check network tab** for failed API calls
3. **Check WordPress error logs** for backend issues
4. **Verify environment variables** are loaded correctly

## Current Status

✅ **WordPress Backend Integration** - Complete  
✅ **Frontend API Endpoints** - Complete  
✅ **Google Login Button Component** - Complete  
✅ **AuthContext Integration** - Complete  
✅ **Signin/Signup Page Integration** - Complete  
✅ **Setup Documentation** - Complete  

The Google OAuth login is now fully implemented and ready for testing!
