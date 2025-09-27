require('dotenv').config();
const { serve } = require('@hono/node-server');

// Try to load the TypeScript file, fallback to compiled JS
let app;
try {
  // Try to require the TypeScript file directly (works with tsx)
  app = require('./hono.ts').default;
} catch (error) {
  console.log('Failed to load TypeScript file, trying compiled JS...');
  try {
    app = require('../dist/backend/hono.js').default;
  } catch (jsError) {
    console.error('Failed to load both TS and JS files:', error, jsError);
    process.exit(1);
  }
}

const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0';

console.log(`🚀 Starting ZestBet API server on ${host}:${port}`);
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);

serve({
  fetch: app.fetch,
  port: parseInt(port),
  hostname: host,
}, (info) => {
  console.log(`✅ ZestBet API server is running on http://${info.address}:${info.port}`);
  console.log(`🔗 Health check: http://${info.address}:${info.port}/api/health`);
  console.log(`🔗 tRPC endpoint: http://${info.address}:${info.port}/api/trpc`);
});