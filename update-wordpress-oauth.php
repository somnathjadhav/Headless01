<?php
/**
 * WordPress OAuth Settings Update Script
 * 
 * This script updates your WordPress OAuth settings to use the correct redirect URI
 * for Google OAuth compliance.
 */

// WordPress database connection details
$host = 'localhost';
$dbname = 'your_wordpress_database';
$username = 'your_db_username';
$password = 'your_db_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to WordPress database successfully.\n";
    
    // Update OAuth redirect URI
    $redirect_uri = 'http://headless.lvh.me:3000/api/google-oauth/callback';
    
    // Check if the option exists
    $stmt = $pdo->prepare("SELECT option_value FROM wp_options WHERE option_name = 'eternitty_google_oauth_redirect_uri'");
    $stmt->execute();
    $existing = $stmt->fetch();
    
    if ($existing) {
        // Update existing option
        $stmt = $pdo->prepare("UPDATE wp_options SET option_value = ? WHERE option_name = 'eternitty_google_oauth_redirect_uri'");
        $stmt->execute([$redirect_uri]);
        echo "✅ Updated existing OAuth redirect URI to: $redirect_uri\n";
    } else {
        // Insert new option
        $stmt = $pdo->prepare("INSERT INTO wp_options (option_name, option_value) VALUES ('eternitty_google_oauth_redirect_uri', ?)");
        $stmt->execute([$redirect_uri]);
        echo "✅ Created new OAuth redirect URI: $redirect_uri\n";
    }
    
    // Also update the client ID and secret if needed
    $client_id = '766083268767-1i5dlq9eb5jpqrqmn6tegrf7gk7125h7.apps.googleusercontent.com';
    
    // Update client ID
    $stmt = $pdo->prepare("SELECT option_value FROM wp_options WHERE option_name = 'eternitty_google_oauth_client_id'");
    $stmt->execute();
    $existing_client_id = $stmt->fetch();
    
    if ($existing_client_id) {
        $stmt = $pdo->prepare("UPDATE wp_options SET option_value = ? WHERE option_name = 'eternitty_google_oauth_client_id'");
        $stmt->execute([$client_id]);
        echo "✅ Updated OAuth client ID\n";
    } else {
        $stmt = $pdo->prepare("INSERT INTO wp_options (option_name, option_value) VALUES ('eternitty_google_oauth_client_id', ?)");
        $stmt->execute([$client_id]);
        echo "✅ Created OAuth client ID\n";
    }
    
    // Enable OAuth
    $stmt = $pdo->prepare("SELECT option_value FROM wp_options WHERE option_name = 'eternitty_google_oauth_enabled'");
    $stmt->execute();
    $existing_enabled = $stmt->fetch();
    
    if ($existing_enabled) {
        $stmt = $pdo->prepare("UPDATE wp_options SET option_value = '1' WHERE option_name = 'eternitty_google_oauth_enabled'");
        $stmt->execute();
        echo "✅ Enabled OAuth\n";
    } else {
        $stmt = $pdo->prepare("INSERT INTO wp_options (option_name, option_value) VALUES ('eternitty_google_oauth_enabled', '1')");
        $stmt->execute();
        echo "✅ Created and enabled OAuth\n";
    }
    
    echo "\n🎉 WordPress OAuth settings updated successfully!\n";
    echo "You can now test the OAuth flow at: http://headless.lvh.me:3000/signin\n";
    
} catch(PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    echo "\nPlease update the database connection details in this script.\n";
}
?>
