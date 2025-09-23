#!/usr/bin/env node

// Simple mobile app test to verify tRPC connection
const API_BASE = 'https://rork-zestbet-global.vercel.app/api';
const TRPC_URL = `${API_BASE}/trpc`;

console.log('📱 ZestBet Mobile App Connection Test');
console.log('=====================================');
console.log(`Testing connection to: ${TRPC_URL}`);
console.log('');

// Simulate the exact request that the mobile app makes
async function testMobileAppConnection() {
  try {
    // This simulates the tRPC client request
    const response = await fetch(`${TRPC_URL}/example.hi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({})
    });

    console.log(`Response Status: ${response.status}`);
    console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    console.log(`Content-Type: ${contentType}`);
    
    const text = await response.text();
    console.log(`Response Body (first 500 chars): ${text.substring(0, 500)}`);
    
    if (contentType && contentType.includes('application/json')) {
      try {
        const json = JSON.parse(text);
        console.log('✅ Valid JSON Response:', json);
      } catch (_e) {
        console.log('❌ Invalid JSON despite content-type header');
      }
    } else {
      console.log('❌ Response is not JSON - this is the problem!');
      if (text.includes('<!DOCTYPE')) {
        console.log('🔍 Response appears to be HTML - likely a routing issue');
      }
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

// Test batch request (how tRPC actually works)
async function testBatchRequest() {
  console.log('\n🔄 Testing tRPC Batch Request...');
  
  try {
    const batchInput = {
      "0": {
        "json": null,
        "meta": {
          "values": ["undefined"]
        }
      }
    };
    
    const url = `${TRPC_URL}/example.hi?batch=1&input=${encodeURIComponent(JSON.stringify(batchInput))}`;
    console.log(`Request URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    console.log(`Batch Response Status: ${response.status}`);
    const text = await response.text();
    console.log(`Batch Response: ${text.substring(0, 300)}`);
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      try {
        const json = JSON.parse(text);
        console.log('✅ Valid Batch JSON Response:', json);
      } catch (_e) {
        console.log('❌ Invalid Batch JSON');
      }
    } else {
      console.log('❌ Batch response is not JSON');
    }
    
  } catch (error) {
    console.log('❌ Batch Request Error:', error.message);
  }
}

async function runMobileTests() {
  await testMobileAppConnection();
  await testBatchRequest();
  
  console.log('\n📋 Diagnosis:');
  console.log('If you see HTML responses, the issue is likely:');
  console.log('1. Vercel routing not working correctly');
  console.log('2. API endpoint not deployed properly');
  console.log('3. Environment variables missing in Vercel');
  console.log('\n🔧 Solutions:');
  console.log('1. Check Vercel deployment logs');
  console.log('2. Verify vercel.json routing configuration');
  console.log('3. Ensure api/index.ts is properly deployed');
  console.log('4. Check environment variables in Vercel dashboard');
}

runMobileTests().catch(console.error);