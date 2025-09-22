const { Hono } = require('hono');
const { handle } = require('@hono/aws-lambda');
const { createHonoMiddleware } = require('@trpc/server/adapters/hono');
const { createContext } = require('../../backend/create-context');
const { appRouter } = require('../../backend/app-router');

const app = new Hono();

// Beispiel-Endpunkt
app.get('/api', async (c) => {
    return c.json({ message: 'Hono API für zestapp.online' });
});

// tRPC-Endpunkt
app.use('/api/trpc/*', createHonoMiddleware({ router: appRouter, createContext }));

exports.handler = handle(app);
