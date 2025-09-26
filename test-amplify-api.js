#!/usr/bin/env node

console.log('🧪 Testing AWS Amplify API Configuration...\n');

const BASE_URL = 'https://zestapp.online';

async function testEndpoint(url, description) {
  try {
    console.log(`Testing ${description}: ${url}`);
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    
    console.log(`  Status: ${response.status} ${response.statusText}`);
    console.log(`  Content-Type: ${contentType}`);
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      console.log(`  Response:`, JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log(`  Response (first 200 chars):`, text.substring(0, 200));
    }
    
    console.log(`  ✅ ${description} - OK\n`);
    return true;
  } catch (error) {
    console.log(`  ❌ ${description} - ERROR:`, error.message);
    console.log('');
    return false;
  }
}

async function main() {
  console.log('=== AWS AMPLIFY API TESTS ===\n');
  
  const tests = [
    [`${BASE_URL}/api`, 'API Root'],
    [`${BASE_URL}/api/status`, 'API Status'],
    [`${BASE_URL}/status`, 'Status (Lambda)'],
    [`${BASE_URL}/health`, 'Health Check'],
    [`${BASE_URL}/`, 'Lambda Root'],
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const [url, description] of tests) {
    const success = await testEndpoint(url, description);
    if (success) passed++;
  }
  
  console.log('=== SUMMARY ===');
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your AWS Amplify API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check your AWS Amplify deployment.');
    console.log('\nNext steps:');
    console.log('1. Make sure your changes are committed to Git');
    console.log('2. Check AWS Amplify console for deployment status');
    console.log('3. Verify your Lambda function is deployed correctly');
  }
}

main().catch(console.error);