import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "../trpc/app-router";
import { createContext } from "../trpc/create-context";

// Create Hono app
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: ["http://localhost:3000", "https://*.amplifyapp.com"],
  credentials: true,
}));

// Health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "ZestBet API is running",
    timestamp: new Date().toISOString()
  });
});

// Mount tRPC router
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
  })
);

// Export handler for AWS Lambda
export const handler = handle(app);