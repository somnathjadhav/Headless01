# Headless Pro Plugin - reCAPTCHA Integration Guide

This guide shows you how to add reCAPTCHA endpoints to your existing Headless Pro WordPress plugin.

## Step 1: Find Your Headless Pro Plugin File

Locate your Headless Pro WordPress plugin file. It's likely in one of these locations:
- `/wp-content/plugins/headless-pro/headless-pro.php`
- `/wp-content/plugins/eternitty-headless/eternitty-headless.php`
- `/wp-content/themes/your-theme/functions.php` (if it's theme-based)

## Step 2: Add the reCAPTCHA Integration Code

Add this code to your existing Headless Pro plugin file:

```php
<?php
// Add reCAPTCHA endpoints to existing Headless Pro plugin
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
?>
```

## Step 3: Find the Correct Option Names

To find the correct option names for your WordPress admin form:

1. **Go to WordPress Admin > Headless Pro > Integrations > Google reCAPTCHA**
2. **Open browser developer tools (F12)**
3. **Inspect the form fields**
4. **Look for the `name` attribute of the input fields**

Common field name patterns:
- `eternitty_recaptcha_enabled`
- `recaptcha_enabled`
- `headless_recaptcha_enabled`
- `eternitty_recaptcha_site_key`
- `recaptcha_site_key`

## Step 4: Update the Option Names

Once you find the correct field names, update the `get_option()` calls in the code:

```php
function eternitty_get_recaptcha_settings() {
    return array(
        'enabled' => (bool) get_option('YOUR_ACTUAL_FIELD_NAME_HERE', false),
        'site_key' => get_option('YOUR_ACTUAL_SITE_KEY_FIELD_NAME', ''),
        'secret_key' => get_option('YOUR_ACTUAL_SECRET_KEY_FIELD_NAME', ''),
        'version' => get_option('YOUR_ACTUAL_VERSION_FIELD_NAME', 'v2')
    );
}
```

## Step 5: Alternative Integration Methods

### Method A: If you have access to the theme-options callback

If you can modify the existing `eternitty_theme_options` callback, add this line:

```php
// In your existing theme-options callback function
$options['recaptcha'] = eternitty_get_recaptcha_settings();
```

### Method B: If the filter doesn't work

If the `eternitty_theme_options_data` filter doesn't work, try this approach:

```php
// Override the existing theme-options endpoint
add_action('rest_api_init', function () {
    // Remove existing endpoint
    remove_action('rest_api_init', 'your_existing_theme_options_callback');
    
    // Register new endpoint with reCAPTCHA
    register_rest_route('eternitty/v1', '/theme-options', array(
        'methods' => 'GET',
        'callback' => 'eternitty_theme_options_with_recaptcha',
        'permission_callback' => '__return_true',
    ));
});

function eternitty_theme_options_with_recaptcha() {
    // Get existing theme options
    $options = your_existing_theme_options_function();
    
    // Add reCAPTCHA settings
    $options['recaptcha'] = eternitty_get_recaptcha_settings();
    
    return $options;
}
```

## Step 6: Test the Integration

After adding the code to your plugin:

1. **Test the reCAPTCHA endpoint:**
   ```bash
   curl https://woo.local/wp-json/eternitty/v1/recaptcha
   ```

2. **Expected response:**
   ```json
   {
     "enabled": true,
     "site_key": "6LelxACTAAAAAJcZVRqyHh71UMIEGN...",
     "secret_key": "6LelxACTAAAAAGG-vFI1TnRWxMZNFu...",
     "version": "v2"
   }
   ```

3. **Test the theme-options endpoint:**
   ```bash
   curl https://woo.local/wp-json/eternitty/v1/theme-options
   ```

4. **Check if reCAPTCHA is included in the response**

5. **Test the frontend:**
   ```bash
   curl http://localhost:3002/api/recaptcha/config
   ```

## Step 7: Debug if Needed

If the integration doesn't work, add this debug code temporarily:

```php
// Add this temporarily to debug
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
```

Then visit: `https://woo.local/?debug_options=1` to see all available options.

## Step 8: Update Frontend Configuration

Once the WordPress backend is working, the frontend will automatically fetch the reCAPTCHA settings. No changes needed to the frontend code.

## Current Status

✅ **Frontend Ready:** The frontend is already configured to fetch from WordPress backend  
⏳ **WordPress Backend:** Add the integration code to your Headless Pro plugin  
✅ **Documentation:** Complete integration guide provided  

## Files Created

- `headless-plugin-recaptcha-integration.php` - Full-featured integration
- `headless-plugin-simple-integration.php` - Minimal integration
- `HEADLESS_PLUGIN_INTEGRATION_GUIDE.md` - This guide

Choose the integration method that best fits your existing plugin structure!
