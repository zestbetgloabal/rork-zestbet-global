import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "../trpc/app-router";
import { createContext } from "../trpc/create-context";

const app = new Hono();

const allowedOrigins = [
  "https://zestapp.online",
  "https://www.zestapp.online",
  "http://localhost:8081",
  "http://localhost:19006",
  "http://127.0.0.1:19006",
  "http://localhost:3000",
];

// More permissive CORS for debugging
app.use("*", cors({
  origin: (origin) => {
    console.log('🌐 Request origin:', origin);
    if (!origin) return "*";
    
    // Allow all amplifyapp.com domains
    if (origin.includes('amplifyapp.com')) {
      console.log('✅ Allowing amplifyapp.com origin:', origin);
      return origin;
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Allowing known origin:', origin);
      return origin;
    }
    
    console.log('⚠️ Unknown origin, defaulting to zestapp.online:', origin);
    return "https://zestapp.online";
  },
  allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  allowHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: false,
}));

// Root endpoint
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "ZestBet API (AWS Amplify Lambda) is running",
    timestamp: new Date().toISOString(),
    allowedOrigins,
    env: {
      node: process.version,
      region: process.env.AWS_REGION ?? null,
    },
    endpoints: {
      health: "/health",
      status: "/status",
      trpc: "/trpc",
      apiTrpc: "/api/trpc"
    }
  });
});

// Health check
app.get("/health", (c) => c.text("ok"));

// Status endpoints for compatibility
app.get("/status", (c) => {
  return c.json({
    status: "healthy",
    platform: "aws-amplify-lambda",
    services: {
      database: "connected",
      email: "configured",
      auth: "active"
    },
    timestamp: new Date().toISOString()
  });
});

app.get("/api/status", (c) => {
  return c.json({
    status: "healthy",
    platform: "aws-amplify-lambda",
    services: {
      database: "connected",
      email: "configured",
      auth: "active"
    },
    timestamp: new Date().toISOString()
  });
});

// Mount tRPC at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
  })
);

// Mount tRPC at /api/trpc for compatibility
app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// Catch-all for debugging
app.all("*", (c) => {
  console.log('🔍 Unhandled request:', c.req.method, c.req.url);
  return c.json({
    error: "Not Found",
    method: c.req.method,
    path: c.req.url,
    message: "This endpoint is not available. Available endpoints: /, /health, /status, /trpc/*, /api/trpc/*"
  }, 404);
});

export const handler = handle(app);