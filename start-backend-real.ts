#!/usr/bin/env tsx
import { serve } from '@hono/node-server';
import app from './backend/hono';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

console.log('🚀 Starting ZestBet Backend Server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔗 Database URL:', process.env.DATABASE_URL ? 'Connected' : 'Not configured');
console.log('📧 Email configured:', process.env.SMTP_HOST ? 'Yes' : 'No');

serve({
  fetch: app.fetch,
  port: Number(PORT),
}, (info: { port: number }) => {
  console.log(`✅ ZestBet Backend is running on http://localhost:${info.port}`);
  console.log(`📡 tRPC endpoint: http://localhost:${info.port}/api/trpc`);
  console.log(`🏥 Health check: http://localhost:${info.port}/api/status`);
  console.log('');
  console.log('🎯 Ready to accept connections!');
});