import { cors } from 'hono/cors';
import { config } from '../config/environment';

// CORS middleware configuration with dynamic origin handling
export const corsMiddleware = cors({
  origin: (origin) => {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return origin;
    
    // Check exact matches first
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8081',
      'https://zestapp.online',
      'https://main.ddk0z2esbs19wf.amplifyapp.com',
    ];
    
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    
    // Check wildcard patterns
    if (origin.endsWith('.amplifyapp.com')) {
      return origin;
    }
    
    // Check if CORS_ORIGIN env var has custom origins
    if (process.env.CORS_ORIGIN) {
      const customOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
      if (customOrigins.includes(origin)) {
        return origin;
      }
    }
    
    return null;
  },
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