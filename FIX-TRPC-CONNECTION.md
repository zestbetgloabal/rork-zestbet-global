# Fix tRPC Connection Error

The "Failed to fetch" error occurs because the backend API is not running or not accessible. Here are the solutions:

## Quick Fix (Recommended)

1. **Start the development server:**
   ```bash
   bun run dev-server.ts
   ```

2. **Or use the shell script:**
   ```bash
   chmod +x start-dev.sh
   ./start-dev.sh
   ```

3. **Then start your Expo app:**
   ```bash
   npm start
   ```

## What This Fixes

- ✅ Provides a working API server on `http://localhost:3001`
- ✅ Mock tRPC endpoints that return proper data
- ✅ CORS configured for local development
- ✅ Challenges data that matches your frontend types

## Test the Connection

1. Open the app and go to the Challenges tab
2. Click the debug button (bug icon) to open the connection test
3. You should see successful API connections

## Environment Variables

Make sure your `.env` file has:
```
EXPO_PUBLIC_TRPC_URL=http://localhost:3001/api/trpc
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

## Production Deployment

For production, you'll need to:
1. Deploy the backend to AWS Amplify or another hosting service
2. Update the environment variables to point to your production API
3. Configure proper database connections

## Troubleshooting

If you still see "Mock mode" messages:
1. Check that the dev server is running on port 3001
2. Verify the tRPC URL in the connection test page
3. Make sure CORS is allowing your domain
4. Check the browser network tab for actual HTTP errors

The app will automatically fall back to mock data if the API is unavailable, so it will always work even without a backend.