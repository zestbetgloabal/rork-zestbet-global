const { serve } = require('@hono/node-server');
const app = require('./hono.ts').default;

const port = process.env.PORT || 3001;

console.log(`🚀 Starting ZestBet API server on port ${port}`);

serve({
  fetch: app.fetch,
  port: port,
}, (info) => {
  console.log(`✅ ZestBet API server is running on http://localhost:${info.port}`);
});