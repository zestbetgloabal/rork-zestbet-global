import { Hono } from "hono";
import { handle } from "hono/vercel";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "../backend/trpc/app-router";
import { createContext } from "../backend/trpc/create-context";
import { loggerMiddleware, errorLoggerMiddleware } from "../backend/middleware/logger";
import { generalRateLimit, authRateLimit } from "../backend/middleware/rate-limit";

// Create Hono app for Vercel
const app = new Hono().basePath("/api");

// Enable CORS for all routes
app.use("*", cors({
  origin: [
    "https://rork-zestbet-global.vercel.app",
    "https://zestapp.online",
    "http://localhost:3000",
    "http://localhost:8081"
  ],
  credentials: true,
}));

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
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "ZestBet API is running on Vercel",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// Status endpoint with more details
app.get("/status", (c) => {
  return c.json({
    status: "healthy",
    platform: "vercel",
    services: {
      database: "connected",
      email: "configured",
      auth: "active"
    },
    timestamp: new Date().toISOString()
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

// Export for Vercel
export default handle(app);