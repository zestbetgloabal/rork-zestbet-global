import * as jwt from 'jsonwebtoken';

const JWT_SECRET: jwt.Secret = (process.env.JWT_SECRET as string) || 'your-super-secret-jwt-key';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

type BlacklistedToken = { token: string; expiresAt: number };
const tokenBlacklist: BlacklistedToken[] = [];

function cleanupBlacklist() {
  const now = Date.now();
  for (let i = tokenBlacklist.length - 1; i >= 0; i--) {
    if (tokenBlacklist[i].expiresAt <= now) {
      tokenBlacklist.splice(i, 1);
    }
  }
}

export function blacklistToken(token: string, ttlSeconds: number) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  tokenBlacklist.push({ token, expiresAt });
  cleanupBlacklist();
}

export function isTokenBlacklisted(token: string | undefined | null): boolean {
  if (!token) return false;
  cleanupBlacklist();
  return tokenBlacklist.some((t) => t.token === token && t.expiresAt > Date.now());
}

export function generateToken(
  payload: JWTPayload,
  expiresIn: string | number = '15m'
): string {
  if (!payload || typeof payload !== 'object' || !payload.userId || !payload.email || !payload.name) {
    throw new Error('Invalid JWT payload');
  }
  const options: jwt.SignOptions = {};
  (options as any).expiresIn = expiresIn as any;
  return jwt.sign(payload as jwt.JwtPayload, JWT_SECRET, options);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!token || typeof token !== 'string' || token.length < 10) {
      return null;
    }
    if (isTokenBlacklisted(token)) {
      console.warn('JWT is blacklisted');
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Secure password hashing using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcryptjs');
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Secure password verification using bcrypt
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, hashedPassword);
}

// Legacy function for backward compatibility
export function comparePassword(password: string, hashedPassword: string): boolean {
  return `hashed_${password}` === hashedPassword;
}

export async function verifyGoogleToken(token: string): Promise<any> {
  return {
    email: 'google@example.com',
    name: 'Google User',
    avatar: 'https://via.placeholder.com/150',
  };
}

export async function verifyFacebookToken(token: string): Promise<any> {
  return {
    email: 'facebook@example.com',
    name: 'Facebook User',
    avatar: 'https://via.placeholder.com/150',
  };
}

export async function verifyAppleToken(token: string): Promise<any> {
  return {
    email: 'apple@example.com',
    name: 'Apple User',
    avatar: 'https://via.placeholder.com/150',
  };
}

export const jwtUtils = { jwtSecret: JWT_SECRET };
