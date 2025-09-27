import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './hono';

const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0';

console.log(`🚀 Starting ZestBet API server on ${host}:${port}`);
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);

serve({
  fetch: app.fetch,
  port: parseInt(port.toString()),
  hostname: host,
}, (info) => {
  console.log(`✅ ZestBet API server is running on http://${info.address}:${info.port}`);
  console.log(`🔗 Health check: http://${info.address}:${info.port}/api/health`);
  console.log(`🔗 tRPC endpoint: http://${info.address}:${info.port}/api/trpc`);
});