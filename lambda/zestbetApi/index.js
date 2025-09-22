const { Hono } = require('hono');
const { handle } = require('@hono/aws-lambda');

const app = new Hono();

// Beispiel-Endpunkt
app.get('/api', async (c) => {
    return c.json({ message: 'Hono API für zestapp.online' });
});

// tRPC-Endpunkte (aus backend/ integriert)
app.all('/api/trpc/*', async (c) => {
    // Hier deinen tRPC-Handler aus backend/ einfügen
    return c.json({ message: 'tRPC endpoint placeholder' });
});

exports.handler = handle(app);
