import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { createServer } from "http";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import WebRTCService from "./services/webrtc";

// Extend global type for WebRTC service
declare global {
  var webrtcService: WebRTCService | undefined;
}

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors());

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// WebRTC/Socket.IO endpoint for live betting
app.get("/live-betting-status", (c) => {
  // This would be used to check WebRTC service status
  return c.json({ 
    status: "ok", 
    message: "Live betting service is running",
    activeRooms: globalThis.webrtcService?.getActiveRooms() || []
  });
});

// Initialize WebRTC service when server starts
if (typeof global !== 'undefined') {
  // Create HTTP server for Socket.IO
  const httpServer = createServer();
  
  // Initialize WebRTC service
  globalThis.webrtcService = new WebRTCService(httpServer);
  
  // Start HTTP server for Socket.IO on a different port
  const SOCKET_PORT = process.env.SOCKET_PORT || 3001;
  httpServer.listen(SOCKET_PORT, () => {
    console.log(`WebRTC/Socket.IO server running on port ${SOCKET_PORT}`);
  });
}

export default app;