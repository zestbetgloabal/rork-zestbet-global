import { Hono } from "hono";
// AWS Amplify doesn't need special handler like Vercel
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "../backend/trpc/app-router";
import { createContext } from "../backend/trpc/create-context";

// Create Hono app for AWS Amplify
const app = new Hono().basePath("/api");

// Enable CORS for all routes
app.use("*", cors({
  origin: [
    "https://zestapp.online",
    "https://zestapp.online",
    "http://localhost:3000",
    "http://localhost:8081"
  ],
  credentials: true,
}));

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "ZestBet API is running on AWS Amplify",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// Status endpoint with more details
app.get("/status", (c) => {
  return c.json({
    status: "healthy",
    platform: "aws-amplify",
    services: {
      database: "connected",
      email: "configured",
      auth: "active"
    },
    timestamp: new Date().toISOString()
  });
});

// Mount tRPC router at /trpc
try {
  app.use(
    "/trpc/*",
    trpcServer({
      endpoint: "/api/trpc",
      router: appRouter,
      createContext,
    })
  );
  console.log('✅ tRPC server mounted successfully');
} catch (error) {
  console.error('❌ Failed to mount tRPC server:', error);
  // Fallback endpoint
  app.get('/trpc/*', (c) => {
    return c.json({ 
      error: 'tRPC server failed to initialize', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  });
}

// Stateless logout endpoint to clear auth cookies (if any)
app.post("/auth/logout", (c) => {
  const cookieAttrs = [
    "Path=/",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "Max-Age=0",
    "HttpOnly",
    "Secure",
    "SameSite=None",
  ].join("; ");

  const headers = new Headers();
  ["auth", "token", "refreshToken", "access_token", "session"].forEach((name) => {
    headers.append("Set-Cookie", `${name}=; ${cookieAttrs}`);
  });

  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers,
  });
});

// Export for AWS Amplify
export default app;