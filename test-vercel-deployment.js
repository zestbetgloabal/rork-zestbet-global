#!/usr/bin/env node

// Test script to verify API deployment
const testApiDeployment = async () => {
  console.log('🔍 Testing ZestBet API Deployment...\n');
  
  const baseUrl = 'https://rork-zestbet-global.vercel.app';
  const endpoints = [
    { path: '/api', name: 'API Root' },
    { path: '/api/status', name: 'Status Check' },
    { path: '/api/trpc/example.hi', name: 'tRPC Example' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}: ${baseUrl}${endpoint.path}`);
      
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'ZestBet-Test/1.0'
        }
      });
      
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      const contentType = response.headers.get('content-type');
      console.log(`  Content-Type: ${contentType}`);
      
      const text = await response.text();
      
      if (contentType?.includes('application/json')) {
        try {
          const json = JSON.parse(text);
          console.log(`  ✅ JSON Response:`, JSON.stringify(json, null, 2));
        } catch (e) {
          console.log(`  ❌ Invalid JSON:`, text.substring(0, 100));
        }
      } else {
        console.log(`  ❌ HTML Response (likely error page):`, text.substring(0, 100));
      }
      
    } catch (error) {
      console.log(`  ❌ Network Error:`, error.message);
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Test registration endpoint
  console.log('🧪 Testing Registration Endpoint...');
  try {
    const response = await fetch(`${baseUrl}/api/trpc/auth.register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User'
      })
    });
    
    console.log(`Registration test status: ${response.status}`);
    const text = await response.text();
    console.log(`Registration response:`, text.substring(0, 200));
    
  } catch (error) {
    console.log(`Registration test error:`, error.message);
  }
  
  console.log('\n🏁 API Test Complete');
};

testApiDeployment().catch(console.error);