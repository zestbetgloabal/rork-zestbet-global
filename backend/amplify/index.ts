import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "../trpc/app-router";
import { createContext } from "../trpc/create-context";

const app = new Hono();

const allowedOrigins = [
  "https://www.zestapp.online",
  "http://localhost:8081",
  "http://localhost:19006",
  "http://127.0.0.1:19006",
];

app.use("*", cors({
  origin: (origin) => {
    if (!origin) return "*"; // Lambda Function URLs may not send Origin on health checks
    return allowedOrigins.includes(origin) ? origin : "https://www.zestapp.online";
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
  });
});

app.get("/health", (c) => c.text("ok"));

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
  })
);

export const handler = handle(app);