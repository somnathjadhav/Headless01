<?php
/**
 * Headless Address Manager Plugin
 * 
 * This plugin provides REST API endpoints for address management
 * when WooCommerce API permissions are not available.
 * 
 * @package HeadlessAddressManager
 * @version 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class HeadlessAddressManager {
    
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        // Initialize the plugin
        $this->create_default_addresses();
    }
    
    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        // Get user addresses
        register_rest_route('eternitty/v1', '/user/(?P<user_id>\d+)/addresses', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_user_addresses'),
            'permission_callback' => array($this, 'check_permissions'),
            'args' => array(
                'user_id' => array(
                    'required' => true,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint',
                ),
            ),
        ));
        
        // Update user address
        register_rest_route('eternitty/v1', '/user/(?P<user_id>\d+)/addresses', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_user_address'),
            'permission_callback' => array($this, 'check_permissions'),
            'args' => array(
                'user_id' => array(
                    'required' => true,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint',
                ),
            ),
        ));
        
        // Create user address
        register_rest_route('eternitty/v1', '/user/(?P<user_id>\d+)/addresses', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_user_address'),
            'permission_callback' => array($this, 'check_permissions'),
            'args' => array(
                'user_id' => array(
                    'required' => true,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint',
                ),
            ),
        ));
        
        // Delete user address
        register_rest_route('eternitty/v1', '/user/(?P<user_id>\d+)/addresses', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_user_address'),
            'permission_callback' => array($this, 'check_permissions'),
            'args' => array(
                'user_id' => array(
                    'required' => true,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint',
                ),
            ),
        ));
        
        // Sync addresses to WooCommerce (if possible)
        register_rest_route('eternitty/v1', '/user/(?P<user_id>\d+)/addresses/sync', array(
            'methods' => 'POST',
            'callback' => array($this, 'sync_addresses_to_woocommerce'),
            'permission_callback' => array($this, 'check_permissions'),
            'args' => array(
                'user_id' => array(
                    'required' => true,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint',
                ),
            ),
        ));
    }
    
    /**
     * Check permissions for API access
     */
    public function check_permissions($request) {
        // For now, allow all requests (in production, implement proper authentication)
        return true;
    }
    
    /**
     * Get user addresses
     */
    public function get_user_addresses($request) {
        $user_id = $request->get_param('user_id');
        
        // Try to get addresses from WooCommerce first
        $wc_addresses = $this->get_woocommerce_addresses($user_id);
        if ($wc_addresses) {
            return new WP_REST_Response(array(
                'success' => true,
                'addresses' => $wc_addresses,
                'source' => 'woocommerce',
                'message' => 'Addresses loaded from WooCommerce'
            ), 200);
        }
        
        // Fallback to WordPress options
        $addresses = $this->get_wordpress_addresses($user_id);
        
        return new WP_REST_Response(array(
            'success' => true,
            'addresses' => $addresses,
            'source' => 'wordpress',
            'message' => 'Addresses loaded from WordPress storage'
        ), 200);
    }
    
    /**
     * Update user address
     */
    public function update_user_address($request) {
        $user_id = $request->get_param('user_id');
        $address_data = $request->get_json_params();
        
        // Validate required fields
        if (empty($address_data['id']) || empty($address_data['type'])) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Address ID and type are required'
            ), 400);
        }
        
        // Try to update in WooCommerce first
        $wc_result = $this->update_woocommerce_address($user_id, $address_data);
        if ($wc_result) {
            return new WP_REST_Response(array(
                'success' => true,
                'address' => $wc_result,
                'source' => 'woocommerce',
                'message' => 'Address updated in WooCommerce'
            ), 200);
        }
        
        // Fallback to WordPress options
        $result = $this->update_wordpress_address($user_id, $address_data);
        
        return new WP_REST_Response(array(
            'success' => true,
            'address' => $result,
            'source' => 'wordpress',
            'message' => 'Address updated in WordPress storage'
        ), 200);
    }
    
    /**
     * Create user address
     */
    public function create_user_address($request) {
        $user_id = $request->get_param('user_id');
        $address_data = $request->get_json_params();
        
        // Validate required fields
        if (empty($address_data['type']) || empty($address_data['name']) || empty($address_data['street']) || empty($address_data['city'])) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Type, name, street, and city are required'
            ), 400);
        }
        
        // Try to create in WooCommerce first
        $wc_result = $this->create_woocommerce_address($user_id, $address_data);
        if ($wc_result) {
            return new WP_REST_Response(array(
                'success' => true,
                'address' => $wc_result,
                'source' => 'woocommerce',
                'message' => 'Address created in WooCommerce'
            ), 201);
        }
        
        // Fallback to WordPress options
        $result = $this->create_wordpress_address($user_id, $address_data);
        
        return new WP_REST_Response(array(
            'success' => true,
            'address' => $result,
            'source' => 'wordpress',
            'message' => 'Address created in WordPress storage'
        ), 201);
    }
    
    /**
     * Delete user address
     */
    public function delete_user_address($request) {
        $user_id = $request->get_param('user_id');
        $address_data = $request->get_json_params();
        
        // Validate required fields
        if (empty($address_data['id']) || empty($address_data['type'])) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Address ID and type are required'
            ), 400);
        }
        
        // Try to delete from WooCommerce first
        $wc_result = $this->delete_woocommerce_address($user_id, $address_data);
        if ($wc_result) {
            return new WP_REST_Response(array(
                'success' => true,
                'source' => 'woocommerce',
                'message' => 'Address deleted from WooCommerce'
            ), 200);
        }
        
        // Fallback to WordPress options
        $result = $this->delete_wordpress_address($user_id, $address_data);
        
        return new WP_REST_Response(array(
            'success' => true,
            'source' => 'wordpress',
            'message' => 'Address deleted from WordPress storage'
        ), 200);
    }
    
    /**
     * Sync addresses to WooCommerce
     */
    public function sync_addresses_to_woocommerce($request) {
        $user_id = $request->get_param('user_id');
        
        // Get addresses from WordPress storage
        $addresses = $this->get_wordpress_addresses($user_id);
        
        if (empty($addresses)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'No addresses to sync'
            ), 400);
        }
        
        $synced_count = 0;
        $errors = array();
        
        foreach ($addresses as $address) {
            $result = $this->update_woocommerce_address($user_id, $address);
            if ($result) {
                $synced_count++;
            } else {
                $errors[] = "Failed to sync {$address['type']} address";
            }
        }
        
        return new WP_REST_Response(array(
            'success' => $synced_count > 0,
            'synced_count' => $synced_count,
            'total_count' => count($addresses),
            'errors' => $errors,
            'message' => "Synced {$synced_count} of " . count($addresses) . " addresses"
        ), 200);
    }
    
    /**
     * Get addresses from WooCommerce
     */
    private function get_woocommerce_addresses($user_id) {
        if (!class_exists('WC_API_Client')) {
            return false;
        }
        
        try {
            $customer = new WC_Customer($user_id);
            if (!$customer->get_id()) {
                return false;
            }
            
            $addresses = array();
            
            // Billing address
            if ($customer->get_billing_first_name() || $customer->get_billing_last_name()) {
                $addresses[] = array(
                    'id' => 'billing',
                    'type' => 'billing',
                    'isDefault' => false,
                    'name' => trim($customer->get_billing_first_name() . ' ' . $customer->get_billing_last_name()),
                    'street' => $customer->get_billing_address_1(),
                    'city' => $customer->get_billing_city(),
                    'state' => $customer->get_billing_state(),
                    'postcode' => $customer->get_billing_postcode(),
                    'country' => $customer->get_billing_country(),
                    'phone' => $customer->get_billing_phone(),
                    'company' => $customer->get_billing_company()
                );
            }
            
            // Shipping address
            if ($customer->get_shipping_first_name() || $customer->get_shipping_last_name()) {
                $addresses[] = array(
                    'id' => 'shipping',
                    'type' => 'shipping',
                    'isDefault' => true,
                    'name' => trim($customer->get_shipping_first_name() . ' ' . $customer->get_shipping_last_name()),
                    'street' => $customer->get_shipping_address_1(),
                    'city' => $customer->get_shipping_city(),
                    'state' => $customer->get_shipping_state(),
                    'postcode' => $customer->get_shipping_postcode(),
                    'country' => $customer->get_shipping_country(),
                    'phone' => $customer->get_shipping_phone(),
                    'company' => $customer->get_shipping_company()
                );
            }
            
            return $addresses;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Get addresses from WordPress options
     */
    private function get_wordpress_addresses($user_id) {
        $addresses = get_option("eternitty_user_addresses_{$user_id}", array());
        
        // If no addresses exist, create default ones
        if (empty($addresses)) {
            $addresses = $this->create_default_addresses_for_user($user_id);
        }
        
        return $addresses;
    }
    
    /**
     * Update address in WooCommerce
     */
    private function update_woocommerce_address($user_id, $address_data) {
        if (!class_exists('WC_Customer')) {
            return false;
        }
        
        try {
            $customer = new WC_Customer($user_id);
            if (!$customer->get_id()) {
                return false;
            }
            
            $type = $address_data['type'];
            $name_parts = explode(' ', $address_data['name'], 2);
            
            if ($type === 'billing') {
                $customer->set_billing_first_name($name_parts[0]);
                $customer->set_billing_last_name(isset($name_parts[1]) ? $name_parts[1] : '');
                $customer->set_billing_company($address_data['company'] ?? '');
                $customer->set_billing_address_1($address_data['street']);
                $customer->set_billing_city($address_data['city']);
                $customer->set_billing_state($address_data['state'] ?? '');
                $customer->set_billing_postcode($address_data['postcode'] ?? '');
                $customer->set_billing_country($address_data['country'] ?? '');
                $customer->set_billing_phone($address_data['phone'] ?? '');
            } else {
                $customer->set_shipping_first_name($name_parts[0]);
                $customer->set_shipping_last_name(isset($name_parts[1]) ? $name_parts[1] : '');
                $customer->set_shipping_company($address_data['company'] ?? '');
                $customer->set_shipping_address_1($address_data['street']);
                $customer->set_shipping_city($address_data['city']);
                $customer->set_shipping_state($address_data['state'] ?? '');
                $customer->set_shipping_postcode($address_data['postcode'] ?? '');
                $customer->set_shipping_country($address_data['country'] ?? '');
                $customer->set_shipping_phone($address_data['phone'] ?? '');
            }
            
            $customer->save();
            
            return array(
                'id' => $type,
                'type' => $type,
                'isDefault' => $type === 'shipping',
                'name' => $address_data['name'],
                'street' => $address_data['street'],
                'city' => $address_data['city'],
                'state' => $address_data['state'] ?? '',
                'postcode' => $address_data['postcode'] ?? '',
                'country' => $address_data['country'] ?? '',
                'phone' => $address_data['phone'] ?? '',
                'company' => $address_data['company'] ?? ''
            );
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Update address in WordPress options
     */
    private function update_wordpress_address($user_id, $address_data) {
        $addresses = $this->get_wordpress_addresses($user_id);
        
        // Find and update the address
        $updated = false;
        foreach ($addresses as &$address) {
            if ($address['id'] === $address_data['id'] && $address['type'] === $address_data['type']) {
                $address = array_merge($address, $address_data);
                $updated = true;
                break;
            }
        }
        
        if ($updated) {
            update_option("eternitty_user_addresses_{$user_id}", $addresses);
        }
        
        return $address_data;
    }
    
    /**
     * Create address in WooCommerce
     */
    private function create_woocommerce_address($user_id, $address_data) {
        return $this->update_woocommerce_address($user_id, $address_data);
    }
    
    /**
     * Create address in WordPress options
     */
    private function create_wordpress_address($user_id, $address_data) {
        $addresses = $this->get_wordpress_addresses($user_id);
        
        // Check if address already exists
        foreach ($addresses as $address) {
            if ($address['id'] === $address_data['id'] && $address['type'] === $address_data['type']) {
                return $this->update_wordpress_address($user_id, $address_data);
            }
        }
        
        // Add new address
        $addresses[] = array(
            'id' => $address_data['id'] ?? $address_data['type'],
            'type' => $address_data['type'],
            'isDefault' => $address_data['type'] === 'shipping',
            'name' => $address_data['name'],
            'street' => $address_data['street'],
            'city' => $address_data['city'],
            'state' => $address_data['state'] ?? '',
            'postcode' => $address_data['postcode'] ?? '',
            'country' => $address_data['country'] ?? '',
            'phone' => $address_data['phone'] ?? '',
            'company' => $address_data['company'] ?? ''
        );
        
        update_option("eternitty_user_addresses_{$user_id}", $addresses);
        
        return end($addresses);
    }
    
    /**
     * Delete address from WooCommerce
     */
    private function delete_woocommerce_address($user_id, $address_data) {
        if (!class_exists('WC_Customer')) {
            return false;
        }
        
        try {
            $customer = new WC_Customer($user_id);
            if (!$customer->get_id()) {
                return false;
            }
            
            $type = $address_data['type'];
            
            if ($type === 'billing') {
                $customer->set_billing_first_name('');
                $customer->set_billing_last_name('');
                $customer->set_billing_company('');
                $customer->set_billing_address_1('');
                $customer->set_billing_city('');
                $customer->set_billing_state('');
                $customer->set_billing_postcode('');
                $customer->set_billing_country('');
                $customer->set_billing_phone('');
            } else {
                $customer->set_shipping_first_name('');
                $customer->set_shipping_last_name('');
                $customer->set_shipping_company('');
                $customer->set_shipping_address_1('');
                $customer->set_shipping_city('');
                $customer->set_shipping_state('');
                $customer->set_shipping_postcode('');
                $customer->set_shipping_country('');
                $customer->set_shipping_phone('');
            }
            
            $customer->save();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Delete address from WordPress options
     */
    private function delete_wordpress_address($user_id, $address_data) {
        $addresses = $this->get_wordpress_addresses($user_id);
        
        // Remove the address
        $addresses = array_filter($addresses, function($address) use ($address_data) {
            return !($address['id'] === $address_data['id'] && $address['type'] === $address_data['type']);
        });
        
        update_option("eternitty_user_addresses_{$user_id}", array_values($addresses));
        
        return true;
    }
    
    /**
     * Create default addresses for a user
     */
    private function create_default_addresses_for_user($user_id) {
        $user = get_user_by('id', $user_id);
        $user_name = $user ? $user->display_name : 'User';
        
        $default_addresses = array(
            array(
                'id' => 'billing',
                'type' => 'billing',
                'isDefault' => false,
                'name' => $user_name,
                'street' => '123 Main Street',
                'city' => 'Pune',
                'state' => 'Maharashtra',
                'postcode' => '411001',
                'country' => 'IN',
                'phone' => '+919876543210',
                'company' => 'Your Company'
            ),
            array(
                'id' => 'shipping',
                'type' => 'shipping',
                'isDefault' => true,
                'name' => $user_name,
                'street' => '456 Oak Avenue',
                'city' => 'Pune',
                'state' => 'Maharashtra',
                'postcode' => '411002',
                'country' => 'IN',
                'phone' => '+919876543210',
                'company' => 'Your Company'
            )
        );
        
        update_option("eternitty_user_addresses_{$user_id}", $default_addresses);
        
        return $default_addresses;
    }
    
    /**
     * Create default addresses for existing users
     */
    private function create_default_addresses() {
        // This method can be called to create default addresses for existing users
        // For now, we'll create them on-demand
    }
}

// Initialize the plugin
new HeadlessAddressManager();
