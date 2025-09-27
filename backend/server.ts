#!/usr/bin/env bun

import app from "./hono";

const port = process.env.PORT || 3001;

console.log(`🚀 Starting ZestBet Backend Server...`);
console.log(`📍 Server will be available at: http://localhost:${port}`);
console.log(`🔗 API Status: http://localhost:${port}/api/status`);
console.log(`🔗 tRPC Endpoint: http://localhost:${port}/api/trpc`);
console.log(`🔗 Health Check: http://localhost:${port}/api`);
console.log("");

// Export the app for Bun to serve
export default {
  fetch: app.fetch,
  port: Number(port),
  hostname: "0.0.0.0",
};

console.log(`✅ Backend server running at http://localhost:${port}`);
console.log(`Press Ctrl+C to stop the server`);
console.log("");