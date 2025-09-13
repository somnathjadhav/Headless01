/**
 * Debug Login Test
 * Test the WordPress login process step by step
 */

const WORDPRESS_URL = 'https://staging.eternitty.com/headless-woo';

async function debugLogin() {
  console.log('🔍 Debugging WordPress Login Process...\n');
  
  const email = 'headless';
  const password = 'Somnath@3230';
  
  try {
    // Step 1: Test WordPress Users API
    console.log('Step 1: Testing WordPress Users API...');
    const usersResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}`);
    console.log('Users API Status:', usersResponse.status);
    
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log('Users found:', users.length);
      if (users.length > 0) {
        const user = users[0];
        console.log('User details:', {
          id: user.id,
          name: user.name,
          slug: user.slug,
          email: user.email
        });
        
        // Step 2: Test WordPress Login
        console.log('\nStep 2: Testing WordPress Login...');
        const loginUrl = `${WORDPRESS_URL}/wp-login.php`;
        
        const loginResponse = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            log: user.slug,
            pwd: password,
            'wp-submit': 'Log In',
            'redirect_to': `${WORDPRESS_URL}/wp-admin/`,
            testcookie: '1'
          }),
          redirect: 'manual'
        });
        
        console.log('Login Response Status:', loginResponse.status);
        console.log('Login Response Headers:', Object.fromEntries(loginResponse.headers.entries()));
        
        const responseText = await loginResponse.text();
        console.log('Response Text Length:', responseText.length);
        console.log('Response contains "Dashboard":', responseText.includes('Dashboard'));
        console.log('Response contains "wp-admin":', responseText.includes('wp-admin'));
        console.log('Response contains "Log out":', responseText.includes('Log out'));
        console.log('Response contains "ERROR":', responseText.includes('ERROR'));
        console.log('Response contains "Invalid username":', responseText.includes('Invalid username'));
        console.log('Response contains "The password you entered":', responseText.includes('The password you entered'));
        
        const cookies = loginResponse.headers.get('set-cookie');
        console.log('Cookies:', cookies);
        console.log('Has wordpress_logged_in_:', cookies?.includes('wordpress_logged_in_'));
        
      } else {
        console.log('❌ No users found with email:', email);
      }
    } else {
      console.log('❌ Users API failed:', usersResponse.status, usersResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error.message);
    console.error('Error details:', error);
  }
}

// Run the debug
debugLogin().catch(console.error);
