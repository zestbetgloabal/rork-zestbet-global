#!/usr/bin/env node

const https = require('https');
const http = require('http');

const baseUrl = 'https://rork-zestbet-global-production.up.railway.app';

const testEndpoints = [
  '/',
  '/api',
  '/api/health',
  '/api/status',
  '/api/trpc',
];

async function testEndpoint(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 500), // Limit data length
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        error: error.message,
        success: false
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        error: 'Timeout',
        success: false
      });
    });
  });
}

async function testAllEndpoints() {
  console.log('🚀 Testing Railway deployment endpoints...\n');
  
  for (const endpoint of testEndpoints) {
    const fullUrl = baseUrl + endpoint;
    console.log(`Testing: ${fullUrl}`);
    
    const result = await testEndpoint(fullUrl);
    
    if (result.success) {
      console.log(`✅ SUCCESS (${result.status})`);
      if (result.data) {
        try {
          const json = JSON.parse(result.data);
          console.log(`   Response:`, JSON.stringify(json, null, 2));
        } catch {
          console.log(`   Response:`, result.data.substring(0, 200));
        }
      }
    } else {
      console.log(`❌ FAILED: ${result.error || result.status}`);
    }
    console.log('');
  }
  
  // Test tRPC endpoint specifically
  console.log('🔍 Testing tRPC endpoint with POST request...');
  
  const trpcUrl = baseUrl + '/api/trpc/example.hi';
  const postData = JSON.stringify({
    json: { name: 'TestUser' }
  });
  
  const trpcResult = await new Promise((resolve) => {
    const req = https.request(trpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        error: error.message,
        success: false
      });
    });
    
    req.write(postData);
    req.end();
  });
  
  if (trpcResult.success) {
    console.log(`✅ tRPC SUCCESS (${trpcResult.status})`);
    console.log(`   Response:`, trpcResult.data);
  } else {
    console.log(`❌ tRPC FAILED: ${trpcResult.error || trpcResult.status}`);
  }
}

testAllEndpoints().catch(console.error);