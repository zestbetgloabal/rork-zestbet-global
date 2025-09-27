# ZestBet Development Setup

## Quick Fix for tRPC Connection Errors

The error "Failed to fetch" occurs because the backend development server is not running.

### Solution 1: Start Backend Server (Recommended)

Run one of these commands in your terminal:

```bash
# Option 1: Use the provided script
./start-backend.sh

# Option 2: Run directly with bun
bun run dev-server.ts

# Option 3: Use the full development script
./start-dev.sh
```

### Solution 2: Make Scripts Executable (if needed)

If you get permission errors, make the scripts executable:

```bash
chmod +x start-backend.sh
chmod +x start-dev.sh
```

### Verify Backend is Running

Once started, you should see:
- Backend server running at: http://localhost:3001
- API Status: http://localhost:3001/api/status
- tRPC Endpoint: http://localhost:3001/api/trpc

### Development Workflow

1. **Start Backend**: `./start-backend.sh` (in one terminal)
2. **Start Frontend**: `expo start --web` (in another terminal)

### Troubleshooting

- **Port 3001 in use**: Kill existing processes with `lsof -ti:3001 | xargs kill -9`
- **Bun not installed**: Install with `curl -fsSL https://bun.sh/install | bash`
- **Still getting errors**: Check console logs for specific error messages

The app will work with mock data once the backend server is running.