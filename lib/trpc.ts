import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getTrpcUrl = (): string => {
  const explicit = process.env.EXPO_PUBLIC_TRPC_URL;
  if (explicit) return explicit;

  const amplifyFunctionUrl = process.env.EXPO_PUBLIC_AMPLIFY_FUNCTION_URL;
  if (amplifyFunctionUrl) {
    const base = amplifyFunctionUrl.replace(/\/$/, "");
    return `${base}/trpc`;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/api/trpc`;
  }

  throw new Error("TRPC URL not configured. Set EXPO_PUBLIC_TRPC_URL or EXPO_PUBLIC_AMPLIFY_FUNCTION_URL.");
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: getTrpcUrl(),
      transformer: superjson,
    }),
  ],
});