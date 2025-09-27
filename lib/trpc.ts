import { createTRPCReact } from "@trpc/react-query";
import { createTRPCProxyClient, httpBatchLink, splitLink, wsLink, createWSClient } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";


export const trpc = createTRPCReact<AppRouter>();

const getTrpcUrl = (): string => {
  // Check environment variables first
  if (process.env.EXPO_PUBLIC_TRPC_URL) {
    console.log('🔧 Using EXPO_PUBLIC_TRPC_URL:', process.env.EXPO_PUBLIC_TRPC_URL);
    return process.env.EXPO_PUBLIC_TRPC_URL;
  }
  
  // For web environments, use current domain
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin;
    console.log('🌐 Detected web origin:', origin);
    
    // For localhost development - try local backend first
    if (origin.includes('localhost')) {
      const localUrl = 'http://localhost:3001/api/trpc';
      console.log('🏠 Using local development URL:', localUrl);
      return localUrl;
    }
    
    // Check if we're on production domains
    if (origin.includes('zestapp.online') || origin.includes('amplifyapp.com')) {
      // Use current origin for production
      const prodUrl = `${origin}/api/trpc`;
      console.log('🚀 Using production URL from origin:', prodUrl);
      return prodUrl;
    }
  }

  // Production URL - hardcoded fallback for mobile
  const fallbackUrl = 'https://zestapp.online/api/trpc';
  console.log('📱 Using fallback production URL:', fallbackUrl);
  return fallbackUrl;
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

// HTTP link with better error handling and graceful fallback
const createHttpLink = () => {
  const url = getTrpcUrlSafe();
  
  return httpBatchLink({
    url,
    transformer: superjson,
    headers() {
      return getAuthHeaders();
    },
    fetch: async (input, init) => {
      const tryFetch = async (url: string, retryCount = 0): Promise<Response> => {
        try {
          console.log(`🔄 tRPC request attempt ${retryCount + 1} to:`, url);
          
          // Create timeout signal with longer timeout for production
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const response = await fetch(url, {
            ...init,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...init?.headers,
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          console.log('📡 tRPC response status:', response.status);
          
          // Check if response is ok
          if (!response.ok) {
            const contentType = response.headers.get('content-type');
            console.log('📄 Response content-type:', contentType);
            
            if (contentType?.includes('text/html')) {
              const text = await response.clone().text();
              console.error('❌ Received HTML instead of JSON. API endpoint may not be working.');
              
              // Check if it's a 404 page or error page
              if (text.includes('404') || text.includes('Not Found')) {
                throw new Error(`API endpoint not found. The tRPC server may not be deployed correctly.`);
              }
              
              throw new Error(`API returned HTML instead of JSON. Server may be misconfigured.`);
            }
            
            // Try to get error message from JSON response
            try {
              const errorData = await response.clone().json();
              throw new Error(`API Error ${response.status}: ${errorData.message || errorData.error || 'Unknown error'}`);
            } catch {
              // If it's a 404, suggest checking API deployment
              if (response.status === 404) {
                throw new Error(`API endpoint not found (404). Check if the tRPC server is deployed.`);
              }
              if (response.status === 500) {
                throw new Error(`Internal server error (500). Check server logs.`);
              }
              if (response.status === 502 || response.status === 503) {
                throw new Error(`Server unavailable (${response.status}). The API server may be down.`);
              }
              throw new Error(`API Error ${response.status}: ${response.statusText}`);
            }
          }
          
          console.log('✅ tRPC request successful');
          return response;
        } catch (error) {
          console.error(`❌ tRPC fetch error (attempt ${retryCount + 1}):`, error);
          
          // Handle specific error types
          if (error instanceof Error) {
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
              throw new Error('Request timeout. The API server may be slow or unavailable.');
            }
            if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
              // Try to provide more specific error information
              if (url.includes('localhost')) {
                throw new Error('Cannot connect to local development server. Make sure the backend is running on port 3001.');
              }
              throw new Error('Network connection failed. Check your internet connection and API server status.');
            }
            // Re-throw API-specific errors
            if (error.message.includes('API Error') || error.message.includes('API endpoint')) {
              throw error;
            }
          }
          throw new Error(`Connection error: ${String(error)}`);
        }
      };
      
      // Validate input URL
      if (!input || (typeof input === 'string' && input.trim().length === 0)) {
        throw new Error('Invalid request URL');
      }
      
      return await tryFetch(typeof input === 'string' ? input : input.toString());
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

// Enhanced connection test with multiple endpoints
export const testTrpcConnection = async () => {
  const baseUrl = getTrpcUrlSafe().replace('/trpc', '');
  
  // Test multiple possible endpoints
  const testEndpoints = [
    `${baseUrl}/status`,
    `${baseUrl}/api/status`,
    `${baseUrl}/health`,
    `${baseUrl}/api`,
    baseUrl
  ];
  
  const results = [];
  
  for (const endpoint of testEndpoints) {
    try {
      console.log('🔍 Testing endpoint:', endpoint);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const contentType = response.headers.get('content-type');
      let data = null;
      
      try {
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      } catch {
        data = 'Could not parse response';
      }
      
      results.push({
        endpoint,
        success: response.ok,
        status: response.status,
        contentType,
        data: typeof data === 'string' ? data.substring(0, 200) : data
      });
      
      // If we found a working endpoint, return early
      if (response.ok) {
        console.log('✅ Found working endpoint:', endpoint);
        break;
      }
    } catch (error) {
      results.push({
        endpoint,
        success: false,
        error: String(error)
      });
    }
  }
  
  return {
    baseUrl,
    results,
    workingEndpoint: results.find(r => r.success)?.endpoint || null
  };
};