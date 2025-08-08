import { Context } from 'hono';

// Request logging middleware
export const loggerMiddleware = async (c: Context, next: () => Promise<void>) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  const userAgent = c.req.header('user-agent') || 'Unknown';
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'Unknown';
  
  console.log(`[${new Date().toISOString()}] ${method} ${url} - ${ip} - ${userAgent}`);
  
  await next();
  
  const duration = Date.now() - start;
  const status = c.res.status;
  
  console.log(`[${new Date().toISOString()}] ${method} ${url} - ${status} - ${duration}ms`);
};

// Error logging middleware
export const errorLoggerMiddleware = async (c: Context, next: () => Promise<void>) => {
  try {
    await next();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    
    // Re-throw the error so it can be handled by other middleware
    throw error;
  }
};