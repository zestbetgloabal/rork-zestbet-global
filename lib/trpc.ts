import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, splitLink, wsLink, createWSClient } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

const getTrpcUrl = (): string => {
  // First check for explicit tRPC URL
  const explicit = process.env.EXPO_PUBLIC_TRPC_URL;
  if (explicit && explicit !== 'https://your-api-gateway-id.execute-api.eu-central-1.amazonaws.com/prod') {
    return explicit.endsWith('/trpc') ? explicit : `${explicit}/trpc`;
  }

  // Check for API URL and append /trpc
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (apiUrl && apiUrl !== 'https://your-api-gateway-id.execute-api.eu-central-1.amazonaws.com/prod') {
    const base = apiUrl.replace(/\/$/, "");
    return `${base}/trpc`;
  }

  // Fallback for Amplify function URL
  const amplifyFunctionUrl = process.env.EXPO_PUBLIC_AMPLIFY_FUNCTION_URL;
  if (amplifyFunctionUrl) {
    const base = amplifyFunctionUrl.replace(/\/$/, "");
    return `${base}/trpc`;
  }

  // Development fallback
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/api/trpc`;
  }

  throw new Error("TRPC URL not configured. Set EXPO_PUBLIC_API_URL with your Lambda API Gateway URL.");
};

const getWsUrl = (): string => {
  const httpUrl = getTrpcUrl();
  return httpUrl.replace(/^http/, 'ws');
};

const getAuthHeaders = () => {
  try {
    // Lazy require to avoid import cycles in some environments
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useAuthStore } = require('@/store/authStore');
    const token: string | null = useAuthStore.getState()?.token ?? null;
    if (token && token !== 'null' && token !== 'undefined') {
      return { authorization: `Bearer ${token}` } as Record<string, string>;
    }
  } catch (e) {
    console.warn('Auth store not available for TRPC headers');
  }
  return {} as Record<string, string>;
};

const createWebSocketClient = () => {
  if (Platform.OS === 'web') {
    try {
      return createWSClient({
        url: getWsUrl(),
      });
    } catch (error) {
      console.warn('WebSocket not supported, falling back to HTTP only');
      return null;
    }
  }
  return null;
};

const wsClient = createWebSocketClient();

export const trpcClient = trpc.createClient({
  links: [
    wsClient ? splitLink({
      condition(op) {
        return op.type === 'subscription';
      },
      true: wsLink({
        client: wsClient,
        transformer: superjson,
      }),
      false: httpBatchLink({ 
        url: getTrpcUrl(), 
        transformer: superjson,
        headers() {
          return getAuthHeaders();
        },
      }),
    }) : httpBatchLink({ 
      url: getTrpcUrl(), 
      transformer: superjson,
      headers() {
        return getAuthHeaders();
      },
    }),
  ],
});