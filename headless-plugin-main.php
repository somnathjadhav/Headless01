<?php
/**
 * Headless Pro Plugin - Main Plugin File
 * 
 * This is the main WordPress plugin file that handles theme options and default settings
 * Add this to your WordPress plugins directory or include it in your existing plugin
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Plugin Name: Headless Pro
 * Description: WordPress backend for headless frontend with theme options, typography, and integrations
 * Version: 1.0.0
 * Author: Eternitty
 */

// Register theme options endpoint
add_action('rest_api_init', function () {
    
    // Main theme options endpoint
    register_rest_route('eternitty/v1', '/theme-options', array(
        'methods' => 'GET',
        'callback' => 'eternitty_get_theme_options',
        'permission_callback' => '__return_true', // Public endpoint
    ));
    
    // Header and footer settings endpoint
    register_rest_route('eternitty/v1', '/header-footer', array(
        'methods' => 'GET',
        'callback' => 'eternitty_get_header_footer',
        'permission_callback' => '__return_true',
    ));
    
    // Site info endpoint
    register_rest_route('eternitty/v1', '/site-info', array(
        'methods' => 'GET',
        'callback' => 'eternitty_get_site_info',
        'permission_callback' => '__return_true',
    ));
    
    // Menu endpoint
    register_rest_route('eternitty/v1', '/menus', array(
        'methods' => 'GET',
        'callback' => 'eternitty_get_menus',
        'permission_callback' => '__return_true',
    ));
    
    // User address endpoint
    register_rest_route('eternitty/v1', '/user-addresses/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'eternitty_get_user_addresses',
        'permission_callback' => '__return_true',
    ));
    
    // Update user address endpoint
    register_rest_route('eternitty/v1', '/user-addresses/(?P<id>\d+)', array(
        'methods' => 'POST',
        'callback' => 'eternitty_update_user_address',
        'permission_callback' => '__return_true',
    ));
    
});

/**
 * Get theme options with Instrument Sans as default preset
 */
