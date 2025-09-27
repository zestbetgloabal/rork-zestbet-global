# Fix tRPC Connection Issues

## Problem
The app is showing "❌ tRPC fetch error (attempt 1): TypeError: Failed to fetch" because the production API server at `https://zestapp.online/api/trpc` is not responding.

## Solution

### 1. Start Local Development Server

Run the local development server to provide a working tRPC endpoint:

```bash
# Make the script executable
chmod +x start-dev.sh

# Start the development environment
./start-dev.sh
```

This will:
- Start a local backend server on port 3001
- Provide mock tRPC endpoints
- Show connection status

### 2. Alternative: Direct Server Start

If you prefer to start just the backend server:

```bash
bun run dev-server.ts
```

### 3. Test the Connection

Once the server is running, you can test the connection:

1. Open the app
2. Navigate to "Connection Test Simple" page
3. The test should show successful connections to `http://localhost:3001/api/*`

### 4. What the Development Server Provides

The local development server provides:
- Health check endpoints (`/api`, `/api/status`)
- Mock tRPC endpoints (`/api/trpc`)
- Mock data for challenges and other features
- CORS configuration for local development

### 5. Expected Results

After starting the local server, you should see:
- ✅ `http://localhost:3001/api` - 200 OK
- ✅ `http://localhost:3001/api/status` - 200 OK  
- ✅ `http://localhost:3001/api/trpc` - 200 OK

### 6. Configuration

The tRPC client is configured to:
1. Use local development server (`http://localhost:3001/api/trpc`) in development mode
2. Fall back to production server in production mode
3. Provide helpful error messages when connections fail

### 7. Troubleshooting

If you still see connection errors:

1. **Check if the server is running:**
   ```bash
   curl http://localhost:3001/api/status
   ```

2. **Check the console logs** for detailed error messages

3. **Verify port 3001 is available** (not used by another process)

4. **Try the connection test page** in the app to see detailed results

## Files Modified

- `/lib/trpc.ts` - Updated to prioritize local development server
- `/dev-server.ts` - Mock development server with tRPC endpoints
- `/start-dev.sh` - Script to start development environment
- `/app/connection-test-simple.tsx` - Updated to test local endpoints

## Next Steps

1. Start the local development server
2. Test the connection using the app
3. Develop your features using the local backend
4. Deploy to production when ready