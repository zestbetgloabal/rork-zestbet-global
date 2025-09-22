const { router, publicProcedure, protectedProcedure } = require('./trpc-setup');
const { hiProcedure } = require('./routes/example/hi/route');

// Mock procedures for Lambda deployment
// In production, you would implement these with actual database operations

// Auth procedures
const loginProcedure = publicProcedure
  .input((val) => {
    if (typeof val === 'object' && val !== null) return val;
    throw new Error('Invalid input');
  })
  .mutation(async ({ input }) => {
    // Mock login - replace with actual auth logic
    return {
      success: true,
      token: 'mock-jwt-token',
      user: { id: '1', email: input.email || 'user@example.com', name: 'Test User' }
    };
  });

const registerProcedure = publicProcedure
  .input((val) => {
    if (typeof val === 'object' && val !== null) return val;
    throw new Error('Invalid input');
  })
  .mutation(async ({ input }) => {
    // Mock registration - replace with actual registration logic
    return {
      success: true,
      message: 'User registered successfully',
      user: { id: '1', email: input.email || 'user@example.com', name: input.name || 'New User' }
    };
  });

// Bet procedures
const listBetsProcedure = protectedProcedure
  .query(async () => {
    // Mock bets data
    return [
      {
        id: '1',
        title: 'Sample Bet',
        description: 'This is a sample bet',
        amount: 100,
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];
  });

const createBetProcedure = protectedProcedure
  .input((val) => {
    if (typeof val === 'object' && val !== null) return val;
    throw new Error('Invalid input');
  })
  .mutation(async ({ input }) => {
    // Mock bet creation
    return {
      id: Date.now().toString(),
      title: input.title || 'New Bet',
      description: input.description || '',
      amount: input.amount || 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };
  });

// Challenge procedures
const listChallengesProcedure = protectedProcedure
  .query(async () => {
    return [
      {
        id: '1',
        title: 'Sample Challenge',
        description: 'This is a sample challenge',
        reward: 500,
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];
  });

const createChallengeProcedure = protectedProcedure
  .input((val) => {
    if (typeof val === 'object' && val !== null) return val;
    throw new Error('Invalid input');
  })
  .mutation(async ({ input }) => {
    return {
      id: Date.now().toString(),
      title: input.title || 'New Challenge',
      description: input.description || '',
      reward: input.reward || 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };
  });

// User procedures
const getProfileProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    return {
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
      balance: 1000,
      createdAt: new Date().toISOString()
    };
  });

// Wallet procedures
const getBalanceProcedure = protectedProcedure
  .query(async () => {
    return {
      balance: 1000,
      currency: 'ZEST',
      lastUpdated: new Date().toISOString()
    };
  });

// Live events procedures
const listLiveEventsProcedure = publicProcedure
  .query(async () => {
    return [
      {
        id: '1',
        title: 'Sample Live Event',
        description: 'This is a sample live event',
        startTime: new Date().toISOString(),
        status: 'live',
        participants: 10
      }
    ];
  });

// Complete app router with all routes
const appRouter = router({
  // Example routes
  example: router({
    hi: hiProcedure,
  }),
  
  // Auth routes
  auth: router({
    login: router({
      route: loginProcedure
    }),
    register: router({
      route: registerProcedure
    }),
    logout: router({
      route: publicProcedure.mutation(async () => ({ success: true }))
    }),
    'forgot-password': router({
      route: publicProcedure
        .input((val) => val)
        .mutation(async () => ({ success: true, message: 'Password reset email sent' }))
    }),
    'reset-password': router({
      route: publicProcedure
        .input((val) => val)
        .mutation(async () => ({ success: true, message: 'Password reset successfully' }))
    }),
    'verify-email': router({
      route: publicProcedure
        .input((val) => val)
        .mutation(async () => ({ success: true, message: 'Email verified' }))
    }),
    'verify-phone': router({
      route: publicProcedure
        .input((val) => val)
        .mutation(async () => ({ success: true, message: 'Phone verified' }))
    }),
    'resend-verification': router({
      route: publicProcedure
        .input((val) => val)
        .mutation(async () => ({ success: true, message: 'Verification email sent' }))
    }),
    'social-login': router({
      route: publicProcedure
        .input((val) => val)
        .mutation(async () => ({ success: true, token: 'mock-social-token' }))
    })
  }),
  
  // Bet routes
  bets: router({
    list: router({
      route: listBetsProcedure
    }),
    create: router({
      route: createBetProcedure
    })
  }),
  
  // Challenge routes
  challenges: router({
    list: router({
      route: listChallengesProcedure
    }),
    create: router({
      route: createChallengeProcedure
    })
  }),
  
  // User routes
  user: router({
    profile: router({
      route: getProfileProcedure
    }),
    account: router({
      route: getProfileProcedure
    })
  }),
  
  // Wallet routes
  wallet: router({
    balance: router({
      route: getBalanceProcedure
    }),
    deposit: router({
      route: protectedProcedure
        .input((val) => val)
        .mutation(async ({ input }) => ({
          success: true,
          transactionId: Date.now().toString(),
          amount: input.amount || 0
        }))
    })
  }),
  
  // Live events routes
  'live-events': router({
    list: router({
      route: listLiveEventsProcedure
    })
  }),
  
  // Live bets routes
  'live-bets': router({
    list: router({
      route: publicProcedure.query(async () => [])
    }),
    create: router({
      route: protectedProcedure
        .input((val) => val)
        .mutation(async ({ input }) => ({
          id: Date.now().toString(),
          ...input,
          status: 'active',
          createdAt: new Date().toISOString()
        }))
    }),
    settle: router({
      route: protectedProcedure
        .input((val) => val)
        .mutation(async ({ input }) => ({
          success: true,
          betId: input.betId,
          result: input.result
        }))
    }),
    subscribe: router({
      route: publicProcedure
        .input((val) => val)
        .subscription(async function* ({ input }) {
          // Mock subscription - in real implementation, this would use WebSocket or Server-Sent Events
          yield { type: 'connected', timestamp: new Date().toISOString() };
        })
    })
  })
});

module.exports = { appRouter };