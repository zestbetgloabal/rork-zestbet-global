#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Test configuration
const API_BASE = 'https://rork-zestbet-global.vercel.app/api';
const TRPC_URL = `${API_BASE}/trpc`;

console.log('🔍 ZestBet API Detailed Test');
console.log('============================');
console.log(`API Base: ${API_BASE}`);
console.log(`tRPC URL: ${TRPC_URL}`);
console.log('');

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ZestBet-Test/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (_e) {
          resolve({ status: res.statusCode, headers: res.headers, data, raw: true });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log('1️⃣ Testing Health Endpoint...');
  try {
    const result = await makeRequest(`${API_BASE}/`);
    console.log(`   Status: ${result.status}`);
    if (result.raw) {
      console.log(`   ❌ Response is not JSON: ${result.data.substring(0, 100)}...`);
    } else {
      console.log(`   ✅ Response: ${JSON.stringify(result.data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');
}

async function testStatusEndpoint() {
  console.log('2️⃣ Testing Status Endpoint...');
  try {
    const result = await makeRequest(`${API_BASE}/status`);
    console.log(`   Status: ${result.status}`);
    if (result.raw) {
      console.log(`   ❌ Response is not JSON: ${result.data.substring(0, 100)}...`);
    } else {
      console.log(`   ✅ Response: ${JSON.stringify(result.data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');
}

async function testTrpcEndpoint() {
  console.log('3️⃣ Testing tRPC Example Endpoint...');
  try {
    // Test the example.hi procedure
    const result = await makeRequest(`${TRPC_URL}/example.hi`, {
      method: 'POST',
      body: {}
    });
    console.log(`   Status: ${result.status}`);
    if (result.raw) {
      console.log(`   ❌ Response is not JSON: ${result.data.substring(0, 200)}...`);
      console.log(`   Content-Type: ${result.headers['content-type']}`);
    } else {
      console.log(`   ✅ Response: ${JSON.stringify(result.data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');
}

async function testTrpcBatch() {
  console.log('4️⃣ Testing tRPC Batch Request...');
  try {
    // Test batch request format
    const batchRequest = {
      "0": {
        "json": {},
        "meta": {
          "values": {}
        }
      }
    };
    
    const result = await makeRequest(`${TRPC_URL}/example.hi?batch=1&input=${encodeURIComponent(JSON.stringify(batchRequest))}`, {
      method: 'GET'
    });
    console.log(`   Status: ${result.status}`);
    if (result.raw) {
      console.log(`   ❌ Response is not JSON: ${result.data.substring(0, 200)}...`);
    } else {
      console.log(`   ✅ Response: ${JSON.stringify(result.data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');
}

async function testCors() {
  console.log('5️⃣ Testing CORS Headers...');
  try {
    const result = await makeRequest(`${API_BASE}/`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://rork-zestbet-global.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   CORS Headers:`);
    Object.keys(result.headers).forEach(key => {
      if (key.toLowerCase().includes('access-control')) {
        console.log(`     ${key}: ${result.headers[key]}`);
      }
    });
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');
}

// Run all tests
async function runTests() {
  await testHealthEndpoint();
  await testStatusEndpoint();
  await testTrpcEndpoint();
  await testTrpcBatch();
  await testCors();
  
  console.log('🏁 Test completed!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. If you see HTML responses instead of JSON, there might be a routing issue');
  console.log('2. Check Vercel deployment logs for any errors');
  console.log('3. Verify environment variables are set in Vercel dashboard');
  console.log('4. Test the mobile app with the corrected API endpoints');
}

runTests().catch(console.error);