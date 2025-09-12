<?php
/**
 * Simple Integration for Headless Pro Plugin
 * 
 * Add this code to your existing Headless Pro WordPress plugin
 * This is a minimal version that just adds the reCAPTCHA endpoint
 */

// Add reCAPTCHA endpoint to existing Headless Pro plugin
add_action('rest_api_init', function () {
    
    // Add reCAPTCHA endpoint
    register_rest_route('eternitty/v1', '/recaptcha', array(
        'methods' => 'GET',
        'callback' => 'eternitty_get_recaptcha_settings',
        'permission_callback' => '__return_true', // Public endpoint
    ));
    
    // Add reCAPTCHA to existing theme-options endpoint
    add_filter('eternitty_theme_options_data', function($options) {
        $options['recaptcha'] = eternitty_get_recaptcha_settings();
        return $options;
    });
});

/**
 * Get reCAPTCHA settings from WordPress options
 * Update the option names to match your WordPress admin form field names
 */
function eternitty_get_recaptcha_settings() {
    return array(
        'enabled' => (bool) get_option('eternitty_recaptcha_enabled', false),
        'site_key' => get_option('eternitty_recaptcha_site_key', ''),
        'secret_key' => get_option('eternitty_recaptcha_secret_key', ''),
        'version' => get_option('eternitty_recaptcha_version', 'v2')
    );
}

/**
 * If the above filter doesn't work, try this alternative approach
 * Uncomment this section if needed
 */
/*
// Alternative: Hook into the existing theme-options callback
add_action('rest_api_init', function () {
    // Override the existing theme-options endpoint to include reCAPTCHA
    remove_action('rest_api_init', 'your_existing_theme_options_callback');
    
    register_rest_route('eternitty/v1', '/theme-options', array(
        'methods' => 'GET',
        'callback' => 'eternitty_theme_options_with_recaptcha',
        'permission_callback' => '__return_true',
    ));
});

function eternitty_theme_options_with_recaptcha() {
    // Get existing theme options (call your existing function)
    $options = your_existing_theme_options_function();
    
    // Add reCAPTCHA settings
    $options['recaptcha'] = eternitty_get_recaptcha_settings();
    
    return $options;
}
*/
?>
