#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Starting ZestBet Backend Server...');
console.log('📍 Port: 3001');
console.log('🔗 API URL: http://localhost:3001/api');
console.log('🔗 tRPC URL: http://localhost:3001/api/trpc');

// Start the backend server
const backend = spawn('bun', ['run', 'backend/hono.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: '3001',
    NODE_ENV: 'development'
  }
});

backend.on('error', (error) => {
  if (error && error.message) {
    console.error('❌ Backend server error:', error.message);
  }
});

backend.on('close', (code) => {
  console.log(`Backend server exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down backend server...');
  backend.kill('SIGTERM');
  process.exit(0);
});