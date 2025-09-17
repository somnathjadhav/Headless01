<?php
/**
 * Install Headless Pro Plugin
 * 
 * Run this script to properly install the Headless Pro plugin in WordPress
 * This will copy the plugin file to the WordPress plugins directory
 */

// WordPress installation path (adjust if different)
$wordpress_path = '/Users/somnathjadhav/Projects/Frontend-NextJs/Frontend-NextJs/wordpress';
$plugins_path = $wordpress_path . '/wp-content/plugins/headless-pro';

// Source plugin file
$source_file = __DIR__ . '/headless-plugin-main.php';
$target_file = $plugins_path . '/headless-pro.php';

echo "Installing Headless Pro Plugin...\n";

// Create plugin directory if it doesn't exist
if (!is_dir($plugins_path)) {
    if (mkdir($plugins_path, 0755, true)) {
        echo "✓ Created plugin directory: $plugins_path\n";
    } else {
        echo "✗ Failed to create plugin directory\n";
        exit(1);
    }
}

// Copy plugin file
if (copy($source_file, $target_file)) {
    echo "✓ Copied plugin file to: $target_file\n";
} else {
    echo "✗ Failed to copy plugin file\n";
    exit(1);
}

// Create plugin header file
$plugin_header = "<?php
/**
 * Plugin Name: Headless Pro
 * Description: WordPress backend for headless frontend with theme options, typography, and integrations
 * Version: 1.0.0
 * Author: Eternitty
 * Text Domain: headless-pro
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Include the main plugin file
require_once plugin_dir_path(__FILE__) . 'headless-pro.php';
";

file_put_contents($plugins_path . '/headless-pro.php', $plugin_header);
echo "✓ Created plugin header file\n";

echo "\nPlugin installation complete!\n";
echo "Next steps:\n";
echo "1. Go to WordPress Admin → Plugins\n";
echo "2. Find 'Headless Pro' and click 'Activate'\n";
echo "3. Test the menu endpoint: http://localhost:10008/wp-json/eternitty/v1/menus\n";
?>
