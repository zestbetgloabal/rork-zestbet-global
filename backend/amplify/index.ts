import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "../trpc/app-router";
import { createContext } from "../trpc/create-context";

const app = new Hono();

app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}));

app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "ZestBet API (Lambda) is running",
    timestamp: new Date().toISOString(),
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