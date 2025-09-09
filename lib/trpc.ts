import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }
  throw new Error("No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL");
};

const getTrpcUrl = () => {
  const explicit = process.env.EXPO_PUBLIC_TRPC_URL;
  if (explicit) return explicit;
  const base = getBaseUrl();
  return `${base}/api/trpc`;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: getTrpcUrl(),
      transformer: superjson,
    }),
  ],
});