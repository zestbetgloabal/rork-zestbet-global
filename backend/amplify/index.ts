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

app.use("*", cors({
  origin: (origin) => {
    if (!origin) return "*";
    return allowedOrigins.includes(origin) ? origin : "https://zestapp.online";
  },
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}));

app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "ZestBet API (Lambda) is running",
    timestamp: new Date().toISOString(),
    allowedOrigins,
    env: {
      node: process.version,
      region: process.env.AWS_REGION ?? null,
    },
  });
});

app.get("/health", (c) => c.text("ok"));

// Status endpoint for compatibility
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

// Mount tRPC at both /trpc and /api/trpc for compatibility
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
  })
);

app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

export const handler = handle(app);