import { Context } from 'hono';
import { verifyToken } from '../utils/auth';

// Authentication middleware for Hono
export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  const authorization = c.req.header('authorization');
  const token = authorization?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'No token provided' }, 401);
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  
  // Add user to context
  c.set('user', payload);
  
  await next();
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuthMiddleware = async (c: Context, next: () => Promise<void>) => {
  const authorization = c.req.header('authorization');
  const token = authorization?.replace('Bearer ', '');
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      c.set('user', payload);
    }
  }
  
  await next();
};