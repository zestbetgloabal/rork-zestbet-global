import { createTRPCReact } from "@trpc/react-query";
import { splitLink, httpBatchLink, wsLink, createWSClient } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

const getTrpcUrl = (): string => {
  const explicit = process.env.EXPO_PUBLIC_TRPC_URL;
  if (explicit) return explicit;

  const amplifyFunctionUrl = process.env.EXPO_PUBLIC_AMPLIFY_FUNCTION_URL;
  if (amplifyFunctionUrl) {
    const base = amplifyFunctionUrl.replace(/\/$/, "");
    return `${base}/trpc`;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/api/trpc`;
  }

  throw new Error("TRPC URL not configured. Set EXPO_PUBLIC_TRPC_URL or EXPO_PUBLIC_AMPLIFY_FUNCTION_URL.");
};

const getTrpcWsUrl = (): string => {
  const explicit = process.env.EXPO_PUBLIC_TRPC_WS_URL;
  if (explicit) return explicit;
  const httpUrl = getTrpcUrl();
  if (httpUrl.startsWith("https://")) return httpUrl.replace("https://", "wss://");
  if (httpUrl.startsWith("http://")) return httpUrl.replace("http://", "ws://");
  return httpUrl.replace(/^/, "ws://");
};

// Create WebSocket client only if not on web or if explicitly configured
let wsClient: ReturnType<typeof createWSClient> | null = null;
try {
  if (Platform.OS !== 'web' || process.env.EXPO_PUBLIC_TRPC_WS_URL) {
    wsClient = createWSClient({
      url: getTrpcWsUrl(),
    });
  }
} catch (error) {
  console.warn('WebSocket client creation failed:', error);
  wsClient = null;
}

export const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition: (op) => op.type === "subscription",
      true: wsClient 
        ? wsLink({ client: wsClient, transformer: superjson })
        : httpBatchLink({ url: getTrpcUrl(), transformer: superjson }), // Fallback to HTTP for subscriptions
      false: httpBatchLink({ url: getTrpcUrl(), transformer: superjson }),
    }),
  ],
});