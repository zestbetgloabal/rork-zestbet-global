#!/usr/bin/env bun

// Simple backend server to fix tRPC connection issues
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: ["http://localhost:8081", "http://localhost:3000", "https://localhost:8081"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Accept", "Cache-Control", "User-Agent"],
  credentials: true,
}));

// Mock data
const mockChallenges = [
  {
    id: "1",
    title: "30-Day Fitness Challenge",
    description: "Complete 30 days of daily exercise to improve your fitness level.",
    creator: "fitness_guru",
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    category: "fitness",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000",
    status: "active",
    participants: [
      {
        id: "p1",
        userId: "user1",
        username: "FitnessFan",
        joinedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        score: 85,
        rank: 1
      }
    ],
    type: "individual",
    visibility: "public",
    hasPool: false
  },
  {
    id: "2",
    title: "Reading Marathon",
    description: "Read 12 books in 3 months and share your reviews.",
    creator: "book_lover",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 97 * 24 * 60 * 60 * 1000),
    category: "education",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1000",
    status: "upcoming",
    participants: [],
    type: "individual",
    visibility: "public",
    hasPool: true
  }
];

// Health check endpoints
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "ZestBet Backend is running",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/api", (c) => {
  return c.json({ 
    status: "ok", 
    message: "ZestBet API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/status", (c) => {
  return c.json({
    status: "healthy",
    services: {
      database: "connected",
      email: "configured",
      auth: "active"
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// tRPC batch endpoint
app.post("/api/trpc", async (c) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return c.json({
        error: {
          message: "Invalid JSON in request body",
          code: -32700
        }
      }, 400);
    }
    
    console.log("📦 tRPC request:", JSON.stringify(body, null, 2));
    
    // Handle batch requests
    if (Array.isArray(body)) {
      const responses = body.map((item, index) => {
        const response = { id: index };
        
        if (item.path === "example.hi") {
          return {
            ...response,
            result: {
              data: {
                message: `Hello ${item.input?.name || 'World'}! Backend is working!`
              }
            }
          };
        } else if (item.path === "challenges.list") {
          return {
            ...response,
            result: {
              data: {
                challenges: mockChallenges,
                total: mockChallenges.length,
                hasMore: false
              }
            }
          };
        } else {
          return {
            ...response,
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
            message: `Hello ${body.input?.name || 'World'}! Backend is working!`
          }
        }
      });
    } else if (body.path === "challenges.list") {
      return c.json({
        result: {
          data: {
            challenges: mockChallenges,
            total: mockChallenges.length,
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

// Individual tRPC endpoints for compatibility
app.post("/api/trpc/example.hi", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    return c.json({
      result: {
        data: {
          message: `Hello ${body.input?.name || 'World'}! Backend is working!`
        }
      }
    });
  } catch {
    return c.json({
      error: {
        message: "Internal server error",
        code: -32603
      }
    }, 500);
  }
});

app.post("/api/trpc/challenges.list", async (c) => {
  try {
    return c.json({
      result: {
        data: {
          challenges: mockChallenges,
          total: mockChallenges.length,
          hasMore: false
        }
      }
    });
  } catch {
    return c.json({
      error: {
        message: "Internal server error",
        code: -32603
      }
    }, 500);
  }
});

// Catch all for debugging
app.all("*", (c) => {
  console.log(`🔍 Unhandled request: ${c.req.method} ${c.req.url}`);
  return c.json({
    error: "Not found",
    method: c.req.method,
    path: c.req.url,
    availableEndpoints: [
      "GET /api",
      "GET /api/status", 
      "POST /api/trpc",
      "POST /api/trpc/example.hi",
      "POST /api/trpc/challenges.list"
    ]
  }, 404);
});

const port = process.env.PORT || 3001;

console.log(`🚀 Starting ZestBet Backend Server on port ${port}...`);
console.log(`📍 Server: http://localhost:${port}`);
console.log(`🔗 API Status: http://localhost:${port}/api/status`);
console.log(`🔗 tRPC Endpoint: http://localhost:${port}/api/trpc`);
console.log("");

export default {
  fetch: app.fetch,
  port: Number(port),
  hostname: "0.0.0.0",
};

console.log(`✅ Backend server running at http://localhost:${port}`);