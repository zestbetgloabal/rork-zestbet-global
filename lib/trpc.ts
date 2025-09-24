import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, splitLink, wsLink, createWSClient } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";
import { debugApiCall } from "@/utils/crashPrevention";

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

// Debug function to log TRPC URL configuration
const debugTrpcConfig = () => {
  const url = getTrpcUrl();
  console.log('🔧 TRPC Configuration:', {
    url,
    explicit: process.env.EXPO_PUBLIC_TRPC_URL,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    amplifyUrl: process.env.EXPO_PUBLIC_AMPLIFY_FUNCTION_URL,
    platform: Platform.OS,
    windowOrigin: typeof window !== 'undefined' ? window.location?.origin : 'N/A'
  });
  return url;
};

// Enhanced HTTP link with better error handling
const createHttpLink = () => {
  const url = debugTrpcConfig();
  
  return httpBatchLink({
    url,
    transformer: superjson,
    headers() {
      const headers = getAuthHeaders();
      console.log('📤 TRPC Request Headers:', headers);
      return headers;
    },
    fetch: async (input, init) => {
      console.log('🌐 TRPC Fetch:', {
        url: input,
        method: init?.method,
        headers: init?.headers,
        bodyPreview: init?.body ? String(init.body).substring(0, 200) : undefined
      });
      
      try {
        const response = await fetch(input, init);
        
        console.log('📥 TRPC Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url
        });
        
        // Clone response to read body for debugging
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();
        
        if (!response.ok) {
          console.error('❌ TRPC HTTP Error:', {
            status: response.status,
            statusText: response.statusText,
            body: text.substring(0, 500)
          });
        } else {
          console.log('✅ TRPC Response Body Preview:', text.substring(0, 200));
        }
        
        return response;
      } catch (error) {
        console.error('❌ TRPC Fetch Failed:', error);
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

// Test function to verify TRPC connection
export const testTrpcConnection = async () => {
  console.log('🧪 Testing TRPC Connection...');
  
  try {
    const result = await debugApiCall(getTrpcUrl().replace('/trpc', '/status'));
    console.log('🔍 API Status Check:', result);
    
    if (result.success) {
      console.log('✅ API is reachable');
    } else {
      console.error('❌ API is not reachable:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ TRPC Connection Test Failed:', error);
    return { success: false, error: String(error) };
  }
};