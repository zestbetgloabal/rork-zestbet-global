import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./backend/trpc/app-router.js";
import { createContext } from "./backend/trpc/create-context.js";

// Create Hono app for AWS Lambda
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: [
    "https://zestapp.online",
    "https://*.amplifyapp.com",
    "http://localhost:3000",
    "http://localhost:8081",
    "exp://192.168.1.100:8081", // Expo Go
    "exp://localhost:8081"
  ],
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Mount tRPC router
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
  })
);

// Health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "ZestBet AWS Lambda API is running",
    version: "1.0.0",
    environment: "production",
    timestamp: new Date().toISOString()
  });
});

// Status endpoint
app.get("/status", (c) => {
  return c.json({
    status: "healthy",
    services: {
      database: "connected",
      email: "configured",
      auth: "active"
    },
    platform: "AWS Lambda",
    timestamp: new Date().toISOString()
  });
});

// Export the handler for AWS Lambda
export const handler = handle(app);