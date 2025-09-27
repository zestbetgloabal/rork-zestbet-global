import { createTRPCReact } from "@trpc/react-query";
import { createTRPCProxyClient, httpBatchLink, splitLink, wsLink, createWSClient } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { mockChallenges, mockBets, mockSocialPosts, mockMissions, mockImpactProjects, mockLeaderboard } from '@/constants/mockData';

export const trpc = createTRPCReact<AppRouter>();

// Mock response generator for demo mode
const generateMockResponse = (url: string, body: any) => {
  console.log('🎭 Generating mock response for:', url, body);
  
  // Parse tRPC batch requests
  if (body && Array.isArray(body)) {
    return body.map((request: any) => {
      const path = request.path;
      const input = request.input;
      
      switch (path) {
        case 'challenges.list':
          return {
            result: {
              data: {
                challenges: mockChallenges,
                total: mockChallenges.length,
                hasMore: false
              }
            }
          };
          
        case 'bets.list':
          return {
            result: {
              data: {
                bets: mockBets,
                total: mockBets.length,
                hasMore: false
              }
            }
          };
          
        case 'user.profile':
          return {
            result: {
              data: {
                id: 'demo-user',
                username: 'DemoUser',
                email: 'demo@zestbet.com',
                zestBalance: 1250,
                dailyBetAmount: 0,
                lastBetDate: new Date().toISOString(),
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
              }
            }
          };
          
        case 'wallet.balance':
          return {
            result: {
              data: {
                balance: 1250,
                pendingBalance: 0,
                totalEarned: 2500,
                totalSpent: 1250
              }
            }
          };
          
        case 'example.hi':
          return {
            result: {
              data: {
                message: `Hello ${input?.name || 'Demo User'}! This is a mock response.`,
                timestamp: new Date().toISOString()
              }
            }
          };
          
        default:
          return {
            result: {
              data: {
                message: 'Mock response for ' + path,
                success: true
              }
            }
          };
      }
    });
  }
  
  // Single request fallback
  return {
    result: {
      data: {
        message: 'Mock API response',
        success: true,
        timestamp: new Date().toISOString()
      }
    }
  };
};



const getTrpcUrl = (): string => {
  // Check for environment variables first
  const envUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_TRPC_URL || process.env.EXPO_PUBLIC_TRPC_URL;
  
  if (envUrl) {
    console.log("🔗 Using environment TRPC URL:", envUrl);
    return envUrl;
  }
  
  // Production fallback - your Amplify URL
  const prodUrl = "https://main.ddk0z2esbs19wf.amplifyapp.com/api/trpc";
  
  // Development fallback
  const devUrl = Platform.select({
    web: __DEV__ ? "http://localhost:3001/api/trpc" : prodUrl,
    default: __DEV__ ? "http://localhost:3001/api/trpc" : prodUrl
  });
  
  console.log("🔗 Using development TRPC URL:", devUrl);
  return devUrl;
};

const getWsUrl = (): string => {
  const httpUrl = getTrpcUrl();
  return httpUrl.replace(/^http/, "ws");
};

const getAuthHeaders = () => {
  try {
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

const getTrpcUrlSafe = () => {
  try {
    return getTrpcUrl();
  } catch (error) {
    console.warn('TRPC URL configuration error:', error);
    return 'https://main.ddk0z2esbs19wf.amplifyapp.com/api/trpc';
  }
};

const createHttpLink = () => {
  const url = getTrpcUrlSafe();

  return httpBatchLink({
    url,
    transformer: superjson,
    headers() {
      return getAuthHeaders();
    },
    fetch: async (input, init) => {
      try {
        console.log('🌐 Making real API call to:', typeof input === 'string' ? input : input.toString());
        
        // Make real fetch request
        const response = await fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error('❌ API request failed:', response.status, response.statusText);
          
          // If backend is not available, fall back to mock data
          if (response.status >= 500 || !response.status) {
            console.log('🎭 Falling back to mock data due to server error');
            const url = typeof input === 'string' ? input : input.toString();
            const body = init?.body ? JSON.parse(init.body as string) : null;
            const mockResponse = generateMockResponse(url, body);
            
            return new Response(JSON.stringify(mockResponse), {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              },
            });
          }
        }
        
        return response;
      } catch (error) {
        console.error('❌ Network error, falling back to mock data:', error);
        
        // Network error - fall back to mock data
        const url = typeof input === 'string' ? input : input.toString();
        const body = init?.body ? JSON.parse(init.body as string) : null;
        const mockResponse = generateMockResponse(url, body);
        
        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
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

export const testTrpcConnection = async () => {
  const baseUrl = getTrpcUrlSafe().replace('/trpc', '');

  const testEndpoints = [
    `${baseUrl}/status`,
    `${baseUrl}/api/status`,
    `${baseUrl}/health`,
    `${baseUrl}/api`,
    baseUrl
  ];

  const results: { endpoint: string; success: boolean; status?: number; contentType?: string | null; data?: unknown; error?: string }[] = [];

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
      let data: unknown = null;

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
        data: typeof data === 'string' ? (data as string).substring(0, 200) : data,
      });

      if (response.ok) {
        console.log('✅ Found working endpoint:', endpoint);
        break;
      }
    } catch (error) {
      results.push({
        endpoint,
        success: false,
        error: String(error),
      });
    }
  }

  return {
    baseUrl,
    results,
    workingEndpoint: results.find((r) => r.success)?.endpoint || null,
  };
};

export const testTrpcHello = async () => {
  try {
    const result = await vanillaTrpcClient.example.hi.query({ name: 'ConnectionTest' });
    console.log('✅ tRPC connection successful:', result);
    return { success: true, data: result } as const;
  } catch (error) {
    console.error('❌ tRPC connection failed:', error);
    return { success: false, error: String(error) } as const;
  }
};