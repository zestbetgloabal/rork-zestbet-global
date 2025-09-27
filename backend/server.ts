import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './hono';

const port = parseInt(process.env.PORT || '8080');
const host = process.env.HOST || '0.0.0.0';

console.log(`🚀 Starting ZestBet API server on ${host}:${port}`);
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'Configured' : 'Using mock database'}`);

try {
  serve({
    fetch: app.fetch,
    port: port,
    hostname: host,
  }, (info) => {
    console.log(`✅ ZestBet API server is running on http://${info.address}:${info.port}`);
    console.log(`🔗 Health check: http://${info.address}:${info.port}/`);
    console.log(`🔗 API Health check: http://${info.address}:${info.port}/api/health`);
    console.log(`🔗 tRPC endpoint: http://${info.address}:${info.port}/api/trpc`);
    
    // Test the health endpoint immediately after startup
    setTimeout(async () => {
      try {
        const response = await fetch(`http://${info.address}:${info.port}/`);
        const data = await response.json();
        console.log('🔍 Health check test:', response.status, data);
      } catch (err) {
        console.error('❌ Health check test failed:', err);
      }
    }, 1000);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}