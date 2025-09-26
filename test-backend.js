#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing ZestBet Backend Connection...');
console.log('=====================================');

// Test function
async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const request = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✅ ${description}: ${res.statusCode} - ${json.message || json.status || 'OK'}`);
          resolve(true);
        } catch (_e) {
          console.log(`❌ ${description}: ${res.statusCode} - Invalid JSON response`);
          resolve(false);
        }
      });
    });

    request.on('error', (error) => {
      console.log(`❌ ${description}: Connection failed - ${error.message}`);
      resolve(false);
    });

    request.setTimeout(5000, () => {
      console.log(`❌ ${description}: Timeout`);
      request.destroy();
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('Testing backend endpoints...\n');

  const tests = [
    ['http://localhost:3001/api/', 'API Root'],
    ['http://localhost:3001/api/status', 'Status Endpoint'],
    ['http://localhost:3001/api/trpc', 'tRPC Endpoint']
  ];

  let passed = 0;
  for (const [url, description] of tests) {
    const result = await testEndpoint(url, description);
    if (result) passed++;
  }

  console.log(`\n📊 Test Results: ${passed}/${tests.length} passed`);
  
  if (passed === tests.length) {
    console.log('🎉 All tests passed! Backend is working correctly.');
    console.log('\n📱 You can now start your Expo app with:');
    console.log('   expo start');
  } else {
    console.log('⚠️  Some tests failed. Make sure the backend is running:');
    console.log('   node start-backend.js');
  }
}

runTests();