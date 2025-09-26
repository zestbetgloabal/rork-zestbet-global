#!/usr/bin/env node

// Simple test script to check API connectivity
const testApiConnection = async () => {
  console.log('=== TESTING API CONNECTION ===');
  
  const baseUrl = 'https://rork-zestbet-global.vercel.app';
  const endpoints = [
    '/api',
    '/api/status',
    '/api/trpc'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting: ${baseUrl}${endpoint}`);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status}`);
      console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log(`Response (first 200 chars):`, text.substring(0, 200));
      
      // Try to parse as JSON
      try {
        const json = JSON.parse(text);
        console.log(`✅ Valid JSON response:`, json);
      } catch (e) {
        console.log(`❌ Not valid JSON - likely HTML error page`);
      }
      
    } catch (error) {
      console.log(`❌ Error:`, error.message);
    }
  }
  
  // Test tRPC endpoint specifically
  console.log('\n=== TESTING TRPC ENDPOINT ===');
  try {
    const trpcUrl = 'https://rork-zestbet-global.vercel.app/api/trpc/example.hi';
    console.log(`Testing tRPC: ${trpcUrl}`);
    
    const response = await fetch(trpcUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`tRPC Status: ${response.status}`);
    const text = await response.text();
    console.log(`tRPC Response:`, text.substring(0, 200));
    
  } catch (error) {
    console.log(`❌ tRPC Error:`, error.message);
  }
};

testApiConnection().catch(console.error);