const { initTRPC } = require('@trpc/server');
const superjson = require('superjson');

const t = initTRPC.context().create({
  transformer: superjson,
});

const router = t.router;
const publicProcedure = t.procedure;

module.exports = {
  router,
  publicProcedure,
  protectedProcedure: publicProcedure, // Simplified for now
};