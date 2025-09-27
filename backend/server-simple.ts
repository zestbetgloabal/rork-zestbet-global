#!/usr/bin/env bun

import { Hono } from "hono";
import { cors } from "hono/cors";

console.log("🚀 Starting ZestBet Simple Backend Server...");

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

// Mock tRPC endpoints (simplified)
app.post("/api/trpc", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    console.log("📦 tRPC request:", JSON.stringify(body, null, 2));
    
    // Handle batch requests
    if (Array.isArray(body)) {
      const responses = body.map((item, index) => {
        if (item.path === "example.hi") {
          return {
            id: index,
            result: {
              data: {
                message: `Hello ${item.input?.json?.name || 'World'} from simple backend!`
              }
            }
          };
        } else if (item.path === "challenges.list") {
          return {
            id: index,
            result: {
              data: {
                challenges: [
                  {
                    id: "1",
                    title: "Test Challenge",
                    description: "A simple test challenge",
                    status: "active"
                  }
                ],
                total: 1,
                hasMore: false
              }
            }
          };
        } else {
          return {
            id: index,
            error: {
              message: `Procedure ${item.path} not found`,
              code: -32601
            }
          };
        }
      });
      
      return c.json(responses);
    }
    
    // Handle single requests
    if (body.path === "example.hi") {
      return c.json({
        result: {
          data: {
            message: `Hello ${body.input?.json?.name || 'World'} from simple backend!`
          }
        }
      });
    } else if (body.path === "challenges.list") {
      return c.json({
        result: {
          data: {
            challenges: [
              {
                id: "1",
                title: "Test Challenge",
                description: "A simple test challenge",
                status: "active"
              }
            ],
            total: 1,
            hasMore: false
          }
        }
      });
    }
    
    return c.json({
      error: {
        message: `Procedure ${body.path || 'unknown'} not found`,
        code: -32601
      }
    }, 404);
    
  } catch (error) {
    console.error("❌ Error in tRPC:", error);
    return c.json({
      error: {
        message: "Internal server error",
        code: -32603
      }
    }, 500);
  }
});

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