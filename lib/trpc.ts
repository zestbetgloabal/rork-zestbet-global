import { createTRPCReact } from "@trpc/react-query";
import { createTRPCProxyClient, httpBatchLink, splitLink, wsLink, createWSClient } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";


export const trpc = createTRPCReact<AppRouter>();

const getTrpcUrl = (): string => {
  // Always use mock mode for now to prevent fetch errors
  console.log('🎭 Using mock mode - API connection disabled');
  return 'mock://localhost';
  
  // TODO: Re-enable API connection once backend is properly deployed
  /*
  // Check environment variables first
  if (process.env.EXPO_PUBLIC_TRPC_URL) {
    console.log('🔗 Using env TRPC URL:', process.env.EXPO_PUBLIC_TRPC_URL);
    return process.env.EXPO_PUBLIC_TRPC_URL;
  }
  
  // For web environments, use current domain
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin;
    
    // For localhost development - use mock data mode
    if (origin.includes('localhost')) {
      console.log('🔗 Development mode - using mock data');
      return 'mock://localhost'; // Special mock URL
    }
    
    // Check if we're on production domains
    if (origin.includes('zestapp.online') || origin.includes('amplifyapp.com')) {
      const amplifyUrl = `${origin}/api/trpc`;
      console.log('🔗 Using production URL:', amplifyUrl);
      return amplifyUrl;
    }
  }

  // Production URL - hardcoded fallback for mobile
  const productionUrl = 'https://zestapp.online/api/trpc';
  console.log('📱 Using production URL for mobile:', productionUrl);
  return productionUrl;
  */
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

// HTTP link with better error handling and mock support
const createHttpLink = () => {
  const url = getTrpcUrlSafe();
  console.log('🔗 Creating tRPC HTTP link with URL:', url);
  
  // If using mock URL, return a mock link that always fails gracefully
  if (url.startsWith('mock://')) {
    console.log('🎭 Using mock tRPC link - all queries will use fallback data');
    return httpBatchLink({
      url: 'http://localhost:3000/mock-trpc', // This will fail and trigger fallbacks
      transformer: superjson,
      headers: () => ({}),
      fetch: async () => {
        // Always throw to trigger fallback behavior
        throw new Error('Mock mode - using fallback data');
      },
    });
  }
  
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
        
        console.log('🔄 tRPC request to:', input);
        
        const response = await fetch(input, {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
          },
        });
        
        console.log('📡 tRPC response status:', response.status);
        
        // Check if response is ok
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          console.log('📄 Response content-type:', contentType);
          
          if (contentType?.includes('text/html')) {
            const text = await response.clone().text();
            console.error('❌ Received HTML instead of JSON. API endpoint may not be working.');
            console.error('Response preview:', text.substring(0, 500));
            throw new Error(`API returned HTML instead of JSON. Status: ${response.status}. This usually means the API endpoint is not properly configured.`);
          }
          
          // Try to get error message from JSON response
          try {
            const errorData = await response.clone().json();
            throw new Error(`API Error ${response.status}: ${errorData.message || 'Unknown error'}`);
          } catch {
            // If it's a 404, suggest checking API deployment
            if (response.status === 404) {
              throw new Error(`API endpoint not found (404). The API may not be properly deployed or the routing is incorrect. Check AWS Amplify configuration.`);
            }
            throw new Error(`API Error ${response.status}: ${response.statusText}`);
          }
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