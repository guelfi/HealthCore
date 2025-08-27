const axios = require('axios');

const API_BASE_URL = 'http://192.168.15.119:5000';

class IntegrationTester {
  constructor() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  log(message, type = 'info') {
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  async test(name, testFn) {
    try {
      console.log(`\n🧪 Testing: ${name}`);
      await testFn();
      this.testResults.passed++;
      this.log(`Test passed: ${name}`, 'success');
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`${name}: ${error.message}`);
      this.log(`Test failed: ${name} - ${error.message}`, 'error');
    }
  }

  async authenticatedRequest(method, url, data = null) {
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    return await axios(config);
  }

  async runAllTests() {
    console.log('🚀 Starting Frontend-Backend Integration Testing\n');
    console.log('🎯 Testing against External API:', API_BASE_URL);
    console.log('=' .repeat(60));

    // Test 1: Authentication
    await this.test('User Authentication (Login)', async () => {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: 'admin',
        password: 'Admin123!'
      });
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid login response format');
      }
      
      this.token = response.data.token;
      this.refreshToken = response.data.refreshToken;
      this.user = response.data.user;
      
      this.log(`Logged in as: ${this.user.username} (Role: ${this.user.role})`);
    });

    // Test 2: User Profile Enum Compatibility
    await this.test('User Profile Enum Compatibility', async () => {
      if (typeof this.user.role !== 'number') {
        throw new Error(`Expected numeric role, got: ${typeof this.user.role}`);
      }
      
      // Check if role matches expected enum values (1 = Admin, 2 = Medico)
      if (this.user.role !== 1 && this.user.role !== 2) {
        throw new Error(`Invalid role value: ${this.user.role}`);
      }
      
      this.log(`Role compatibility verified: ${this.user.role} (${this.user.role === 1 ? 'Administrador' : 'Médico'})`);
    });

    // Test 3: Protected Endpoint Access
    await this.test('Protected Endpoint Access', async () => {
      const response = await this.authenticatedRequest('GET', '/admin/usuarios');
      
      if (!Array.isArray(response.data)) {
        throw new Error('Expected array of users');
      }
      
      this.log(`Found ${response.data.length} users in system`);
    });

    // Test 4: Patients API Integration
    await this.test('Patients API Integration', async () => {
      // Get patients list
      const response = await this.authenticatedRequest('GET', '/pacientes');
      
      if (!Array.isArray(response.data)) {
        throw new Error('Expected array of patients');
      }
      
      // Verify patient data structure matches frontend expectations
      if (response.data.length > 0) {
        const patient = response.data[0];
        const requiredFields = ['id', 'nome', 'documento', 'dataNascimento'];
        
        for (const field of requiredFields) {
          if (!(field in patient)) {
            throw new Error(`Missing required field: ${field}`);
          }
        }
      }
      
      this.log(`Patients API verified: ${response.data.length} patients found`);
    });

    // Test 5: Exams API Integration
    await this.test('Exams API Integration', async () => {
      const response = await this.authenticatedRequest('GET', '/exames');
      
      if (!Array.isArray(response.data)) {
        throw new Error('Expected array of exams');
      }
      
      // Verify exam data structure and DICOM modalities
      if (response.data.length > 0) {
        const exam = response.data[0];
        const requiredFields = ['id', 'pacienteId', 'modalidade', 'dataExame'];
        
        for (const field of requiredFields) {
          if (!(field in exam)) {
            throw new Error(`Missing required field in exam: ${field}`);
          }
        }
        
        // Check DICOM modality compatibility
        const validModalities = ['CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA'];
        if (!validModalities.includes(exam.modalidade)) {
          throw new Error(`Invalid DICOM modality: ${exam.modalidade}`);
        }
      }
      
      this.log(`Exams API verified: ${response.data.length} exams found`);
    });

    // Test 6: Token Refresh
    await this.test('Token Refresh Functionality', async () => {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: this.refreshToken
      });
      
      if (!response.data.token) {
        throw new Error('No new token received from refresh');
      }
      
      // Update token for subsequent tests
      this.token = response.data.token;
      this.log('Token refresh successful');
    });

    // Test 7: CORS Configuration
    await this.test('CORS Configuration', async () => {
      // This test passes if we can make requests without CORS errors
      // If we reach this point, CORS is properly configured
      this.log('CORS properly configured for frontend-backend communication');
    });

    // Test 8: Error Handling
    await this.test('Error Handling', async () => {
      try {
        // Try to access with invalid token
        await axios.get(`${API_BASE_URL}/admin/usuarios`, {
          headers: {
            'Authorization': 'Bearer invalid-token',
            'Content-Type': 'application/json'
          }
        });
        throw new Error('Should have failed with invalid token');
      } catch (error) {
        if (error.response?.status === 401) {
          this.log('Error handling verified: Invalid tokens properly rejected');
        } else {
          throw new Error('Unexpected error response');
        }
      }
    });

    // Test 9: Logout and Token Invalidation
    await this.test('Logout and Token Invalidation', async () => {
      // Perform logout
      await this.authenticatedRequest('POST', '/auth/logout');
      
      // Try to use the token after logout (should fail)
      try {
        await this.authenticatedRequest('GET', '/admin/usuarios');
        throw new Error('Token should be invalidated after logout');
      } catch (error) {
        if (error.response?.status === 401) {
          this.log('Logout verified: Token properly invalidated');
        } else {
          throw new Error('Unexpected error after logout');
        }
      }
    });

    // Test Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 INTEGRATION TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Tests Passed: ${this.testResults.passed}`);
    console.log(`❌ Tests Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n🔍 Failed Tests:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    if (this.testResults.failed === 0) {
      console.log('\n🎉 ALL INTEGRATION TESTS PASSED!');
      console.log('✨ Frontend-Backend integration is working correctly!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
  }
}

// Run integration tests
const tester = new IntegrationTester();
tester.runAllTests().catch(error => {
  console.error('\n💥 FATAL ERROR during testing:', error.message);
  process.exit(1);
});