function eternitty_get_theme_options() {
    
    // Complete Instrument Sans preset with all typography properties
    $default_preset = array(
        // === PRIMARY FONT SETTINGS ===
        'fontFamily' => 'Instrument Sans',
        'fontSize' => '16px',
        'fontWeight' => '400',
        'lineHeight' => '1.6',
        
        // === PRIMARY TYPOGRAPHY ===
        'primaryFont' => 'Instrument Sans',
        'primarySize' => '16px',
        'primaryWeight' => '400',
        'primaryLineHeight' => '1.6',
        'primaryLetterSpacing' => '0px',
        
        // === SECONDARY TYPOGRAPHY ===
        'secondaryFont' => 'Instrument Sans',
        'secondarySize' => '16px',
        'secondaryWeight' => '400',
        'secondaryLineHeight' => '1.6',
        'secondaryLetterSpacing' => '0px',
        
        // === BODY TEXT TYPOGRAPHY ===
        'bodyFont' => 'Instrument Sans',
        'bodySize' => '16px',
        'bodyWeight' => '400',
        'bodyLineHeight' => '1.6',
        'bodyLetterSpacing' => '0px',
        
        // === HEADING TYPOGRAPHY ===
        // H1 - Main headings
        'h1Font' => 'Instrument Sans',
        'h1Size' => '36px',
        'h1Weight' => '700',
        'h1LineHeight' => '1.1',
        'h1LetterSpacing' => '-0.025em',
        
        // H2 - Section headings
        'h2Font' => 'Instrument Sans',
        'h2Size' => '30px',
        'h2Weight' => '600',
        'h2LineHeight' => '1.2',
        'h2LetterSpacing' => '-0.025em',
        
        // H3 - Subsection headings
        'h3Font' => 'Instrument Sans',
        'h3Size' => '24px',
        'h3Weight' => '600',
        'h3LineHeight' => '1.3',
        'h3LetterSpacing' => '0px',
        
        // H4 - Minor headings
        'h4Font' => 'Instrument Sans',
        'h4Size' => '20px',
        'h4Weight' => '600',
        'h4LineHeight' => '1.4',
        'h4LetterSpacing' => '0px',
        
        // H5 - Small headings
        'h5Font' => 'Instrument Sans',
        'h5Size' => '18px',
        'h5Weight' => '600',
        'h5LineHeight' => '1.5',
        'h5LetterSpacing' => '0px',
        
        // H6 - Smallest headings
        'h6Font' => 'Instrument Sans',
        'h6Size' => '16px',
        'h6Weight' => '600',
        'h6LineHeight' => '1.5',
        'h6LetterSpacing' => '0px',
        
        // === BUTTON TYPOGRAPHY ===
        'buttonFont' => 'Instrument Sans',
        'buttonSize' => '16px',
        'buttonWeight' => '500',
        'buttonLineHeight' => '1.4',
        'buttonLetterSpacing' => '0px',
        
        // === NAVIGATION TYPOGRAPHY ===
        'navFont' => 'Instrument Sans',
        'navSize' => '16px',
        'navWeight' => '500',
        'navLineHeight' => '1.4',
        'navLetterSpacing' => '0px',
        
        // === FORM TYPOGRAPHY ===
        'formFont' => 'Instrument Sans',
        'formSize' => '16px',
        'formWeight' => '400',
        'formLineHeight' => '1.5',
        'formLetterSpacing' => '0px',
        
        // === CAPTION & SMALL TEXT ===
        'captionFont' => 'Instrument Sans',
        'captionSize' => '14px',
        'captionWeight' => '400',
        'captionLineHeight' => '1.4',
        'captionLetterSpacing' => '0px',
        
        // === QUOTE TYPOGRAPHY ===
        'quoteFont' => 'Instrument Sans',
        'quoteSize' => '18px',
        'quoteWeight' => '400',
        'quoteLineHeight' => '1.6',
        'quoteLetterSpacing' => '0px',
        
        // === CODE TYPOGRAPHY ===
        'codeFont' => 'JetBrains Mono',
        'codeSize' => '14px',
        'codeWeight' => '400',
        'codeLineHeight' => '1.5',
        'codeLetterSpacing' => '0px',
        
        // === DEFAULT COLORS ===
        'primaryColor' => '#3B82F6',
        'secondaryColor' => '#6B7280',
        'accentColor' => '#F59E0B',
        'textColor' => '#111827',
        'headingColor' => '#111827',
        'backgroundColor' => '#FFFFFF',
        'surfaceColor' => '#F9FAFB',
        'successColor' => '#10B981',
        'warningColor' => '#F59E0B',
        'errorColor' => '#EF4444'
    );
    
    // Get saved options from WordPress database
    $saved_options = array();
    
    // Try to get each option from WordPress options table
    $option_keys = array_keys($default_preset);
    foreach ($option_keys as $key) {
        $saved_value = get_option('eternitty_' . $key, null);
        if ($saved_value !== null) {
            $saved_options[$key] = $saved_value;
        }
    }
    
    // Merge saved options with defaults (saved options take precedence)
    $theme_options = array_merge($default_preset, $saved_options);
    
    return $theme_options;
}

/**
 * Get header and footer settings
 */
function eternitty_get_header_footer() {
    return array(
        'lightLogo' => get_option('eternitty_light_logo', ''),
        'darkLogo' => get_option('eternitty_dark_logo', ''),
        'favicon' => get_option('eternitty_favicon', ''),
        'topHeaderText' => get_option('eternitty_top_header_text', 'Welcome to our store!')
    );
}

/**
 * Get site information
 */
function eternitty_get_site_info() {
    return array(
        'name' => get_option('blogname', 'Your WordPress Site'),
        'description' => get_option('blogdescription', 'A modern WordPress site'),
        'url' => get_option('home', ''),
        'admin_email' => get_option('admin_email', ''),
        'timezone' => get_option('timezone_string', 'UTC'),
        'date_format' => get_option('date_format', 'F j, Y'),
        'time_format' => get_option('time_format', 'g:i a')
    );
}

/**
 * Initialize default options on plugin activation
 */
register_activation_hook(__FILE__, 'eternitty_set_default_options');

