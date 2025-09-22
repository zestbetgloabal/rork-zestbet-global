const { router } = require('./trpc-setup');
const { hiProcedure } = require('./routes/example/hi/route');

// Simple example router for Lambda
const appRouter = router({
  example: router({
    hi: hiProcedure,
  }),
  // Add other routes as needed
});

module.exports = { appRouter };