#!/usr/bin/env node

// Simple API test script
const https = require('https');
const http = require('http');

console.log('🧪 Testing ZestBet API...');

// Test endpoints
const endpoints = [
  {
    name: 'Lambda API Health',
    url: 'https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default/trpc/example.hi'
  },
  {
    name: 'Database Connection',
    url: 'https://pbhx6vg2y2.execute-api.eu-central-1.amazonaws.com/default/api/health'
  }
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'GET',
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ ${endpoint.name}: ${res.statusCode} - ${data.slice(0, 100)}...`);
        resolve({ success: true, status: res.statusCode });
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${endpoint.name}: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
    
    req.on('timeout', () => {
      console.log(`⏰ ${endpoint.name}: Timeout`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('\n🔍 Testing API endpoints...');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('\n🎉 API tests completed!');
}

runTests().catch(console.error);