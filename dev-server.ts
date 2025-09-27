#!/usr/bin/env bun

import { Hono } from "hono";
import { cors } from "hono/cors";

// Simple mock data
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

const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: ["http://localhost:8081", "http://localhost:3000", "https://localhost:8081", "http://192.168.1.1:8081", "http://192.168.1.2:8081", "http://192.168.1.3:8081", "http://192.168.1.4:8081", "http://192.168.1.5:8081"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Accept", "Cache-Control", "User-Agent"],
  credentials: true,
}));

// Health check endpoint
app.get("/api", (c) => {
  return c.json({ 
    status: "ok", 
    message: "ZestBet Development API is running",
    version: "1.0.0-dev",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/status", (c) => {
  return c.json({
    status: "healthy",
    services: {
      database: "mock",
      email: "disabled",
      auth: "mock"
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mock tRPC endpoints
app.post("/api/trpc/example.hi", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    console.log("📝 Example.hi request:", body);
    
    return c.json({
      result: {
        data: {
          message: "Hello from development server!"
        }
      }
    });
  } catch (error) {
    console.error("❌ Error in example.hi:", error);
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
    const body = await c.req.json().catch(() => ({}));
    console.log("📝 Challenges list request:", body);
    
    return c.json({
      result: {
        data: {
          challenges: mockChallenges,
          total: mockChallenges.length,
          hasMore: false
        }
      }
    });
  } catch (error) {
    console.error("❌ Error in challenges.list:", error);
    return c.json({
      error: {
        message: "Internal server error",
        code: -32603
      }
    }, 500);
  }
});

// Batch tRPC endpoint (for multiple queries)
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
    
    console.log("📦 Batch tRPC request:", JSON.stringify(body, null, 2));
    
    // Handle batch requests
    if (Array.isArray(body)) {
      const responses = body.map((item, index) => {
        const response = { id: index };
        
        if (item.path === "example.hi") {
          return {
            ...response,
            result: {
              data: {
                message: "Hello from development server!"
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
            message: "Hello from development server!"
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
    console.error("❌ Error in batch tRPC:", error);
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
  console.log(`🔍 Headers:`, Object.fromEntries(c.req.raw.headers.entries()));
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

console.log(`🚀 Starting development server on port ${port}...`);

// Export the app for Bun to serve
export default {
  fetch: app.fetch,
  port: Number(port),
};

console.log(`✅ Development server running at http://localhost:${port}`);
console.log(`🔗 API Status: http://localhost:${port}/api/status`);
console.log(`🔗 tRPC Endpoint: http://localhost:${port}/api/trpc`);