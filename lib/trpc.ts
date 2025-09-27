import { createTRPCReact } from "@trpc/react-query";
import { createTRPCProxyClient, httpBatchLink, splitLink, wsLink, createWSClient } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";


export const trpc = createTRPCReact<AppRouter>();

const getTrpcUrl = (): string => {
  // Check environment variables first
  if (process.env.EXPO_PUBLIC_TRPC_URL) {
    console.log('🔗 Using env TRPC URL:', process.env.EXPO_PUBLIC_TRPC_URL);
    return process.env.EXPO_PUBLIC_TRPC_URL;
  }
  
  // For web environments, use current domain
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin;
    
    // For localhost development - try local backend first
    if (origin.includes('localhost')) {
      console.log('🔗 Development mode - trying local backend first');
      return 'http://localhost:3001/api/trpc';
    }
    
    // Check if we're on production domains
    if (origin.includes('zestapp.online') || origin.includes('amplifyapp.com')) {
      // Try multiple possible endpoints
      const possibleUrls = [
        `${origin}/api/trpc`,
        `${origin}/trpc`,
        'https://zestapp.online/api/trpc'
      ];
      console.log('🔗 Production domain detected, will try:', possibleUrls[0]);
      return possibleUrls[0];
    }
  }

  // Production URL - hardcoded fallback for mobile
  const productionUrl = 'https://zestapp.online/api/trpc';
  console.log('📱 Using production URL for mobile:', productionUrl);
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

// HTTP link with better error handling and graceful fallback
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
      const tryFetch = async (url: string, retryCount = 0): Promise<Response> => {
        try {
          console.log(`🔄 tRPC request attempt ${retryCount + 1} to:`, url);
          
          const response = await fetch(url, {
            ...init,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...init?.headers,
            },
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(8000), // 8 second timeout
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
              
              // Try alternative endpoints if this is the first attempt
              if (retryCount === 0 && typeof input === 'string') {
                const baseUrl = input.replace('/api/trpc', '').replace('/trpc', '');
                const alternativeUrls = [
                  `${baseUrl}/trpc`,
                  `${baseUrl}/api/trpc`,
                  'https://zestapp.online/api/trpc',
                  'https://zestapp.online/trpc'
                ].filter(u => u !== url);
                
                for (const altUrl of alternativeUrls) {
                  try {
                    console.log('🔄 Trying alternative URL:', altUrl);
                    return await tryFetch(altUrl, retryCount + 1);
                  } catch (e) {
                    console.log('❌ Alternative URL failed:', altUrl);
                    continue;
                  }
                }
              }
              
              throw new Error(`Mock mode - using fallback data. API returned HTML instead of JSON.`);
            }
            
            // Try to get error message from JSON response
            try {
              const errorData = await response.clone().json();
              throw new Error(`Mock mode - using fallback data. API Error ${response.status}: ${errorData.message || 'Unknown error'}`);
            } catch {
              // If it's a 404, suggest checking API deployment
              if (response.status === 404) {
                throw new Error(`Mock mode - using fallback data. API endpoint not found (404).`);
              }
              throw new Error(`Mock mode - using fallback data. API Error ${response.status}: ${response.statusText}`);
            }
          }
          
          return response;
        } catch (error) {
          console.error(`❌ tRPC fetch error (attempt ${retryCount + 1}):`, error);
          
          // Try alternative endpoints on network errors (but only once)
          if (retryCount === 0 && typeof input === 'string') {
            const baseUrl = input.replace('/api/trpc', '').replace('/trpc', '');
            const alternativeUrls = [
              `${baseUrl}/trpc`,
              `${baseUrl}/api/trpc`,
              'https://zestapp.online/api/trpc',
              'https://zestapp.online/trpc'
            ].filter(u => u !== url);
            
            for (const altUrl of alternativeUrls) {
              try {
                console.log('🔄 Trying alternative URL after error:', altUrl);
                return await tryFetch(altUrl, retryCount + 1);
              } catch (e) {
                console.log('❌ Alternative URL failed:', altUrl);
                continue;
              }
            }
          }
          
          // Convert all network errors to mock mode errors
          if (error instanceof Error) {
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
              throw new Error('Mock mode - using fallback data. Request timeout.');
            }
            if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
              throw new Error('Mock mode - using fallback data. Network connection failed.');
            }
            // Re-throw if already a mock mode error
            if (error.message.includes('Mock mode')) {
              throw error;
            }
          }
          throw new Error('Mock mode - using fallback data. Connection error.');
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