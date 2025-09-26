import { Hono } from "hono";
import { handle } from "hono/vercel";

// Create a simple diagnostic API
const app = new Hono().basePath("/api");

// Enable CORS
app.use("*", async (c, next) => {
  c.res.headers.set("Access-Control-Allow-Origin", "*");
  c.res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (c.req.method === "OPTIONS") {
    return c.text("", 200);
  }
  
  await next();
});

// Simple health check
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "ZestBet API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Diagnostic endpoint
app.get("/diagnostic", (c) => {
  return c.json({
    status: "healthy",
    platform: "vercel",
    node_version: process.version,
    environment: process.env.NODE_ENV || 'production',
    env_vars: {
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      JWT_SECRET: process.env.JWT_SECRET ? "✅ Set" : "❌ Missing",
      SMTP_HOST: process.env.SMTP_HOST ? "✅ Set" : "❌ Missing",
    },
    timestamp: new Date().toISOString()
  });
});

// Simple test endpoint
app.get("/test", (c) => {
  return c.json({
    message: "Test endpoint working",
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
export default handle(app);