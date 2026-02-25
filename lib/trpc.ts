import { createTRPCReact } from "@trpc/react-query";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import Constants from 'expo-constants';

export const trpc = createTRPCReact<AppRouter>();

const getTrpcUrl = (): string => {
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  if (configUrl) return `${configUrl}/api/trpc`;

  if (__DEV__) {
    return 'http://localhost:3000/api/trpc';
  }

  return 'https://zestbet.app/api/trpc';
};

const getAuthHeaders = (): Record<string, string> => {
  try {
    const { useAuthStore } = require('@/store/authStore') as { useAuthStore: any };
    const token: string | null = useAuthStore.getState()?.token ?? null;
    if (token && token !== 'null' && token !== 'undefined') {
      return { authorization: `Bearer ${token}` };
    }
  } catch {
    if (__DEV__) console.warn('Auth store not available for TRPC headers');
  }
  return {};
};

const createHttpLink = () => {
  return httpBatchLink({
    url: getTrpcUrl(),
    transformer: superjson,
    headers() {
      return getAuthHeaders();
    },
  });
};

export const trpcClient = trpc.createClient({
  links: [createHttpLink()],
});

export const vanillaTrpcClient = createTRPCProxyClient<AppRouter>({
  links: [createHttpLink()],
});
