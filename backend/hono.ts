import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";

import { createServer } from "http";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import WebRTCService from "./services/webrtc";
import { loggerMiddleware, errorLoggerMiddleware } from "./middleware/logger";
import { generalRateLimit, authRateLimit } from "./middleware/rate-limit";
import { corsMiddleware } from "./middleware/cors";

// Extend global type for WebRTC service
declare global {
  var webrtcService: WebRTCService | undefined;
}

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes with proper configuration
app.use("*", corsMiddleware);

// Rate limiting middleware
app.use("/trpc/auth.*", authRateLimit);
app.use("*", generalRateLimit);

// Logging middleware
app.use("*", async (c, next) => loggerMiddleware(c, next));
app.use("*", async (c, next) => errorLoggerMiddleware(c, next));

// Cache-control headers: never cache auth or trpc auth endpoints
app.use("*", async (c, next) => {
  await next();
  const url = new URL(c.req.url);
  const path = url.pathname.replace(/^\/api/, "");
  const isAuthPath = path.startsWith("/auth") || path.startsWith("/trpc/auth");
  if (isAuthPath) {
    c.res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    c.res.headers.set("Pragma", "no-cache");
    c.res.headers.set("Expires", "0");
  }
});

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

// Also mount at /api/trpc for compatibility
app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

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

// API health check endpoint
app.get("/api", (c) => {
  return c.json({ 
    status: "ok", 
    message: "ZestBet API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      trpc: "/api/trpc",
      status: "/api/status",
      health: "/api"
    }
  });
});

// Status endpoint with more details
app.get("/status", (c) => {
  return c.json({
    status: "healthy",
    services: {
      database: "connected",
      email: "configured",
      auth: "active"
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// API Status endpoint
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
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    endpoints: {
      trpc: "/api/trpc",
      status: "/api/status",
      health: "/api"
    }
  });
});

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

// WebRTC/Socket.IO endpoint for live betting
app.get("/live-betting-status", (c) => {
  // This would be used to check WebRTC service status
  return c.json({ 
    status: "ok", 
    message: "Live betting service is running",
    activeRooms: globalThis.webrtcService?.getActiveRooms() || []
  });
});

// Initialize WebRTC service when server starts
if (typeof global !== 'undefined') {
  // Create HTTP server for Socket.IO
  const httpServer = createServer();
  
  // Initialize WebRTC service
  globalThis.webrtcService = new WebRTCService(httpServer);
  
  // Start HTTP server for Socket.IO on a different port
  const SOCKET_PORT = process.env.SOCKET_PORT || 3001;
  httpServer.listen(SOCKET_PORT, () => {
    console.log(`WebRTC/Socket.IO server running on port ${SOCKET_PORT}`);
  });
}

export default app;