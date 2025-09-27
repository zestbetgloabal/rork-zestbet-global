#!/usr/bin/env bun

console.log("🔍 Testing Backend Connection...");
console.log("⏰", new Date().toLocaleTimeString());
console.log("");

const testEndpoints = [
  "http://localhost:3001/api",
  "http://localhost:3001/api/status", 
  "http://localhost:3001/api/trpc"
];

for (const endpoint of testEndpoints) {
  try {
    console.log(`🔍 Testing: ${endpoint}`);
    const response = await fetch(endpoint, {
      method: endpoint.includes('/trpc') ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: endpoint.includes('/trpc') ? JSON.stringify({
        path: "example.hi",
        input: { name: "test" }
      }) : undefined
    });

    const contentType = response.headers.get('content-type');
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${contentType}`);
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      console.log(`   ✅ JSON Response:`, JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log(`   ❌ Non-JSON Response:`, text.substring(0, 200));
    }
    console.log("");
  } catch (error) {
    console.log(`   ❌ Error:`, String(error));
    console.log("");
  }
}

console.log("🏁 Test completed!");