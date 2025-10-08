import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono().basePath('/api');

app.use('*', cors({
  origin: ['http://localhost:8081', 'https://*.vercel.app', 'https://zestapp.online'],
  credentials: true,
}));

app.use('*', logger());

app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'zestbet-api'
  });
});

app.get('/hello', (c) => {
  return c.json({ message: 'Hello from Zestbet API!' });
});

app.get('/trpc/*', (c) => {
  return c.json({ 
    error: 'tRPC endpoint - implementation pending',
    path: c.req.path 
  });
});

app.post('/trpc/*', (c) => {
  return c.json({ 
    error: 'tRPC endpoint - implementation pending',
    path: c.req.path 
  });
});

app.notFound((c) => {
  return c.json({ 
    error: 'Not Found',
    path: c.req.path,
    message: 'The requested endpoint does not exist'
  }, 404);
});

app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({ 
    error: 'Internal Server Error',
    message: err.message 
  }, 500);
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);

export default handle(app);
