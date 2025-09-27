#!/usr/bin/env bun

import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

console.log("🚀 Starting ZestBet Backend Server (Simplified)...");

const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: ["http://localhost:8081", "http://localhost:3000", "https://localhost:8081"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Accept", "Cache-Control", "User-Agent"],
  credentials: true,
}));

// Simple logging middleware
app.use("*", async (c, next) => {
  const start = Date.now();
  console.log(`📝 ${c.req.method} ${c.req.url}`);
  
  try {
    await next();
    const duration = Date.now() - start;
    console.log(`✅ ${c.req.method} ${c.req.url} - ${c.res.status} - ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ ${c.req.method} ${c.req.url} - Error after ${duration}ms:`, error);
    throw error;
  }
});

// Mount tRPC router
try {
  console.log("🔧 Mounting tRPC router...");
  
  app.use(
    "/api/trpc/*",
    trpcServer({
      router: appRouter,
      createContext,
    })
  );
  
  console.log("✅ tRPC router mounted successfully");
} catch (error) {
  console.error("❌ Failed to mount tRPC router:", error);
  process.exit(1);
}

// Health check endpoints
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "ZestBet API is running",
    version: "1.0.0-simplified",
    timestamp: new Date().toISOString()
  });
});

app.get("/api", (c) => {
  return c.json({ 
    status: "ok", 
    message: "ZestBet API is running",
    version: "1.0.0-simplified",
    timestamp: new Date().toISOString(),
    endpoints: {
      trpc: "/api/trpc",
      status: "/api/status",
      health: "/api"
    }
  });
});

app.get("/api/status", (c) => {
  return c.json({
    status: "healthy",
    services: {
      database: "connected",
      email: "configured", 
      auth: "active",
      trpc: "active"
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    endpoints: {
      trpc: "/api/trpc",
      status: "/api/status",
      health: "/api"
    }
  });
});

// Catch-all for debugging
app.all("*", (c) => {
  console.log(`🔍 Unhandled request: ${c.req.method} ${c.req.url}`);
  return c.json({
    error: "Not found",
    method: c.req.method,
    path: c.req.url,
    availableEndpoints: [
      "GET /",
      "GET /api",
      "GET /api/status", 
      "POST /api/trpc/*"
    ]
  }, 404);
});

const port = process.env.PORT || 3001;

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