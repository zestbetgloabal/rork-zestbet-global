import { createTRPCReact } from "@trpc/react-query";
import { createTRPCProxyClient, httpBatchLink, splitLink, wsLink, createWSClient } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";


export const trpc = createTRPCReact<AppRouter>();

const getTrpcUrl = (): string => {
  // Check environment variables first
  if (process.env.EXPO_PUBLIC_TRPC_URL) {
    return process.env.EXPO_PUBLIC_TRPC_URL;
  }
  
  // Production URL - hardcoded fallback
  const productionUrl = 'https://zestapp.online/api/trpc';
  
  // For web environments, use current domain
  if (typeof window !== "undefined" && window.location?.origin) {
    // Check if we're on production domains
    if (window.location.origin.includes('zestapp.online') || 
        window.location.origin.includes('amplifyapp.com')) {
      const amplifyUrl = `${window.location.origin}/api/trpc`;
      if (__DEV__) console.log('🔗 Using production URL:', amplifyUrl);
      return amplifyUrl;
    }
    // For localhost development
    if (window.location.origin.includes('localhost')) {
      const localUrl = `${window.location.origin}/api/trpc`;
      if (__DEV__) console.log('🔗 Using local URL:', localUrl);
      return localUrl;
    }
  }

  // For mobile/native, always use production URL
  if (__DEV__) console.log('📱 Using production URL for mobile:', productionUrl);
  return productionUrl;
};

const getWsUrl = (): string => {
  const httpUrl = getTrpcUrl();
  return httpUrl.replace(/^http/, 'ws');
};

const getAuthHeaders = () => {
  try {
    // Dynamic import to avoid import cycles
    const { useAuthStore } = require('@/store/authStore') as { useAuthStore: any };
    const token: string | null = useAuthStore.getState()?.token ?? null;
    if (token && token !== 'null' && token !== 'undefined') {
      return { authorization: `Bearer ${token}` } as Record<string, string>;
    }
  } catch {
    if (__DEV__) console.warn('Auth store not available for TRPC headers');
  }
  return {} as Record<string, string>;
};

const createWebSocketClient = () => {
  if (Platform.OS === 'web') {
    try {
      return createWSClient({
        url: getWsUrl(),
      });
    } catch {
      if (__DEV__) console.warn('WebSocket not supported, falling back to HTTP only');
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
      try {
        // Validate input URL
        if (!input || (typeof input === 'string' && input.trim().length === 0)) {
          throw new Error('Invalid request URL');
        }
        
        const response = await fetch(input, {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
          },
        });
        
        // Check if response is ok
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('text/html')) {
            const text = await response.clone().text();
            if (__DEV__) {
              console.error('❌ Received HTML instead of JSON. API endpoint may not be working.');
              console.error('Response:', text.substring(0, 300));
            }
            throw new Error(`API returned HTML instead of JSON. Status: ${response.status}`);
          }
        }
        
        return response;
      } catch (error) {
        if (__DEV__) console.error('❌ tRPC fetch error:', error);
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

// Create a vanilla client for direct usage (non-React)
export const vanillaTrpcClient = createTRPCProxyClient<AppRouter>({
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