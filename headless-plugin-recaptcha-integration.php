<?php
/**
 * Headless Pro Plugin - reCAPTCHA Integration
 * 
 * Add this code to your existing Headless Pro WordPress plugin
 * This will add reCAPTCHA endpoints to your existing plugin structure
 */

// Add reCAPTCHA endpoints to existing Headless Pro plugin
add_action('rest_api_init', function () {
    
    // 1. Add reCAPTCHA settings to existing theme-options endpoint
    add_filter('eternitty_theme_options_data', function($options) {
        // Get reCAPTCHA settings from WordPress options
        // Adjust these option names to match your WordPress admin form field names
        $recaptcha_enabled = get_option('eternitty_recaptcha_enabled', false);
        $recaptcha_site_key = get_option('eternitty_recaptcha_site_key', '');
        $recaptcha_secret_key = get_option('eternitty_recaptcha_secret_key', '');
        $recaptcha_version = get_option('eternitty_recaptcha_version', 'v2');
        
        // Add reCAPTCHA settings to theme options
        $options['recaptcha'] = array(
            'enabled' => (bool) $recaptcha_enabled,
            'site_key' => $recaptcha_site_key,
            'secret_key' => $recaptcha_secret_key,
            'version' => $recaptcha_version
        );
        
        return $options;
    });
    
    // 2. Create dedicated reCAPTCHA endpoint
    register_rest_route('eternitty/v1', '/recaptcha', array(
        'methods' => 'GET',
        'callback' => 'eternitty_get_recaptcha_settings',
        'permission_callback' => '__return_true', // Public endpoint
    ));
    
    // 3. Create integrations endpoint (includes reCAPTCHA and other integrations)
    register_rest_route('eternitty/v1', '/integrations', array(
        'methods' => 'GET',
        'callback' => 'eternitty_get_all_integrations',
        'permission_callback' => '__return_true', // Public endpoint
    ));
    
    // 4. Optional: Create endpoint to save reCAPTCHA settings (admin only)
    register_rest_route('eternitty/v1', '/recaptcha', array(
        'methods' => 'POST',
        'callback' => 'eternitty_save_recaptcha_settings',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
        'args' => array(
            'enabled' => array(
                'required' => false,
                'type' => 'boolean',
                'default' => false
            ),
            'site_key' => array(
                'required' => false,
                'type' => 'string',
                'default' => ''
            ),
            'secret_key' => array(
                'required' => false,
                'type' => 'string',
                'default' => ''
            ),
            'version' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'v2'
            )
        )
    ));
});

/**
 * Get reCAPTCHA settings
 */
function eternitty_get_recaptcha_settings() {
    // Get reCAPTCHA settings from WordPress options
    // Update these option names to match your WordPress admin form field names
    $enabled = get_option('eternitty_recaptcha_enabled', false);
    $site_key = get_option('eternitty_recaptcha_site_key', '');
    $secret_key = get_option('eternitty_recaptcha_secret_key', '');
    $version = get_option('eternitty_recaptcha_version', 'v2');
    
    return array(
        'enabled' => (bool) $enabled,
        'site_key' => $site_key,
        'secret_key' => $secret_key,
        'version' => $version
    );
}

/**
 * Get all integrations settings
 */
function eternitty_get_all_integrations() {
    return array(
        'recaptcha' => eternitty_get_recaptcha_settings(),
        'analytics' => array(
            'google_analytics_id' => get_option('eternitty_google_analytics_id', ''),
            'google_tag_manager_id' => get_option('eternitty_google_tag_manager_id', ''),
            'meta_pixel_id' => get_option('eternitty_meta_pixel_id', '')
        ),
        'custom_js' => array(
            'enabled' => (bool) get_option('eternitty_custom_js_enabled', false),
            'code' => get_option('eternitty_custom_js_code', '')
        )
    );
}

/**
 * Save reCAPTCHA settings (admin only)
 */
function eternitty_save_recaptcha_settings($request) {
    $enabled = $request->get_param('enabled');
    $site_key = $request->get_param('site_key');
    $secret_key = $request->get_param('secret_key');
    $version = $request->get_param('version');
    
    // Save to WordPress options
    update_option('eternitty_recaptcha_enabled', $enabled);
    update_option('eternitty_recaptcha_site_key', $site_key);
    update_option('eternitty_recaptcha_secret_key', $secret_key);
    update_option('eternitty_recaptcha_version', $version);
    
    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'reCAPTCHA settings saved successfully',
        'data' => eternitty_get_recaptcha_settings()
    ), 200);
}

/**
 * Alternative: If your plugin uses a different filter name for theme options
 * Uncomment and modify this section if the above filter doesn't work
 */
/*
add_filter('your_theme_options_filter_name', function($options) {
    $options['recaptcha'] = eternitty_get_recaptcha_settings();
    return $options;
});
*/

/**
 * Debug function to check what option names are being used
 * Add this temporarily to see what options are available
 */
function eternitty_debug_options() {
    if (current_user_can('manage_options') && isset($_GET['debug_options'])) {
        echo '<pre>';
        echo "Available options with 'eternitty' prefix:\n";
        global $wpdb;
        $options = $wpdb->get_results("SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE 'eternitty_%'");
        foreach ($options as $option) {
            echo $option->option_name . ' = ' . $option->option_value . "\n";
        }
        echo '</pre>';
        exit;
    }
}
add_action('init', 'eternitty_debug_options');
?>
