import { Hono } from "hono";

// Minimal app for testing Railway deployment
const app = new Hono();

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "ZestBet API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Railway health check endpoint
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    message: "ZestBet API is healthy",
    timestamp: new Date().toISOString()
  });
});

// API health check endpoint
app.get("/api", (c) => {
  return c.json({ 
    status: "ok", 
    message: "ZestBet API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      status: "/api"
    }
  });
});

export default app;