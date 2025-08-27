const axios = require('axios');

const API_BASE_URL = 'http://192.168.15.119:5000';

async function testLogoutFunctionality() {
  console.log('🔐 Testing Logout Functionality with External API\n');
  
  try {
    // Step 1: Test Login
    console.log('Step 1: Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'Admin123!'
    });
    
    const { token, refreshToken, user } = loginResponse.data;
    console.log('✅ Login successful');
    console.log(`   User: ${user.username} (Role: ${user.role})`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   Refresh Token: ${refreshToken.substring(0, 20)}...`);
    
    // Step 2: Test Authenticated Request
    console.log('\nStep 2: Testing authenticated request...');
    const testResponse = await axios.get(`${API_BASE_URL}/admin/usuarios`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Authenticated request successful');
    console.log(`   Found ${testResponse.data.length} users`);
    
    // Step 3: Test Logout
    console.log('\nStep 3: Testing logout...');
    const logoutResponse = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Logout successful');
    console.log(`   Response: ${logoutResponse.data.Message || logoutResponse.data.message}`);
    
    // Step 4: Test Token Invalidation (should fail)
    console.log('\nStep 4: Testing token invalidation...');
    try {
      await axios.get(`${API_BASE_URL}/admin/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('❌ ERROR: Token should be invalid after logout!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Token correctly invalidated after logout');
        console.log(`   Status: ${error.response.status} - ${error.response.statusText}`);
      } else {
        console.log('⚠️  Unexpected error:', error.message);
      }
    }
    
    console.log('\n🎉 Logout functionality test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testLogoutFunctionality();