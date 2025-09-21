import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

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

export function generateToken(payload: JWTPayload, expiresIn: string | number = '15m'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    if (isTokenBlacklisted(token)) {
      console.warn('JWT is blacklisted');
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function hashPassword(password: string): string {
  return `hashed_${password}`;
}

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
