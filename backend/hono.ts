import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use('*', async (c, next) => {
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('X-Frame-Options', 'DENY');
  c.res.headers.set('X-XSS-Protection', '1; mode=block');
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (c.req.header('x-forwarded-proto') === 'https' || c.req.url.startsWith('https://')) {
    c.res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  await next();
});

app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081',
    'https://zestbet.app',
    'https://www.zestbet.app',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400,
}));

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    message: "ZestBet API is healthy",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "ZestBet API is running",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

export default app;
