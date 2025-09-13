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
