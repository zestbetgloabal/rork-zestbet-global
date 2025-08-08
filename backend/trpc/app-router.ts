import { createTRPCRouter } from "./create-context";

// Example routes
import hiRoute from "./routes/example/hi/route";

// Auth routes
import loginRoute from "./routes/auth/login/route";
import registerRoute from "./routes/auth/register/route";
import logoutRoute from "./routes/auth/logout/route";
import socialLoginRoute from "./routes/auth/social-login/route";

// Bet routes
import createBetRoute from "./routes/bets/create/route";
import listBetsRoute from "./routes/bets/list/route";

// Challenge routes
import createChallengeRoute from "./routes/challenges/create/route";
import listChallengesRoute from "./routes/challenges/list/route";

// User routes
import userProfileRoutes from "./routes/user/profile/route";

// Wallet routes
import walletBalanceRoute from "./routes/wallet/balance/route";
import walletDepositRoute from "./routes/wallet/deposit/route";

// Live events routes
import listLiveEventsRoute from "./routes/live-events/list/route";

export const appRouter = createTRPCRouter({
  // Example routes (keep for testing)
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  
  // Authentication
  auth: createTRPCRouter({
    login: loginRoute,
    register: registerRoute,
    logout: logoutRoute,
    socialLogin: socialLoginRoute,
  }),
  
  // Bets
  bets: createTRPCRouter({
    create: createBetRoute,
    list: listBetsRoute,
  }),
  
  // Challenges
  challenges: createTRPCRouter({
    create: createChallengeRoute,
    list: listChallengesRoute,
  }),
  
  // User management
  user: createTRPCRouter({
    profile: userProfileRoutes.get,
    updateProfile: userProfileRoutes.update,
  }),
  
  // Wallet
  wallet: createTRPCRouter({
    balance: walletBalanceRoute,
    deposit: walletDepositRoute,
  }),
  
  // Live events
  liveEvents: createTRPCRouter({
    list: listLiveEventsRoute,
  }),
});

export type AppRouter = typeof appRouter;