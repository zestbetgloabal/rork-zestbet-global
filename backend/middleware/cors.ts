import { cors } from 'hono/cors';
import { config } from '../config/environment';

// CORS middleware configuration
export const corsMiddleware = cors({
  origin: config.cors.origin,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  credentials: config.cors.credentials,
  maxAge: 86400, // 24 hours
});