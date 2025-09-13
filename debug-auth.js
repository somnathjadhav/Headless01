/**
 * Debug Authentication Logic
 * Test the exact same logic as our signin API
 */

const WORDPRESS_URL = 'https://staging.eternitty.com/headless-woo';

async function debugAuth() {
  console.log('🔍 Debugging Authentication Logic...\n');
  
  const email = 'headless';
  const password = 'NextGenWooComm@26';
  
  try {
    // Step 1: Find user
    console.log('Step 1: Finding user...');
    const usersResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}`);
    console.log('Users API Status:', usersResponse.status);
    
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log('Users found:', users.length);
      
      if (users.length > 0) {
        const wpUser = users.find(u => 
          u.email === email || 
          u.slug === email || 
          u.name === email
        ) || users[0];
        
        console.log('Selected user:', {
          id: wpUser.id,
          name: wpUser.name,
          slug: wpUser.slug,
          email: wpUser.email
        });
        
        const username = wpUser.slug;
        
        // Step 2: Test WordPress Login
        console.log('\nStep 2: Testing WordPress Login...');
        const loginUrl = `${WORDPRESS_URL}/wp-login.php`;
        
        const loginResponse = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            log: username,
            pwd: password,
            'wp-submit': 'Log In',
            'redirect_to': `${WORDPRESS_URL}/wp-admin/`,
            testcookie: '1'
          }),
          redirect: 'manual'
        });
        
        console.log('Login Response Status:', loginResponse.status);
        
        const cookies = loginResponse.headers.get('set-cookie');
        const responseText = await loginResponse.text();
        
        console.log('Response Text Length:', responseText.length);
        console.log('Cookies:', cookies);
        console.log('Has wordpress_logged_in_:', cookies?.includes('wordpress_logged_in_'));
        
        // Test our authentication logic
        console.log('\nStep 3: Testing Authentication Logic...');
        
        const isLoggedIn = cookies && (
          cookies.includes('wordpress_logged_in_') && 
          !responseText.includes('ERROR') &&
          !responseText.includes('Invalid username') &&
          !responseText.includes('The password you entered') &&
          !responseText.includes('Lost your password') &&
          (responseText.includes('Dashboard') || 
           responseText.includes('wp-admin') ||
           responseText.includes('Log out') ||
           responseText.includes('wp-content') ||
           responseText.includes('admin-bar'))
        );
        
        console.log('Authentication Result:', isLoggedIn);
        console.log('Response contains "wp-admin":', responseText.includes('wp-admin'));
        console.log('Response contains "wp-content":', responseText.includes('wp-content'));
        console.log('Response contains "admin-bar":', responseText.includes('admin-bar'));
        console.log('Response contains "Dashboard":', responseText.includes('Dashboard'));
        console.log('Response contains "Log out":', responseText.includes('Log out'));
        console.log('Response contains "wp-includes":', responseText.includes('wp-includes'));
        console.log('Response contains "wp-json":', responseText.includes('wp-json'));
        
        // Check for error patterns
        console.log('\nError Pattern Checks:');
        console.log('Contains "ERROR":', responseText.includes('ERROR'));
        console.log('Contains "Invalid username":', responseText.includes('Invalid username'));
        console.log('Contains "The password you entered":', responseText.includes('The password you entered'));
        console.log('Contains "Lost your password":', responseText.includes('Lost your password'));
        console.log('Contains "incorrect":', responseText.includes('incorrect'));
        console.log('Contains "wrong":', responseText.includes('wrong'));
        console.log('Contains "failed":', responseText.includes('failed'));
        
        // Show first 500 characters of response
        console.log('\nFirst 500 characters of response:');
        console.log(responseText.substring(0, 500));
        
        if (isLoggedIn) {
          console.log('✅ LOGIN SUCCESS!');
        } else {
          console.log('❌ LOGIN FAILED');
        }
        
      } else {
        console.log('❌ No users found');
      }
    } else {
      console.log('❌ Users API failed:', usersResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the debug
debugAuth().catch(console.error);
