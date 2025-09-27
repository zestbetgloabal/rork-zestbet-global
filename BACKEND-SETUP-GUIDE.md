# 🚀 ZestBet Backend Setup Guide

## Problem
Your app is trying to connect to `http://localhost:3001/api` but the backend server is not running locally.

## Solution
Start your backend server locally to handle the API requests.

## Quick Start Options

### Option 1: Using the Shell Script (Recommended)
```bash
# Make the script executable
chmod +x start-backend.sh

# Run the backend server
./start-backend.sh
```

### Option 2: Using Node.js directly
```bash
node start-backend-quick.js
```

### Option 3: Using npx tsx directly
```bash
npx tsx backend/server.ts
```

### Option 4: Using bun (if installed)
```bash
bun run backend/server.ts
```

## What to Expect
When the backend starts successfully, you should see:
```
🚀 Starting ZestBet API server on 0.0.0.0:3001
📊 Environment: development
🗄️ Database: Configured
✅ ZestBet API server is running on http://0.0.0.0:3001
🔗 Health check: http://0.0.0.0:3001/api/health
🔗 tRPC endpoint: http://0.0.0.0:3001/api/trpc
```

## Testing the Backend
Once running, test these endpoints in your browser:
- http://localhost:3001/api - API health check
- http://localhost:3001/api/health - Health endpoint
- http://localhost:3001/api/status - Detailed status

## Environment Configuration
Your `.env` file has been updated to use localhost for development:
```
EXPO_PUBLIC_BASE_URL=http://localhost:3001
EXPO_PUBLIC_TRPC_URL=http://localhost:3001/api/trpc
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

## Next Steps
1. Start the backend server using one of the options above
2. Keep the backend running in one terminal
3. In another terminal, start your Expo app: `expo start --web`
4. Your app should now connect successfully to the local backend

## Troubleshooting
- If port 3001 is busy, the script will try to kill existing processes
- Make sure you have `tsx` installed: `npm install -g tsx`
- Check that your `.env` file has the correct localhost URLs
- Verify the backend is running by visiting http://localhost:3001/api in your browser