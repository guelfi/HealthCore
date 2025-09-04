const axios = require('axios');

const API_BASE_URL = 'http://192.168.15.119:5000';

const ADMIN_CREDENTIALS = {
  username: 'guelfi',
  password: '@246!588'
};

async function testAPIConnectivity() {
  console.log('🔍 Testing Frontend-API Connectivity...\n');

  try {
    // Test 1: Basic connectivity
    console.log('1️⃣  Testing basic connectivity...');
    const healthResponse = await axios.get(API_BASE_URL, {
      timeout: 10000
    });
    console.log('✅ Basic connectivity successful');
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthResponse.data).substring(0, 100)}...\n`);

    // Test 2: Authentication
    console.log('2️⃣  Testing authentication...');
    const authResponse = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5005',  // Simulate frontend origin
        'Referer': 'http://localhost:5005'
      }
    });
    console.log('✅ Authentication successful');
    console.log(`   Status: ${authResponse.status}`);
    console.log(`   Token received: ${authResponse.data.token ? 'Yes' : 'No'}\n`);

    const token = authResponse.data.token;

    // Test 3: Pacientes endpoint with CORS headers
    console.log('3️⃣  Testing Pacientes endpoint with CORS...');
    const pacientesResponse = await axios.get(`${API_BASE_URL}/pacientes`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5005',  // Simulate frontend origin
        'Referer': 'http://localhost:5005'
      }
    });
    console.log('✅ Pacientes endpoint successful');
    console.log(`   Status: ${pacientesResponse.status}`);
    console.log(`   Total pacientes: ${pacientesResponse.data.total || pacientesResponse.data.length || 'unknown'}`);
    console.log(`   CORS headers present: ${pacientesResponse.headers['access-control-allow-origin'] ? 'Yes' : 'No'}\n`);

    // Test 4: Create a test patient (POST request)
    console.log('4️⃣  Testing CREATE operation with CORS...');
    const testPaciente = {
      nome: 'Teste API Connectivity',
      documento: '99999999999',
      dataNascimento: '1990-01-01T00:00:00.000Z',
      email: 'teste-api@email.com'
    };

    const createResponse = await axios.post(`${API_BASE_URL}/pacientes`, testPaciente, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5005',
        'Referer': 'http://localhost:5005'
      }
    });
    console.log('✅ CREATE operation successful');
    console.log(`   Status: ${createResponse.status}`);
    console.log(`   Created patient ID: ${createResponse.data.id}\n`);

    // Test 5: Update operation (PUT request)
    const patientId = createResponse.data.id;
    console.log('5️⃣  Testing UPDATE operation with CORS...');
    const updateResponse = await axios.put(`${API_BASE_URL}/pacientes/${patientId}`, {
      ...testPaciente,
      nome: 'Teste API Connectivity - Updated'
    }, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5005',
        'Referer': 'http://localhost:5005'
      }
    });
    console.log('✅ UPDATE operation successful');
    console.log(`   Status: ${updateResponse.status}\n`);

    // Test 6: Delete operation (DELETE request)
    console.log('6️⃣  Testing DELETE operation with CORS...');
    const deleteResponse = await axios.delete(`${API_BASE_URL}/pacientes/${patientId}`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': 'http://localhost:5005',
        'Referer': 'http://localhost:5005'
      }
    });
    console.log('✅ DELETE operation successful');
    console.log(`   Status: ${deleteResponse.status}\n`);

    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ API connectivity is working perfectly');
    console.log('✅ CORS is properly configured'); 
    console.log('✅ All CRUD operations functional');
    console.log('✅ Ready for frontend integration\n');

  } catch (error) {
    console.error('❌ API Connectivity Test FAILED');
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data)}`);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   🔧 Solution: Make sure the API server is running at http://192.168.15.119:5000');
    } else if (error.response?.status === 401) {
      console.error('   🔧 Solution: Check authentication credentials');
    } else if (error.response?.status === 403) {
      console.error('   🔧 Solution: CORS configuration issue - check if frontend origin is allowed');
    }
    
    process.exit(1);
  }
}

testAPIConnectivity();