function eternitty_set_default_options() {
    
    // Complete Instrument Sans preset with all typography properties
    $default_preset = array(
        // === PRIMARY FONT SETTINGS ===
        'fontFamily' => 'Instrument Sans',
        'fontSize' => '16px',
        'fontWeight' => '400',
        'lineHeight' => '1.6',
        
        // === PRIMARY TYPOGRAPHY ===
        'primaryFont' => 'Instrument Sans',
        'primarySize' => '16px',
        'primaryWeight' => '400',
        'primaryLineHeight' => '1.6',
        'primaryLetterSpacing' => '0px',
        
        // === SECONDARY TYPOGRAPHY ===
        'secondaryFont' => 'Instrument Sans',
        'secondarySize' => '16px',
        'secondaryWeight' => '400',
        'secondaryLineHeight' => '1.6',
        'secondaryLetterSpacing' => '0px',
        
        // === BODY TEXT TYPOGRAPHY ===
        'bodyFont' => 'Instrument Sans',
        'bodySize' => '16px',
        'bodyWeight' => '400',
        'bodyLineHeight' => '1.6',
        'bodyLetterSpacing' => '0px',
        
        // === HEADING TYPOGRAPHY ===
        'h1Font' => 'Instrument Sans',
        'h1Size' => '36px',
        'h1Weight' => '700',
        'h1LineHeight' => '1.1',
        'h1LetterSpacing' => '-0.025em',
        
        'h2Font' => 'Instrument Sans',
        'h2Size' => '30px',
        'h2Weight' => '600',
        'h2LineHeight' => '1.2',
        'h2LetterSpacing' => '-0.025em',
        
        'h3Font' => 'Instrument Sans',
        'h3Size' => '24px',
        'h3Weight' => '600',
        'h3LineHeight' => '1.3',
        'h3LetterSpacing' => '0px',
        
        'h4Font' => 'Instrument Sans',
        'h4Size' => '20px',
        'h4Weight' => '600',
        'h4LineHeight' => '1.4',
        'h4LetterSpacing' => '0px',
        
        'h5Font' => 'Instrument Sans',
        'h5Size' => '18px',
        'h5Weight' => '600',
        'h5LineHeight' => '1.5',
        'h5LetterSpacing' => '0px',
        
        'h6Font' => 'Instrument Sans',
        'h6Size' => '16px',
        'h6Weight' => '600',
        'h6LineHeight' => '1.5',
        'h6LetterSpacing' => '0px',
        
        // === BUTTON TYPOGRAPHY ===
        'buttonFont' => 'Instrument Sans',
        'buttonSize' => '16px',
        'buttonWeight' => '500',
        'buttonLineHeight' => '1.4',
        'buttonLetterSpacing' => '0px',
        
        // === NAVIGATION TYPOGRAPHY ===
        'navFont' => 'Instrument Sans',
        'navSize' => '16px',
        'navWeight' => '500',
        'navLineHeight' => '1.4',
        'navLetterSpacing' => '0px',
        
        // === FORM TYPOGRAPHY ===
        'formFont' => 'Instrument Sans',
        'formSize' => '16px',
        'formWeight' => '400',
        'formLineHeight' => '1.5',
        'formLetterSpacing' => '0px',
        
        // === CAPTION & SMALL TEXT ===
        'captionFont' => 'Instrument Sans',
        'captionSize' => '14px',
        'captionWeight' => '400',
        'captionLineHeight' => '1.4',
        'captionLetterSpacing' => '0px',
        
        // === QUOTE TYPOGRAPHY ===
        'quoteFont' => 'Instrument Sans',
        'quoteSize' => '18px',
        'quoteWeight' => '400',
        'quoteLineHeight' => '1.6',
        'quoteLetterSpacing' => '0px',
        
        // === CODE TYPOGRAPHY ===
        'codeFont' => 'JetBrains Mono',
        'codeSize' => '14px',
        'codeWeight' => '400',
        'codeLineHeight' => '1.5',
        'codeLetterSpacing' => '0px',
        
        // === DEFAULT COLORS ===
        'primaryColor' => '#3B82F6',
        'secondaryColor' => '#6B7280',
        'accentColor' => '#F59E0B',
        'textColor' => '#111827',
        'headingColor' => '#111827',
        'backgroundColor' => '#FFFFFF',
        'surfaceColor' => '#F9FAFB',
        'successColor' => '#10B981',
        'warningColor' => '#F59E0B',
        'errorColor' => '#EF4444'
    );
    
    // Set default options if they don't exist
    foreach ($default_preset as $key => $value) {
        $option_name = 'eternitty_' . $key;
        if (get_option($option_name) === false) {
            add_option($option_name, $value);
        }
    }
}

