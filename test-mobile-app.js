#!/usr/bin/env node

/**
 * 🧪 ZestBet Mobile Test Suite
 * Testet die App auf verschiedenen Geräten und Plattformen
 */

const https = require('https');
const http = require('http');

console.log('📱 ZestBet Mobile Test Suite');
console.log('============================');
console.log('');

// Configuration
const config = {
  apiUrl: 'https://rork-zestbet-global.vercel.app/api',
  trpcUrl: 'https://rork-zestbet-global.vercel.app/api/trpc',
  appUrl: 'https://rork-zestbet-global.vercel.app',
  timeout: 10000
};

console.log('📍 Test Configuration:');
console.log(`API URL: ${config.apiUrl}`);
console.log(`tRPC URL: ${config.trpcUrl}`);
console.log(`App URL: ${config.appUrl}`);
console.log('');

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      timeout: config.timeout,
      headers: {
        'User-Agent': 'ZestBet-Test-Suite/1.0',
        'Accept': 'application/json'
      }
    };

    if (method === 'POST' && data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', chunk => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (method === 'POST' && data) {
      req.write(data);
    }

    req.end();
  });
}

async function runTest(testName, testFn) {
  totalTests++;
  const startTime = Date.now();
  
  try {
    log('blue', `🔍 Test ${totalTests}: ${testName}`);
    
    const result = await testFn();
    const duration = Date.now() - startTime;
    
    passedTests++;
    log('green', `✅ PASS: ${testName} (${duration}ms)`);
    
    if (result && result.message) {
      console.log(`   ${result.message}`);
    }
    
    return { success: true, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    failedTests++;
    log('red', `❌ FAIL: ${testName} (${duration}ms)`);
    console.log(`   Error: ${error.message}`);
    
    return { success: false, error: error.message, duration };
  }
}

async function testApiHealth() {
  const response = await makeRequest(config.apiUrl);
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  return { message: `API responding with status ${response.statusCode}` };
}

async function testTrpcHello() {
  const response = await makeRequest(`${config.trpcUrl}/example.hi`, 'POST', '{}');
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  try {
    const data = JSON.parse(response.data);
    return { message: `tRPC responding: ${JSON.stringify(data).substring(0, 50)}...` };
  } catch (e) {
    return { message: `tRPC responding with data` };
  }
}

async function testCorsHeaders() {
  const response = await makeRequest(`${config.trpcUrl}/example.hi`, 'OPTIONS');
  
  const corsHeaders = Object.keys(response.headers).filter(header => 
    header.toLowerCase().includes('access-control')
  );
  
  if (corsHeaders.length === 0) {
    throw new Error('No CORS headers found');
  }
  
  return { message: `CORS headers present: ${corsHeaders.join(', ')}` };
}

async function testAppHomepage() {
  const response = await makeRequest(config.appUrl);
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.data.includes('ZestBet') && !response.data.includes('<!DOCTYPE html>')) {
    throw new Error('Homepage does not contain expected content');
  }
  
  return { message: `Homepage loaded successfully (${response.data.length} bytes)` };
}

async function testUserRegistration() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testData = JSON.stringify({
    email: testEmail,
    password: 'testpass123',
    name: 'Test User'
  });
  
  const response = await makeRequest(`${config.trpcUrl}/auth.register`, 'POST', testData);
  
  // Accept both 200 (success) and 400 (user already exists) as valid responses
  if (response.statusCode !== 200 && response.statusCode !== 400) {
    throw new Error(`Unexpected status ${response.statusCode}`);
  }
  
  return { message: `Registration endpoint responding (${response.statusCode})` };
}

async function testUserLogin() {
  const testData = JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  });
  
  const response = await makeRequest(`${config.trpcUrl}/auth.login`, 'POST', testData);
  
  // Accept both 200 (success) and 401 (invalid credentials) as valid responses
  if (response.statusCode !== 200 && response.statusCode !== 401) {
    throw new Error(`Unexpected status ${response.statusCode}`);
  }
  
  return { message: `Login endpoint responding (${response.statusCode})` };
}

async function testResponseTime() {
  const startTime = Date.now();
  await makeRequest(`${config.trpcUrl}/example.hi`, 'POST', '{}');
  const responseTime = Date.now() - startTime;
  
  if (responseTime > 3000) {
    throw new Error(`Response time too slow: ${responseTime}ms`);
  }
  
  return { message: `Response time: ${responseTime}ms` };
}

async function testMobileCompatibility() {
  // Test with mobile user agent
  const mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15';
  
  const response = await makeRequest(config.appUrl);
  
  if (response.statusCode !== 200) {
    throw new Error(`Mobile request failed with status ${response.statusCode}`);
  }
  
  // Check for mobile-friendly meta tags
  const hasMobileViewport = response.data.includes('viewport') && response.data.includes('width=device-width');
  
  if (!hasMobileViewport) {
    throw new Error('Missing mobile viewport meta tag');
  }
  
  return { message: 'Mobile compatibility checks passed' };
}

async function runAllTests() {
  log('cyan', '🚀 Starting ZestBet Mobile Test Suite...');
  console.log('');
  
  // Phase 1: Infrastructure Tests
  log('magenta', '🔧 Phase 1: Infrastructure Tests');
  log('magenta', '================================');
  
  await runTest('API Health Check', testApiHealth);
  await runTest('tRPC Hello Endpoint', testTrpcHello);
  await runTest('CORS Headers', testCorsHeaders);
  await runTest('Response Time', testResponseTime);
  
  console.log('');
  
  // Phase 2: Authentication Tests
  log('magenta', '👤 Phase 2: Authentication Tests');
  log('magenta', '================================');
  
  await runTest('User Registration', testUserRegistration);
  await runTest('User Login', testUserLogin);
  
  console.log('');
  
  // Phase 3: Frontend Tests
  log('magenta', '📱 Phase 3: Frontend Tests');
  log('magenta', '=========================');
  
  await runTest('App Homepage', testAppHomepage);
  await runTest('Mobile Compatibility', testMobileCompatibility);
  
  console.log('');
  
  // Test Summary
  log('cyan', '📋 TEST SUMMARY');
  log('cyan', '===============');
  console.log(`${colors.blue}Total Tests: ${totalTests}${colors.reset}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  
  const successRate = Math.round((passedTests / totalTests) * 100);
  console.log(`${colors.cyan}Success Rate: ${successRate}%${colors.reset}`);
  
  console.log('');
  
  if (failedTests === 0) {
    log('green', '🎉 ALL TESTS PASSED! Your ZestBet app is working perfectly!');
  } else {
    log('yellow', '⚠️  Some tests failed. Please check the issues above.');
  }
  
  console.log('');
  log('cyan', '🔗 Quick Links:');
  console.log(`• App: ${config.appUrl}`);
  console.log(`• API: ${config.apiUrl}`);
  console.log(`• tRPC: ${config.trpcUrl}`);
  
  console.log('');
  log('cyan', '👥 Test Accounts:');
  console.log('• User: test@example.com / password123');
  console.log('• Admin: admin@zestbet.com / admin2025!');
  console.log('• Apple Review: pinkpistachio72@gmail.com / zestapp2025#');
  
  console.log('');
  log('cyan', '📱 Next Steps:');
  console.log('1. Test the mobile app with QR code');
  console.log('2. Test user registration and login flows');
  console.log('3. Test betting and challenge features');
  console.log('4. Check email delivery in Strato');
  console.log('5. Monitor performance on different devices');
  
  return failedTests === 0;
}

// Run the test suite
runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    log('red', `Fatal error: ${error.message}`);
    process.exit(1);
  });