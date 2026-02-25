import { createTRPCRouter } from "./create-context";

import hiRoute from "./routes/example/hi/route";
import loginRoute from "./routes/auth/login/route";
import registerRoute from "./routes/auth/register/route";
import logoutRoute from "./routes/auth/logout/route";
import verifyEmailRoute from "./routes/auth/verify-email/route";
import resendVerificationRoute from "./routes/auth/resend-verification/route";
import createBetRoute from "./routes/bets/create/route";
import listBetsRoute from "./routes/bets/list/route";
import userProfileRoutes from "./routes/user/profile/route";
import userAccountRoutes from "./routes/user/account/route";
import walletBalanceRoute from "./routes/wallet/balance/route";
import walletDepositRoute from "./routes/wallet/deposit/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),

  auth: createTRPCRouter({
    login: loginRoute,
    register: registerRoute,
    logout: logoutRoute,
    verifyEmail: verifyEmailRoute,
    resendVerification: resendVerificationRoute,
  }),

  bets: createTRPCRouter({
    create: createBetRoute,
    list: listBetsRoute,
  }),

  user: createTRPCRouter({
    profile: userProfileRoutes.get,
    updateProfile: userProfileRoutes.update,
    deleteAccount: userAccountRoutes.deleteAccount,
    deactivateAccount: userAccountRoutes.deactivateAccount,
  }),

  wallet: createTRPCRouter({
    balance: walletBalanceRoute,
    deposit: walletDepositRoute,
  }),
});

export type AppRouter = typeof appRouter;