/**
 * Add admin menu for theme options
 */
add_action('admin_menu', 'eternitty_add_admin_menu');

function eternitty_add_admin_menu() {
    add_menu_page(
        'Headless Pro',
        'Headless Pro',
        'manage_options',
        'eternitty-headless',
        'eternitty_admin_page',
        'dashicons-admin-customizer',
        30
    );
    
    // Add submenu pages
    add_submenu_page(
        'eternitty-headless',
        'Theme Options',
        'Theme Options',
        'manage_options',
        'eternitty-headless',
        'eternitty_admin_page'
    );
    
    add_submenu_page(
        'eternitty-headless',
        'Header & Footer',
        'Header & Footer',
        'manage_options',
        'eternitty-headless&tab=header_footer',
        'eternitty_admin_page'
    );
}

/**
 * Admin page content
 */
function eternitty_admin_page() {
    $current_tab = isset($_GET['tab']) ? $_GET['tab'] : 'theme_options';
    
    ?>
    <div class="wrap">
        <h1>Headless Pro Settings</h1>
        
        <nav class="nav-tab-wrapper">
            <a href="?page=eternitty-headless" class="nav-tab <?php echo $current_tab === 'theme_options' ? 'nav-tab-active' : ''; ?>">
                Theme Options
            </a>
            <a href="?page=eternitty-headless&tab=header_footer" class="nav-tab <?php echo $current_tab === 'header_footer' ? 'nav-tab-active' : ''; ?>">
                Header & Footer
            </a>
        </nav>
        
        <div class="tab-content">
            <?php if ($current_tab === 'theme_options'): ?>
                <h2>Typography Settings</h2>
                <p>Current settings are loaded with <strong>Instrument Sans</strong> as the default preset.</p>
                <p>You can modify these settings and they will be reflected in your frontend.</p>
                
                <h3>Current Font Settings</h3>
                <table class="form-table">
                    <tr>
                        <th>Primary Font</th>
                        <td><?php echo get_option('eternitty_primaryFont', 'Instrument Sans'); ?></td>
                    </tr>
                    <tr>
                        <th>Body Font</th>
                        <td><?php echo get_option('eternitty_bodyFont', 'Instrument Sans'); ?></td>
                    </tr>
                    <tr>
                        <th>H1 Font</th>
                        <td><?php echo get_option('eternitty_h1Font', 'Instrument Sans'); ?></td>
                    </tr>
                </table>
                
            <?php elseif ($current_tab === 'header_footer'): ?>
                <h2>Header & Footer Settings</h2>
                <p>Configure your site's header and footer elements.</p>
                
            <?php endif; ?>
        </div>
    </div>
    <?php
}

/**
 * Get WordPress menus
 */
