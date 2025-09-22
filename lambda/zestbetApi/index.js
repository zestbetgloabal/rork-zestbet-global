const { Hono } = require('hono');
const { handle } = require('@hono/aws-lambda');
const { trpcServer } = require('@hono/trpc-server');
const { cors } = require('hono/cors');

// Import backend modules (you'll need to bundle these)
const { appRouter } = require('./backend/app-router');
const { createContext } = require('./backend/create-context');

const app = new Hono();

// Enable CORS
app.use('*', cors({
  origin: ['https://zestapp.online', 'http://localhost:8081'],
  credentials: true,
}));

// Health check
app.get('/', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'ZestBet API Lambda is running',
    timestamp: new Date().toISOString()
  });
});

// tRPC endpoint
app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext,
    endpoint: '/trpc',
  })
);

// Simple auth logout endpoint
app.post('/auth/logout', (c) => {
  return c.json({ success: true });
});

exports.handler = handle(app);
