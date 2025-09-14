<?php
/**
 * WordPress Menu API Endpoint
 * 
 * Add this code to your WordPress functions.php or create a simple plugin
 * This will enable the menu API endpoint for the frontend
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Register menu endpoint
add_action('rest_api_init', function () {
    register_rest_route('eternitty/v1', '/menus', array(
        'methods' => 'GET',
        'callback' => 'eternitty_get_menus',
        'permission_callback' => '__return_true', // Public endpoint
    ));
});

/**
 * Get WordPress menus with proper order
 */
function eternitty_get_menus() {
    $menus = array();
    
    // Get all registered menu locations
    $registered_menus = get_registered_nav_menus();
    
    foreach ($registered_menus as $location => $description) {
        $menu_object = wp_get_nav_menu_object($location);
        
        if ($menu_object) {
            $menu_items = wp_get_nav_menu_items($menu_object->term_id);
            
            if ($menu_items) {
                $menu_data = array(
                    'location' => $location,
                    'description' => $description,
                    'items' => array()
                );
                
                // Process menu items maintaining WordPress order
                foreach ($menu_items as $item) {
                    if ($item->menu_item_parent == 0) { // Only top-level items
                        $menu_data['items'][] = array(
                            'id' => $item->ID,
                            'title' => $item->title,
                            'url' => $item->url,
                            'target' => $item->target ?: '_self',
                            'description' => $item->description,
                            'children' => array()
                        );
                    }
                }
                
                $menus[$location] = $menu_data;
            }
        }
    }
    
    return $menus;
}

/**
 * Alternative: Get specific menu by location
 */
add_action('rest_api_init', function () {
    register_rest_route('eternitty/v1', '/menu/(?P<location>[a-zA-Z0-9-]+)', array(
        'methods' => 'GET',
        'callback' => 'eternitty_get_menu_by_location',
        'permission_callback' => '__return_true',
        'args' => array(
            'location' => array(
                'required' => true,
                'type' => 'string',
            ),
        ),
    ));
});

function eternitty_get_menu_by_location($request) {
    $location = $request['location'];
    
    $menu_object = wp_get_nav_menu_object($location);
    
    if (!$menu_object) {
        return new WP_Error('menu_not_found', 'Menu location not found', array('status' => 404));
    }
    
    $menu_items = wp_get_nav_menu_items($menu_object->term_id);
    
    if (!$menu_items) {
        return new WP_Error('menu_empty', 'Menu is empty', array('status' => 404));
    }
    
    $menu_data = array(
        'location' => $location,
        'description' => $menu_object->description,
        'items' => array()
    );
    
    // Process menu items maintaining WordPress order
    foreach ($menu_items as $item) {
        if ($item->menu_item_parent == 0) { // Only top-level items
            $menu_data['items'][] = array(
                'id' => $item->ID,
                'title' => $item->title,
                'url' => $item->url,
                'target' => $item->target ?: '_self',
                'description' => $item->description,
                'children' => array()
            );
        }
    }
    
    return $menu_data;
}
?>
