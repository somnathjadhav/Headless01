<?php
/**
 * SMTP Email Configuration for Headless Pro Plugin
 * 
 * This code should be added to your Headless Pro plugin to enable SMTP email functionality.
 * Copy this code and add it to your main plugin file.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class HeadlessProSMTP {
    
    public function __construct() {
        add_action('init', array($this, 'init_smtp'));
        add_action('wp_ajax_headless_smtp_test', array($this, 'test_smtp_connection'));
        add_action('wp_ajax_headless_send_email', array($this, 'send_email_via_smtp'));
        add_action('rest_api_init', array($this, 'register_smtp_endpoints'));
    }
    
    public function init_smtp() {
        // Only configure SMTP if settings are available
        if ($this->has_smtp_settings()) {
            add_action('phpmailer_init', array($this, 'configure_smtp'));
        }
    }
    
    private function has_smtp_settings() {
        $smtp_host = get_option('eternitty_smtp_host');
        $smtp_user = get_option('eternitty_smtp_user');
        $smtp_pass = get_option('eternitty_smtp_pass');
        
        return !empty($smtp_host) && !empty($smtp_user) && !empty($smtp_pass);
    }
    
    public function configure_smtp($phpmailer) {
        $smtp_host = get_option('eternitty_smtp_host');
        $smtp_port = get_option('eternitty_smtp_port', 587);
        $smtp_secure = get_option('eternitty_smtp_secure', 'tls');
        $smtp_user = get_option('eternitty_smtp_user');
        $smtp_pass = get_option('eternitty_smtp_pass');
        $smtp_from_name = get_option('eternitty_smtp_from_name', get_bloginfo('name'));
        $smtp_from_email = get_option('eternitty_smtp_from_email', get_option('admin_email'));
        
        if (empty($smtp_host) || empty($smtp_user) || empty($smtp_pass)) {
            return;
        }
        
        // Configure PHPMailer for SMTP
        $phpmailer->isSMTP();
        $phpmailer->Host = $smtp_host;
        $phpmailer->SMTPAuth = true;
        $phpmailer->Port = intval($smtp_port);
        $phpmailer->Username = $smtp_user;
        $phpmailer->Password = $smtp_pass;
        $phpmailer->SMTPSecure = $smtp_secure;
        $phpmailer->From = $smtp_from_email;
        $phpmailer->FromName = $smtp_from_name;
        
        // Enable debugging if in development
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $phpmailer->SMTPDebug = 2;
            $phpmailer->Debugoutput = 'error_log';
        }
    }
    
    public function test_smtp_connection() {
        // Verify nonce for security
        if (!wp_verify_nonce($_POST['nonce'], 'headless_smtp_test')) {
            wp_die('Security check failed');
        }
        
        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        $smtp_host = sanitize_text_field($_POST['smtp_host']);
        $smtp_port = intval($_POST['smtp_port']);
        $smtp_secure = sanitize_text_field($_POST['smtp_secure']);
        $smtp_user = sanitize_email($_POST['smtp_user']);
        $smtp_pass = sanitize_text_field($_POST['smtp_pass']);
        $test_email = sanitize_email($_POST['test_email']);
        
        if (empty($smtp_host) || empty($smtp_user) || empty($smtp_pass) || empty($test_email)) {
            wp_send_json_error('Missing required fields');
            return;
        }
        
        // Temporarily save settings for testing
        $original_settings = array(
            'host' => get_option('eternitty_smtp_host'),
            'port' => get_option('eternitty_smtp_port'),
            'secure' => get_option('eternitty_smtp_secure'),
            'user' => get_option('eternitty_smtp_user'),
            'pass' => get_option('eternitty_smtp_pass'),
        );
        
        // Set test settings
        update_option('eternitty_smtp_host', $smtp_host);
        update_option('eternitty_smtp_port', $smtp_port);
        update_option('eternitty_smtp_secure', $smtp_secure);
        update_option('eternitty_smtp_user', $smtp_user);
        update_option('eternitty_smtp_pass', $smtp_pass);
        
        // Test email sending
        $subject = 'SMTP Test Email - ' . get_bloginfo('name');
        $message = 'This is a test email to verify SMTP configuration is working correctly.';
        $headers = array('Content-Type: text/html; charset=UTF-8');
        
        $result = wp_mail($test_email, $subject, $message, $headers);
        
        // Restore original settings
        foreach ($original_settings as $key => $value) {
            if ($value !== false) {
                update_option('eternitty_smtp_' . $key, $value);
            } else {
                delete_option('eternitty_smtp_' . $key);
            }
        }
        
        if ($result) {
            wp_send_json_success('Test email sent successfully!');
        } else {
            global $phpmailer;
            $error_message = 'Failed to send test email.';
            if (isset($phpmailer) && !empty($phpmailer->ErrorInfo)) {
                $error_message .= ' Error: ' . $phpmailer->ErrorInfo;
            }
            wp_send_json_error($error_message);
        }
    }
    
    public function send_email_via_smtp() {
        // Verify nonce for security
        if (!wp_verify_nonce($_POST['nonce'], 'headless_send_email')) {
            wp_die('Security check failed');
        }
        
        $to = sanitize_email($_POST['to']);
        $subject = sanitize_text_field($_POST['subject']);
        $message = wp_kses_post($_POST['message']);
        $headers = array('Content-Type: text/html; charset=UTF-8');
        
        if (empty($to) || empty($subject) || empty($message)) {
            wp_send_json_error('Missing required fields');
            return;
        }
        
        $result = wp_mail($to, $subject, $message, $headers);
        
        if ($result) {
            wp_send_json_success('Email sent successfully!');
        } else {
            global $phpmailer;
            $error_message = 'Failed to send email.';
            if (isset($phpmailer) && !empty($phpmailer->ErrorInfo)) {
                $error_message .= ' Error: ' . $phpmailer->ErrorInfo;
            }
            wp_send_json_error($error_message);
        }
    }
    
    public function register_smtp_endpoints() {
        // Register REST API endpoint for sending emails
        register_rest_route('eternitty/v1', '/send-email', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_send_email'),
            'permission_callback' => '__return_true', // You may want to add proper authentication
        ));
        
        // Register REST API endpoint for SMTP configuration
        register_rest_route('eternitty/v1', '/smtp-config', array(
            'methods' => 'GET',
            'callback' => array($this, 'rest_get_smtp_config'),
            'permission_callback' => '__return_true',
        ));
    }
    
    public function rest_send_email($request) {
        $to = sanitize_email($request->get_param('to'));
        $subject = sanitize_text_field($request->get_param('subject'));
        $html = wp_kses_post($request->get_param('html'));
        $text = sanitize_textarea_field($request->get_param('text'));
        
        if (empty($to) || empty($subject) || (empty($html) && empty($text))) {
            return new WP_Error('missing_fields', 'Missing required fields', array('status' => 400));
        }
        
        $message = !empty($html) ? $html : $text;
        $headers = array('Content-Type: text/html; charset=UTF-8');
        
        $result = wp_mail($to, $subject, $message, $headers);
        
        if ($result) {
            return array(
                'success' => true,
                'message' => 'Email sent successfully',
                'messageId' => 'wp-smtp-' . time()
            );
        } else {
            global $phpmailer;
            $error_message = 'Failed to send email';
            if (isset($phpmailer) && !empty($phpmailer->ErrorInfo)) {
                $error_message .= ': ' . $phpmailer->ErrorInfo;
            }
            return new WP_Error('send_failed', $error_message, array('status' => 500));
        }
    }
    
    public function rest_get_smtp_config($request) {
        return array(
            'enabled' => $this->has_smtp_settings(),
            'host' => get_option('eternitty_smtp_host', ''),
            'port' => get_option('eternitty_smtp_port', 587),
            'secure' => get_option('eternitty_smtp_secure', 'tls'),
            'user' => get_option('eternitty_smtp_user', ''),
            'from_name' => get_option('eternitty_smtp_from_name', get_bloginfo('name')),
            'from_email' => get_option('eternitty_smtp_from_email', get_option('admin_email')),
        );
    }
}

// Initialize SMTP functionality
new HeadlessProSMTP();

/**
 * Admin Settings Page for SMTP Configuration
 */
