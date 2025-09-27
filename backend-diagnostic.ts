#!/usr/bin/env bun

console.log("🔍 ZestBet Backend Diagnostic");
console.log("============================");

// Check environment variables
console.log("\n📋 Environment Variables:");
console.log("EXPO_PUBLIC_TRPC_URL:", process.env.EXPO_PUBLIC_TRPC_URL);
console.log("EXPO_PUBLIC_API_URL:", process.env.EXPO_PUBLIC_API_URL);
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Not set");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Not set");

// Check if required files exist
console.log("\n📁 File System Check:");
import fs from 'fs';

const requiredFiles = [
  'backend/trpc/app-router.ts',
  'backend/trpc/create-context.ts',
  'backend/trpc/routes/example/hi/route.ts',
  'backend/hono.ts',
  'backend/server.ts',
  '.env'
];

for (const file of requiredFiles) {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
}

// Test tRPC router import
console.log("\n🔧 Module Import Test:");
try {
  const { appRouter } = await import('./backend/trpc/app-router');
  console.log("✅ appRouter imported successfully");
  console.log("Router keys:", Object.keys(appRouter._def.procedures || {}));
} catch (error) {
  console.log("❌ Failed to import appRouter:", error);
}

try {
  await import('./backend/trpc/create-context');
  console.log("✅ createContext imported successfully");
} catch (error) {
  console.log("❌ Failed to import createContext:", error);
}

// Test if port 3001 is available
console.log("\n🔌 Port Check:");
try {
  const response = await fetch('http://localhost:3001/api/status');
  console.log("⚠️  Port 3001 is already in use (server running)");
  console.log("Response status:", response.status);
} catch (error) {
  console.log("✅ Port 3001 is available (no server running)");
}

console.log("\n🏁 Diagnostic completed!");