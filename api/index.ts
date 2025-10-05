import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "../backend/trpc/app-router";
import { createContext } from "../backend/trpc/create-context";
import { MonitoringService } from "../backend/services/monitoring";
import { initializeDatabase } from "../backend/config/supabase";
import { loggerMiddleware, errorLoggerMiddleware } from "../backend/middleware/logger";
import { generalRateLimit, authRateLimit } from "../backend/middleware/rate-limit";

// Initialize monitoring
MonitoringService.initialize();

// Initialize database
initializeDatabase().catch(error => {
  console.error('❌ Database initialization failed:', error);
  MonitoringService.captureException(error);
});

// Create Hono app for Vercel
const app = new Hono();

// Security headers
app.use('*', async (c, next) => {
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('X-Frame-Options', 'DENY');
  c.res.headers.set('X-XSS-Protection', '1; mode=block');
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  if (c.req.header('x-forwarded-proto') === 'https' || c.req.url.startsWith('https://')) {
    c.res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  await next();
});

// CORS configuration
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081',
    'https://mycaredaddy.com',
    'https://www.mycaredaddy.com',
    'https://mycaredaddy.de',
    'https://www.mycaredaddy.de',
    'https://mycaredaddy.eu',
    'https://www.mycaredaddy.eu',
    'https://zestapp.online',
    'https://www.zestapp.online'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
}));

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ 
    status: "ok", 
    message: "MyCaredaddy API is healthy",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    platform: "vercel"
  });
});

// Rate limiting middleware
app.use("/trpc/auth.*", authRateLimit);
app.use("*", generalRateLimit);

// Logging middleware
app.use("*", async (c, next) => loggerMiddleware(c, next));
app.use("*", async (c, next) => errorLoggerMiddleware(c, next));

// Cache-control headers
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

// Mount tRPC router
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

// Root endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "MyCaredaddy API is running on Vercel",
    version: "2.0.0",
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    endpoints: {
      trpc: "/api/trpc",
      health: "/api/health",
      status: "/api/status"
    }
  });
});

// Status endpoint
app.get("/status", (c) => {
  return c.json({
    status: "healthy",
    platform: "vercel",
    services: {
      database: "connected",
      email: "configured",
      auth: "active",
      trpc: "active"
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Logout endpoint
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

console.log('✅ MyCaredaddy API initialized on Vercel');

export default app;