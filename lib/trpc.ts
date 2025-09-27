import { createTRPCReact } from "@trpc/react-query";
import { createTRPCProxyClient, httpBatchLink, splitLink, wsLink, createWSClient } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";
import Constants from "expo-constants";

export const trpc = createTRPCReact<AppRouter>();

const resolveDevHost = (): string | null => {
  try {
    const hostUri: string | undefined = (Constants.expoConfig as any)?.hostUri ?? (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ?? (Constants as any)?.manifest?.debuggerHost;
    if (hostUri) {
      const host = hostUri.split(":")[0];
      if (host && host !== "localhost" && host !== "127.0.0.1") {
        return host;
      }
    }
  } catch {}
  return null;
};

const getTrpcUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_TRPC_URL ?? process.env.TRPC_URL;
  if (envUrl && envUrl.startsWith("http")) {
    console.log("🔧 Using EXPO_PUBLIC_TRPC_URL:", envUrl);
    return envUrl;
  }

  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.location?.origin) {
      const origin = window.location.origin;
      if (__DEV__ && (origin.includes("localhost") || origin.includes("127.0.0.1"))) {
        const devUrl = "http://localhost:3001/api/trpc";
        console.log("🌐 Using web dev URL:", devUrl);
        return devUrl;
      }
      return `${origin}/api/trpc`;
    }
  }

  if (__DEV__) {
    const host = resolveDevHost();
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      const url = `http://${host}:3001/api/trpc`;
      console.log("🏠 Using LAN dev URL:", url);
      return url;
    }
    console.log("🏠 Using localhost dev URL");
    return "http://localhost:3001/api/trpc";
  }

  const fallbackUrl = "https://zestapp.online/api/trpc";
  console.log("📱 Using fallback production URL:", fallbackUrl);
  return fallbackUrl;
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
    return 'https://zestapp.online/api/trpc';
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
      const tryFetch = async (url: string, retryCount = 0): Promise<Response> => {
        try {
          console.log(`🔄 tRPC request attempt ${retryCount + 1} to:`, url);

          const controller = new AbortController();
          const timeoutMs = __DEV__ ? 10000 : 30000;
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

          const response = await fetch(url, {
            ...init,
            method: init?.method || 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
              'User-Agent': 'ZestBet-Mobile-App',
              ...init?.headers,
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          console.log('📡 tRPC response status:', response.status);

          if (!response.ok) {
            const contentType = response.headers.get('content-type');
            console.log('📄 Response content-type:', contentType);

            if (contentType?.includes('text/html')) {
              const text = await response.clone().text();
              console.error('❌ Received HTML instead of JSON. API endpoint may not be working.');
              console.log('HTML response preview:', text.substring(0, 500));

              if (text.includes('404') || text.includes('Not Found')) {
                throw new Error(`API endpoint not found. The tRPC server may not be deployed correctly.`);
              }

              throw new Error(`API returned HTML instead of JSON. Server may be misconfigured.`);
            }

            try {
              const errorData = await response.clone().json();
              throw new Error(`API Error ${response.status}: ${errorData.message || errorData.error || 'Unknown error'}`);
            } catch {
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

          if (error instanceof Error) {
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
              if (__DEV__ && url.includes('localhost')) {
                throw new Error('Local development server not responding. Please start the backend server with: ./start-backend.sh or bun run dev-server.ts');
              }
              throw new Error('Request timeout. The API server may be slow or unavailable.');
            }
            if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
              const isLocal = /localhost|127\.0\.0\.1/.test(url);
              if (isLocal || url.includes(':3001')) {
                throw new Error(`Cannot connect to local development server. Run: ./start-backend.sh or bun run dev-server.ts to start the backend on port 3001.`);
              }
              throw new Error('Network connection failed. Check your internet connection and API server status.');
            }
            if (error.message.includes('API Error') || error.message.includes('API endpoint')) {
              throw error;
            }
          }
          throw new Error(`Connection error: ${String(error)}`);
        }
      };

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

  const results: Array<{ endpoint: string; success: boolean; status?: number; contentType?: string | null; data?: unknown; error?: string }> = [];

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