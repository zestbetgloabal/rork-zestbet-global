#!/usr/bin/env bun

console.log("🧪 Testing Backend Connection");
console.log("=============================");

const baseUrl = "http://localhost:3001";

async function testConnection() {
  console.log(`🎯 Testing connection to: ${baseUrl}`);
  
  // Test 1: Basic API endpoint
  try {
    console.log("\n🔄 Test 1: Basic API endpoint");
    const response = await fetch(`${baseUrl}/api`);
    const data = await response.json();
    console.log("✅ API endpoint working:", data);
  } catch (error) {
    console.log("❌ API endpoint failed:", error);
    return false;
  }

  // Test 2: Status endpoint
  try {
    console.log("\n🔄 Test 2: Status endpoint");
    const response = await fetch(`${baseUrl}/api/status`);
    const data = await response.json();
    console.log("✅ Status endpoint working:", data);
  } catch (error) {
    console.log("❌ Status endpoint failed:", error);
    return false;
  }

  // Test 3: tRPC endpoint (example.hi)
  try {
    console.log("\n🔄 Test 3: tRPC example.hi");
    const response = await fetch(`${baseUrl}/api/trpc/example.hi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: { name: "ConnectionTest" }
      })
    });
    
    const contentType = response.headers.get('content-type');
    console.log("📄 Content-Type:", contentType);
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      console.log("✅ tRPC endpoint working:", data);
    } else {
      const text = await response.text();
      console.log("❌ tRPC returned non-JSON:", text.substring(0, 200));
      return false;
    }
  } catch (error) {
    console.log("❌ tRPC endpoint failed:", error);
    return false;
  }

  // Test 4: Import tRPC client and test
  try {
    console.log("\n🔄 Test 4: tRPC client import");
    const { testTrpcHello } = await import('./lib/trpc');
    const result = await testTrpcHello();
    
    if (result.success) {
      console.log("✅ tRPC client working:", result.data);
    } else {
      console.log("❌ tRPC client failed:", result.error);
      return false;
    }
  } catch (error) {
    console.log("❌ tRPC client import failed:", error);
    return false;
  }

  console.log("\n🎉 All tests passed! Backend connection is working correctly.");
  return true;
}

// Wait a bit for server to start, then test
setTimeout(async () => {
  const success = await testConnection();
  process.exit(success ? 0 : 1);
}, 2000);