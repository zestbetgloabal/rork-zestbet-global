const { Hono } = require('hono');
const { handle } = require('@hono/aws-lambda');
const { trpcServer } = require('@hono/trpc-server');
const { cors } = require('hono/cors');

// Import backend modules
const { appRouter } = require('./backend/app-router');
const { createContext } = require('./backend/create-context');

const app = new Hono();

// Enable CORS for all origins in development, specific origins in production
app.use('*', cors({
  origin: [
    'https://zestapp.online',
    'https://*.amplifyapp.com',
    'http://localhost:8081',
    'http://localhost:3000',
    'https://rork.com'
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-trpc-source'],
}));

// Logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
  const end = Date.now();
  console.log(`${c.req.method} ${c.req.url} - ${c.res.status} (${end - start}ms)`);
});

// Health check endpoint
app.get('/', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'ZestBet API Lambda is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API status endpoint
app.get('/status', (c) => {
  return c.json({ 
    status: 'healthy',
    service: 'ZestBet API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// tRPC endpoint - this handles all your backend routes
app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext,
    endpoint: '/trpc',
    onError: ({ error, path }) => {
      console.error(`tRPC Error on ${path}:`, error);
    },
  })
);

// Simple auth logout endpoint for compatibility
app.post('/auth/logout', (c) => {
  const cookieAttrs = [
    'Path=/',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Max-Age=0',
    'HttpOnly',
    'Secure',
    'SameSite=None',
  ].join('; ');

  const headers = new Headers();
  ['auth', 'token', 'refreshToken', 'access_token', 'session'].forEach((name) => {
    headers.append('Set-Cookie', `${name}=; ${cookieAttrs}`);
  });

  headers.set('Content-Type', 'application/json');
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers,
  });
});

// Error handling
app.onError((err, c) => {
  console.error('Lambda Error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: `Route ${c.req.method} ${c.req.url} not found`,
    timestamp: new Date().toISOString()
  }, 404);
});

exports.handler = handle(app);

// For local testing
if (require.main === module) {
  const port = process.env.PORT || 3001;
  console.log(`Starting server on port ${port}`);
  require('http').createServer(app.fetch).listen(port);
}
