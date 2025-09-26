#!/usr/bin/env node

console.log('🚀 Testing ZestBet API Connection...\n');

async function testAPI() {
  const baseUrl = 'https://zestapp.online';
  
  try {
    // Test 1: Basic API health check
    console.log('1️⃣ Testing basic API health...');
    const healthResponse = await fetch(`${baseUrl}/api`);
    const healthData = await healthResponse.json();
    console.log('✅ API Health:', healthData);
    
    // Test 2: Status endpoint
    console.log('\n2️⃣ Testing status endpoint...');
    const statusResponse = await fetch(`${baseUrl}/api/status`);
    const statusData = await statusResponse.json();
    console.log('✅ API Status:', statusData);
    
    // Test 3: tRPC endpoint
    console.log('\n3️⃣ Testing tRPC endpoint...');
    const trpcResponse = await fetch(`${baseUrl}/api/trpc/example.hi`);
    console.log('📡 tRPC Response Status:', trpcResponse.status);
    
    if (trpcResponse.ok) {
      const trpcData = await trpcResponse.json();
      console.log('✅ tRPC Data:', trpcData);
    } else {
      const errorText = await trpcResponse.text();
      console.log('❌ tRPC Error:', errorText.substring(0, 200));
    }
    
    console.log('\n🎉 API Test completed!');
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

testAPI();