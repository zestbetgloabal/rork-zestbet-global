import { createTRPCRouter } from "./create-context";

// Example routes
import hiRoute from "./routes/example/hi/route";

// Auth routes
import loginRoute from "./routes/auth/login/route";
import registerRoute from "./routes/auth/register/route";
import logoutRoute from "./routes/auth/logout/route";
import socialLoginRoute from "./routes/auth/social-login/route";
import verifyEmailRoute from "./routes/auth/verify-email/route";
import verifyPhoneRoute from "./routes/auth/verify-phone/route";

// Bet routes
import createBetRoute from "./routes/bets/create/route";
import listBetsRoute from "./routes/bets/list/route";

// Challenge routes
import createChallengeRoute from "./routes/challenges/create/route";
import listChallengesRoute from "./routes/challenges/list/route";

// User routes
import userProfileRoutes from "./routes/user/profile/route";
import userAccountRoutes from "./routes/user/account/route";

// Wallet routes
import walletBalanceRoute from "./routes/wallet/balance/route";
import walletDepositRoute from "./routes/wallet/deposit/route";

// Live events routes
import { 
  listLiveEventsProcedure, 
  placeLiveBetProcedure, 
  getLiveBettingDataProcedure 
} from "./routes/live-events/list/route";

// Live bets routes
import listLiveBetMarketsRoute from "./routes/live-bets/list/route";
import createLiveBetRoute from "./routes/live-bets/create/route";
import liveBetsSubscribeRoute from "./routes/live-bets/subscribe/route";
import settleLiveBetRoute from "./routes/live-bets/settle/route";

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
    verifyEmail: verifyEmailRoute,
    verifyPhone: verifyPhoneRoute,
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
    deleteAccount: userAccountRoutes.deleteAccount,
    deactivateAccount: userAccountRoutes.deactivateAccount,
  }),
  
  // Wallet
  wallet: createTRPCRouter({
    balance: walletBalanceRoute,
    deposit: walletDepositRoute,
  }),
  
  // Live events
  liveEvents: createTRPCRouter({
    list: listLiveEventsProcedure,
    placeBet: placeLiveBetProcedure,
    getBettingData: getLiveBettingDataProcedure,
  }),

  // Live bets
  liveBets: createTRPCRouter({
    list: listLiveBetMarketsRoute,
    create: createLiveBetRoute,
    subscribe: liveBetsSubscribeRoute,
    settle: settleLiveBetRoute,
  }),
});

export type AppRouter = typeof appRouter;