function eternitty_get_menus() {
    $menus = array();
    
    // Get all registered menus
    $registered_menus = get_registered_nav_menus();
    
    foreach ($registered_menus as $location => $description) {
        $menu_items = wp_get_nav_menu_items($location);
        
        if ($menu_items) {
            $menu_data = array(
                'location' => $location,
                'description' => $description,
                'items' => array()
            );
            
            // For main menu locations, include all levels
            $main_menu_locations = array('primary', 'main', 'header', 'top', 'primary-menu', 'main-menu', 'header-menu');
            
            if (in_array($location, $main_menu_locations)) {
                // Include all menu items with hierarchy for main menu
                $menu_data['items'] = build_menu_hierarchy($menu_items);
            } else {
                // Only include top-level items for other menus (like footer)
                foreach ($menu_items as $item) {
                    if ($item->menu_item_parent == 0) {
                        $menu_data['items'][] = array(
                            'id' => $item->ID,
                            'title' => $item->title,
                            'url' => $item->url,
                            'target' => $item->target,
                            'description' => $item->description,
                            'children' => array()
                        );
                    }
                }
            }
            
            $menus[$location] = $menu_data;
        }
    }
    
    // If no menus found, try to get menus by name
    if (empty($menus)) {
        $menu_locations = array(
            'footer-menu' => 'Footer Menu',
            'footer' => 'Footer',
            'legal-menu' => 'Legal Menu',
            'legal' => 'Legal',
            'bottom-menu' => 'Bottom Menu',
            'bottom' => 'Bottom'
        );
        
        foreach ($menu_locations as $location => $name) {
            $menu = wp_get_nav_menu_object($name);
            if ($menu) {
                $menu_items = wp_get_nav_menu_items($menu->term_id);
                
                if ($menu_items) {
                    $menu_data = array(
                        'location' => $location,
                        'description' => $name,
                        'items' => array()
                    );
                    
                    foreach ($menu_items as $item) {
                        if ($item->menu_item_parent == 0) {
                            $menu_data['items'][] = array(
                                'id' => $item->ID,
                                'title' => $item->title,
                                'url' => $item->url,
                                'target' => $item->target,
                                'description' => $item->description
                            );
                        }
                    }
                    
                    $menus[$location] = $menu_data;
                }
            }
        }
    }
    
    return $menus;
}

/**
 * Build menu hierarchy with children
 */
function build_menu_hierarchy($menu_items) {
    $menu_array = array();
    $menu_by_id = array();
    
    // First pass: create array of all menu items
    foreach ($menu_items as $item) {
        $menu_by_id[$item->ID] = array(
            'id' => $item->ID,
            'title' => $item->title,
            'url' => $item->url,
            'target' => $item->target,
            'description' => $item->description,
            'parent' => $item->menu_item_parent,
            'children' => array()
        );
    }
    
    // Second pass: build hierarchy
    foreach ($menu_by_id as $id => $item) {
        if ($item['parent'] == 0) {
            // Top-level item
            $menu_array[] = &$menu_by_id[$id];
        } else {
            // Child item
            if (isset($menu_by_id[$item['parent']])) {
                $menu_by_id[$item['parent']]['children'][] = &$menu_by_id[$id];
            }
        }
    }
    
    return $menu_array;
}

/**
 * Add Google Fonts to admin head
 */
add_action('admin_head', 'eternitty_add_google_fonts');

function eternitty_add_google_fonts() {
    ?>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">                                                                                           
    <style>
        .eternitty-admin-preview {
            font-family: 'Instrument Sans', system-ui, sans-serif;
        }
    </style>
    <?php
}

/**
 * Get user addresses from WordPress user meta
 */
