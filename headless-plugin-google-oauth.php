<?php
/**
 * Headless Pro Plugin - Google OAuth Integration
 * 
 * Add this code to your existing Headless Pro WordPress plugin
 * This will add Google OAuth endpoints to your existing plugin structure
 */

// Add Google OAuth endpoints to existing Headless Pro plugin
add_action('rest_api_init', function () {
    
    // 1. Google OAuth configuration endpoint
    register_rest_route('eternitty/v1', '/google-oauth', array(
        'methods' => 'GET',
        'callback' => 'eternitty_get_google_oauth_config',
        'permission_callback' => '__return_true', // Public endpoint
    ));
    
    // 2. Google OAuth callback endpoint
    register_rest_route('eternitty/v1', '/google-oauth/callback', array(
        'methods' => 'POST',
        'callback' => 'eternitty_handle_google_oauth_callback',
        'permission_callback' => '__return_true', // Public endpoint
        'args' => array(
            'code' => array(
                'required' => true,
                'type' => 'string',
                'description' => 'Authorization code from Google'
            ),
            'state' => array(
                'required' => false,
                'type' => 'string',
                'description' => 'State parameter for CSRF protection'
            )
        )
    ));
    
    // 3. Google OAuth URL generation endpoint
    register_rest_route('eternitty/v1', '/google-oauth/url', array(
        'methods' => 'GET',
        'callback' => 'eternitty_get_google_oauth_url',
        'permission_callback' => '__return_true', // Public endpoint
    ));
    
    // 4. Add Google OAuth settings to integrations endpoint
    add_filter('eternitty_integrations_data', function($integrations) {
        $integrations['google_oauth'] = eternitty_get_google_oauth_config();
        return $integrations;
    });
});

/**
 * Get Google OAuth configuration
 */
function eternitty_get_google_oauth_config() {
    // Get Google OAuth settings from WordPress options
    // Update these option names to match your WordPress admin form field names
    $enabled = get_option('eternitty_google_oauth_enabled', false);
    $client_id = get_option('eternitty_google_oauth_client_id', '');
    $client_secret = get_option('eternitty_google_oauth_client_secret', '');
    $redirect_uri = get_option('eternitty_google_oauth_redirect_uri', '');
    
    return array(
        'enabled' => (bool) $enabled,
        'client_id' => $client_id,
        'client_secret' => $client_secret,
        'redirect_uri' => $redirect_uri,
        'scope' => 'openid email profile'
    );
}

/**
 * Generate Google OAuth URL
 */
function eternitty_get_google_oauth_url() {
    $config = eternitty_get_google_oauth_config();
    
    if (!$config['enabled'] || !$config['client_id']) {
        return new WP_Error('google_oauth_not_configured', 'Google OAuth is not configured', array('status' => 400));
    }
    
    // Generate state parameter for CSRF protection
    $state = wp_generate_password(32, false);
    set_transient('google_oauth_state_' . $state, true, 600); // 10 minutes
    
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

/**
 * Handle Google OAuth callback
 */
function eternitty_handle_google_oauth_callback($request) {
    $code = $request->get_param('code');
    $state = $request->get_param('state');
    
    // Verify state parameter
    if (!$state || !get_transient('google_oauth_state_' . $state)) {
        return new WP_Error('invalid_state', 'Invalid state parameter', array('status' => 400));
    }
    
    // Delete the state transient
    delete_transient('google_oauth_state_' . $state);
    
    $config = eternitty_get_google_oauth_config();
    
    if (!$config['enabled'] || !$config['client_id'] || !$config['client_secret']) {
        return new WP_Error('google_oauth_not_configured', 'Google OAuth is not configured', array('status' => 400));
    }
    
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

/**
 * Save Google OAuth settings (admin only)
 */
add_action('rest_api_init', function () {
    register_rest_route('eternitty/v1', '/google-oauth', array(
        'methods' => 'POST',
        'callback' => 'eternitty_save_google_oauth_settings',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
        'args' => array(
            'enabled' => array(
                'required' => false,
                'type' => 'boolean',
                'default' => false
            ),
            'client_id' => array(
                'required' => false,
                'type' => 'string',
                'default' => ''
            ),
            'client_secret' => array(
                'required' => false,
                'type' => 'string',
                'default' => ''
            ),
            'redirect_uri' => array(
                'required' => false,
                'type' => 'string',
                'default' => ''
            )
        )
    ));
});

/**
 * Save Google OAuth settings
 */
function eternitty_save_google_oauth_settings($request) {
    $enabled = $request->get_param('enabled');
    $client_id = $request->get_param('client_id');
    $client_secret = $request->get_param('client_secret');
    $redirect_uri = $request->get_param('redirect_uri');
    
    // Save to WordPress options
    update_option('eternitty_google_oauth_enabled', $enabled);
    update_option('eternitty_google_oauth_client_id', $client_id);
    update_option('eternitty_google_oauth_client_secret', $client_secret);
    update_option('eternitty_google_oauth_redirect_uri', $redirect_uri);
    
    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'Google OAuth settings saved successfully',
        'data' => eternitty_get_google_oauth_config()
    ), 200);
}
?>