class HeadlessProSMTPAdmin {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }
    
    public function add_admin_menu() {
        add_submenu_page(
            'eternitty-headless', // Parent slug (adjust to match your plugin's main menu)
            'SMTP Settings',
            'SMTP Settings',
            'manage_options',
            'eternitty-smtp',
            array($this, 'admin_page')
        );
    }
    
    public function register_settings() {
        register_setting('eternitty_smtp_settings', 'eternitty_smtp_host');
        register_setting('eternitty_smtp_settings', 'eternitty_smtp_port');
        register_setting('eternitty_smtp_settings', 'eternitty_smtp_secure');
        register_setting('eternitty_smtp_settings', 'eternitty_smtp_user');
        register_setting('eternitty_smtp_settings', 'eternitty_smtp_pass');
        register_setting('eternitty_smtp_settings', 'eternitty_smtp_from_name');
        register_setting('eternitty_smtp_settings', 'eternitty_smtp_from_email');
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>SMTP Email Settings</h1>
            
            <form method="post" action="options.php">
                <?php settings_fields('eternitty_smtp_settings'); ?>
                <?php do_settings_sections('eternitty_smtp_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">SMTP Host</th>
                        <td>
                            <input type="text" name="eternitty_smtp_host" value="<?php echo esc_attr(get_option('eternitty_smtp_host')); ?>" class="regular-text" />
                            <p class="description">e.g., smtp.gmail.com, smtp-mail.outlook.com</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">SMTP Port</th>
                        <td>
                            <input type="number" name="eternitty_smtp_port" value="<?php echo esc_attr(get_option('eternitty_smtp_port', 587)); ?>" class="small-text" />
                            <p class="description">Usually 587 for TLS or 465 for SSL</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">SMTP Security</th>
                        <td>
                            <select name="eternitty_smtp_secure">
                                <option value="tls" <?php selected(get_option('eternitty_smtp_secure', 'tls'), 'tls'); ?>>TLS</option>
                                <option value="ssl" <?php selected(get_option('eternitty_smtp_secure'), 'ssl'); ?>>SSL</option>
                                <option value="" <?php selected(get_option('eternitty_smtp_secure'), ''); ?>>None</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">SMTP Username</th>
                        <td>
                            <input type="email" name="eternitty_smtp_user" value="<?php echo esc_attr(get_option('eternitty_smtp_user')); ?>" class="regular-text" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">SMTP Password</th>
                        <td>
                            <input type="password" name="eternitty_smtp_pass" value="<?php echo esc_attr(get_option('eternitty_smtp_pass')); ?>" class="regular-text" />
                            <p class="description">For Gmail, use an App Password</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">From Name</th>
                        <td>
                            <input type="text" name="eternitty_smtp_from_name" value="<?php echo esc_attr(get_option('eternitty_smtp_from_name', get_bloginfo('name'))); ?>" class="regular-text" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">From Email</th>
                        <td>
                            <input type="email" name="eternitty_smtp_from_email" value="<?php echo esc_attr(get_option('eternitty_smtp_from_email', get_option('admin_email'))); ?>" class="regular-text" />
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
            
            <hr>
            
            <h2>Test SMTP Connection</h2>
            <form id="smtp-test-form">
                <table class="form-table">
                    <tr>
                        <th scope="row">Test Email</th>
                        <td>
                            <input type="email" id="test-email" value="<?php echo esc_attr(get_option('admin_email')); ?>" class="regular-text" required />
                            <button type="submit" class="button button-secondary">Send Test Email</button>
                        </td>
                    </tr>
                </table>
            </form>
            <div id="smtp-test-result"></div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            $('#smtp-test-form').on('submit', function(e) {
                e.preventDefault();
                
                var testEmail = $('#test-email').val();
                var resultDiv = $('#smtp-test-result');
                
                resultDiv.html('<p>Sending test email...</p>');
                
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'headless_smtp_test',
                        nonce: '<?php echo wp_create_nonce('headless_smtp_test'); ?>',
                        smtp_host: $('input[name="eternitty_smtp_host"]').val(),
                        smtp_port: $('input[name="eternitty_smtp_port"]').val(),
                        smtp_secure: $('select[name="eternitty_smtp_secure"]').val(),
                        smtp_user: $('input[name="eternitty_smtp_user"]').val(),
                        smtp_pass: $('input[name="eternitty_smtp_pass"]').val(),
                        test_email: testEmail
                    },
                    success: function(response) {
                        if (response.success) {
                            resultDiv.html('<div class="notice notice-success"><p>' + response.data + '</p></div>');
                        } else {
                            resultDiv.html('<div class="notice notice-error"><p>' + response.data + '</p></div>');
                        }
                    },
                    error: function() {
                        resultDiv.html('<div class="notice notice-error"><p>Failed to send test email. Please check your settings.</p></div>');
                    }
                });
            });
        });
        </script>
        <?php
    }
}

// Initialize admin settings
new HeadlessProSMTPAdmin();
?>