function eternitty_get_user_addresses($request) {
    $user_id = $request['id'];
    
    // Get user meta data
    $billing_first_name = get_user_meta($user_id, 'billing_first_name', true);
    $billing_last_name = get_user_meta($user_id, 'billing_last_name', true);
    $billing_company = get_user_meta($user_id, 'billing_company', true);
    $billing_address_1 = get_user_meta($user_id, 'billing_address_1', true);
    $billing_address_2 = get_user_meta($user_id, 'billing_address_2', true);
    $billing_city = get_user_meta($user_id, 'billing_city', true);
    $billing_state = get_user_meta($user_id, 'billing_state', true);
    $billing_postcode = get_user_meta($user_id, 'billing_postcode', true);
    $billing_country = get_user_meta($user_id, 'billing_country', true);
    $billing_phone = get_user_meta($user_id, 'billing_phone', true);
    
    $shipping_first_name = get_user_meta($user_id, 'shipping_first_name', true);
    $shipping_last_name = get_user_meta($user_id, 'shipping_last_name', true);
    $shipping_company = get_user_meta($user_id, 'shipping_company', true);
    $shipping_address_1 = get_user_meta($user_id, 'shipping_address_1', true);
    $shipping_address_2 = get_user_meta($user_id, 'shipping_address_2', true);
    $shipping_city = get_user_meta($user_id, 'shipping_city', true);
    $shipping_state = get_user_meta($user_id, 'shipping_state', true);
    $shipping_postcode = get_user_meta($user_id, 'shipping_postcode', true);
    $shipping_country = get_user_meta($user_id, 'shipping_country', true);
    
    $addresses = [];
    
    // Add billing address if it exists
    if ($billing_first_name || $billing_address_1 || $billing_city) {
        $addresses[] = [
            'id' => 'billing',
            'type' => 'billing',
            'isDefault' => false,
            'name' => trim(($billing_first_name ?: '') . ' ' . ($billing_last_name ?: '')),
            'street' => trim(($billing_address_1 ?: '') . ' ' . ($billing_address_2 ?: '')),
            'city' => $billing_city ?: '',
            'state' => $billing_state ?: '',
            'zipCode' => $billing_postcode ?: '',
            'country' => $billing_country ?: '',
            'phone' => $billing_phone ?: '',
            'company' => $billing_company ?: ''
        ];
    }
    
    // Add shipping address if it exists
    if ($shipping_first_name || $shipping_address_1 || $shipping_city) {
        $addresses[] = [
            'id' => 'shipping',
            'type' => 'shipping',
            'isDefault' => true,
            'name' => trim(($shipping_first_name ?: '') . ' ' . ($shipping_last_name ?: '')),
            'street' => trim(($shipping_address_1 ?: '') . ' ' . ($shipping_address_2 ?: '')),
            'city' => $shipping_city ?: '',
            'state' => $shipping_state ?: '',
            'zipCode' => $shipping_postcode ?: '',
            'country' => $shipping_country ?: '',
            'phone' => $billing_phone ?: '', // Use billing phone for shipping
            'company' => $shipping_company ?: ''
        ];
    }
    
    return [
        'success' => true,
        'addresses' => $addresses,
        'source' => 'wordpress_meta',
        'message' => 'Addresses retrieved from WordPress user meta'
    ];
}

/**
 * Update user address in WordPress user meta
 */
function eternitty_update_user_address($request) {
    $user_id = $request['id'];
    $params = $request->get_json_params();
    
    $type = $params['type'] ?? '';
    $name = $params['name'] ?? '';
    $street = $params['street'] ?? '';
    $city = $params['city'] ?? '';
    $state = $params['state'] ?? '';
    $zipCode = $params['zipCode'] ?? '';
    $country = $params['country'] ?? '';
    $phone = $params['phone'] ?? '';
    $company = $params['company'] ?? '';
    
    if (!$type || !$name || !$street || !$city) {
        return new WP_Error('missing_fields', 'Required fields: type, name, street, city', ['status' => 400]);
    }
    
    // Split name into first and last name
    $name_parts = explode(' ', $name, 2);
    $first_name = $name_parts[0] ?? '';
    $last_name = $name_parts[1] ?? '';
    
    // Update user meta based on address type
    if ($type === 'billing') {
        update_user_meta($user_id, 'billing_first_name', $first_name);
        update_user_meta($user_id, 'billing_last_name', $last_name);
        update_user_meta($user_id, 'billing_company', $company);
        update_user_meta($user_id, 'billing_address_1', $street);
        update_user_meta($user_id, 'billing_address_2', '');
        update_user_meta($user_id, 'billing_city', $city);
        update_user_meta($user_id, 'billing_state', $state);
        update_user_meta($user_id, 'billing_postcode', $zipCode);
        update_user_meta($user_id, 'billing_country', $country);
        update_user_meta($user_id, 'billing_phone', $phone);
    } elseif ($type === 'shipping') {
        update_user_meta($user_id, 'shipping_first_name', $first_name);
        update_user_meta($user_id, 'shipping_last_name', $last_name);
        update_user_meta($user_id, 'shipping_company', $company);
        update_user_meta($user_id, 'shipping_address_1', $street);
        update_user_meta($user_id, 'shipping_address_2', '');
        update_user_meta($user_id, 'shipping_city', $city);
        update_user_meta($user_id, 'shipping_state', $state);
        update_user_meta($user_id, 'shipping_postcode', $zipCode);
        update_user_meta($user_id, 'shipping_country', $country);
    }
    
    return [
        'success' => true,
        'message' => 'Address updated successfully in WordPress user meta',
        'source' => 'wordpress_meta'
    ];
}

