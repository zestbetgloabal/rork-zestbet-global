// Quick backend starter - run with: node start-backend-quick.js
console.log('🚀 Starting ZestBet Backend Server...');
console.log('📍 Port: 3001');

// Load environment variables
require('dotenv/config');

// Import and start the server
const { spawn } = require('child_process');

// Start the backend server
const backend = spawn('npx', ['tsx', 'backend/server.ts'], {
  stdio: 'inherit',
  shell: true
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
});

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping backend server...');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping backend server...');
  backend.kill('SIGTERM');
  process.exit(0);
});