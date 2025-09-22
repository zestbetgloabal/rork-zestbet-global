const { publicProcedure } = require('../../../trpc-setup');

const hiProcedure = publicProcedure.query(() => {
  return {
    message: 'Hello from ZestBet Lambda API!',
    timestamp: new Date().toISOString(),
    environment: 'AWS Lambda'
  };
});

module.exports = { hiProcedure };