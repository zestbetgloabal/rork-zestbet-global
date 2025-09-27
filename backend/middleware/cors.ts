import { cors } from 'hono/cors';
import { config } from '../config/environment';

// CORS middleware configuration with dynamic origin handling
export const corsMiddleware = cors({
  origin: (origin) => {
    console.log('🔍 CORS Origin Check:', { origin });
    
    // Allow requests with no origin (like mobile apps)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return origin;
    }
    
    // Check exact matches first
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8081',
      'https://zestapp.online',
      'https://main.ddk0z2esbs19wf.amplifyapp.com',
    ];
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Allowing exact match origin:', origin);
      return origin;
    }
    
    // Allow all localhost origins for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      console.log('✅ CORS: Allowing localhost origin:', origin);
      return origin;
    }
    
    // Check wildcard patterns
    if (origin.endsWith('.amplifyapp.com')) {
      console.log('✅ CORS: Allowing amplifyapp.com origin:', origin);
      return origin;
    }
    
    // Check if CORS_ORIGIN env var has custom origins
    if (process.env.CORS_ORIGIN) {
      const customOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
      if (customOrigins.includes(origin)) {
        console.log('✅ CORS: Allowing custom origin:', origin);
        return origin;
      }
    }
    
    console.log('❌ CORS: Rejecting origin:', origin);
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