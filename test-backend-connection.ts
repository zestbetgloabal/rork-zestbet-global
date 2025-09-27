#!/usr/bin/env bun

console.log("🔍 Testing Backend Connection...");
console.log("================================");

const baseUrl = "http://localhost:3001";

async function testEndpoint(url: string, description: string) {
  try {
    console.log(`\n🔄 Testing ${description}: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type');
    console.log(`📄 Status: ${response.status} ${response.statusText}`);
    console.log(`📄 Content-Type: ${contentType}`);

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      console.log(`✅ JSON Response:`, JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const text = await response.text();
      console.log(`❌ Non-JSON Response (first 200 chars):`, text.substring(0, 200));
      return { success: false, error: 'Non-JSON response' };
    }
  } catch (error) {
    console.log(`❌ Error:`, error);
    return { success: false, error: String(error) };
  }
}

async function testTrpcEndpoint() {
  try {
    console.log(`\n🔄 Testing tRPC endpoint: ${baseUrl}/api/trpc`);
    
    // Test the example.hi procedure
    const response = await fetch(`${baseUrl}/api/trpc/example.hi`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: { name: "Test" }
      }),
    });

    const contentType = response.headers.get('content-type');
    console.log(`📄 Status: ${response.status} ${response.statusText}`);
    console.log(`📄 Content-Type: ${contentType}`);

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      console.log(`✅ tRPC Response:`, JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const text = await response.text();
      console.log(`❌ Non-JSON Response (first 200 chars):`, text.substring(0, 200));
      return { success: false, error: 'Non-JSON response' };
    }
  } catch (error) {
    console.log(`❌ tRPC Error:`, error);
    return { success: false, error: String(error) };
  }
}

async function main() {
  console.log(`🎯 Base URL: ${baseUrl}`);
  
  // Test basic endpoints
  await testEndpoint(`${baseUrl}`, "Root endpoint");
  await testEndpoint(`${baseUrl}/api`, "API endpoint");
  await testEndpoint(`${baseUrl}/api/status`, "Status endpoint");
  
  // Test tRPC
  await testTrpcEndpoint();
  
  console.log("\n🏁 Backend connection test completed!");
}

main().catch(console.error);