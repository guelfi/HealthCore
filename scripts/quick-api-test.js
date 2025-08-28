const axios = require('axios');

async function quickAPITest() {
  try {
    const response = await axios.get('http://192.168.15.119:5000', { timeout: 5000 });
    console.log('✅ API is running');
    console.log('Status:', response.status);
    return true;
  } catch (error) {
    console.log('❌ API connection failed:', error.message);
    return false;
  }
}

quickAPITest();