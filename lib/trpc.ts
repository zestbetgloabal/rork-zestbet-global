import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, splitLink, wsLink, createWSClient } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";
import { debugApiCall } from "@/utils/crashPrevention";

export const trpc = createTRPCReact<AppRouter>();

const getTrpcUrl = (): string => {
  // Log environment variables for debugging
  console.log('🔍 Environment check:');
  console.log('EXPO_PUBLIC_TRPC_URL:', process.env.EXPO_PUBLIC_TRPC_URL);
  console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
  console.log('EXPO_PUBLIC_BASE_URL:', process.env.EXPO_PUBLIC_BASE_URL);
  
  // For AWS Amplify, use the current domain with /api/trpc
  if (typeof window !== "undefined" && window.location?.origin) {
    const amplifyUrl = `${window.location.origin}/api/trpc`;
    console.log('🔗 Using Amplify URL:', amplifyUrl);
    return amplifyUrl;
  }

  // First check for explicit tRPC URL
  const explicit = process.env.EXPO_PUBLIC_TRPC_URL;
  if (explicit && explicit !== 'https://your-api-gateway-id.execute-api.eu-central-1.amazonaws.com/prod') {
    console.log('Using explicit tRPC URL:', explicit);
    return explicit.endsWith('/trpc') ? explicit : `${explicit}/trpc`;
  }

  // Check for API URL and append /trpc
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (apiUrl && apiUrl !== 'https://your-api-gateway-id.execute-api.eu-central-1.amazonaws.com/prod') {
    const base = apiUrl.replace(/\/$/, "");
    const trpcUrl = `${base}/trpc`;
    console.log('Using API URL for tRPC:', trpcUrl);
    return trpcUrl;
  }

  // Check for base URL and append /api/trpc
  const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
  if (baseUrl && baseUrl !== 'https://your-api-gateway-id.execute-api.eu-central-1.amazonaws.com/prod') {
    const base = baseUrl.replace(/\/$/, "");
    const trpcUrl = `${base}/api/trpc`;
    console.log('Using base URL for tRPC:', trpcUrl);
    return trpcUrl;
  }

  // Fallback for Amplify function URL
  const amplifyFunctionUrl = process.env.EXPO_PUBLIC_AMPLIFY_FUNCTION_URL;
  if (amplifyFunctionUrl) {
    const base = amplifyFunctionUrl.replace(/\/$/, "");
    return `${base}/trpc`;
  }

  // Hardcoded fallback for production (since env vars are not loading)
  const productionUrl = 'https://zestapp.online/api/trpc';
  console.log('⚠️ Using hardcoded production URL:', productionUrl);
  return productionUrl;
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

// Simple function to get TRPC URL without excessive logging
const getTrpcUrlSafe = () => {
  try {
    return getTrpcUrl();
  } catch (error) {
    console.warn('TRPC URL configuration error:', error);
    // Hardcoded fallback for production
    return 'https://zestapp.online/api/trpc';
  }
};

// HTTP link with better error handling
const createHttpLink = () => {
  const url = getTrpcUrlSafe();
  console.log('🔗 Creating tRPC HTTP link with URL:', url);
  
  return httpBatchLink({
    url,
    transformer: superjson,
    headers() {
      const headers = getAuthHeaders();
      console.log('📡 tRPC request headers:', headers);
      return headers;
    },
    fetch: async (input, init) => {
      console.log('🌐 tRPC fetch request:', input, init?.method || 'GET');
      
      try {
        const response = await fetch(input, init);
        console.log('📥 tRPC response status:', response.status, response.statusText);
        
        // Log response headers for debugging
        const contentType = response.headers.get('content-type');
        console.log('📄 Response content-type:', contentType);
        
        // If we get HTML instead of JSON, log it
        if (!contentType?.includes('application/json') && !response.ok) {
          const text = await response.clone().text();
          console.error('❌ Received HTML instead of JSON:', text.substring(0, 200));
          console.error('This usually means the API endpoint is not working properly');
        }
        
        return response;
      } catch (error) {
        console.error('❌ tRPC fetch error:', error);
        throw error;
      }
    },
  });
};

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
      false: createHttpLink(),
    }) : createHttpLink(),
  ],
});

// Simple connection test
export const testTrpcConnection = async () => {
  try {
    const url = getTrpcUrlSafe();
    const response = await fetch(url.replace('/trpc', '/status'));
    return { success: response.ok, status: response.status };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};