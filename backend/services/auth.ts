import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';
import type { User } from '../config/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password_hash'>;
}

export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    if (!password?.trim() || password.length < 8 || password.length > 128) {
      throw new Error('Password must be between 8 and 128 characters');
    }
    const saltRounds = 12;
    return bcrypt.hash(password.trim(), saltRounds);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password?.trim() || !hash?.trim()) {
      return false;
    }
    return bcrypt.compare(password.trim(), hash.trim());
  }

  static generateTokens(user: User): AuthTokens {
    const payload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    const { password_hash, ...userWithoutPassword } = user as User & { password_hash: string };

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  static verifyToken(token: string): JWTPayload {
    try {
      if (!token?.trim()) {
        throw new Error('Token is required');
      }
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !data) {
        return null;
      }

      return data as User & { password_hash: string };
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  static async createUser(email: string, password: string, phone?: string): Promise<User> {
    try {
      if (!email?.trim() || !password?.trim()) {
        throw new Error('Email and password are required');
      }
      const hashedPassword = await this.hashPassword(password);
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          email: email.toLowerCase(),
          phone,
          password_hash: hashedPassword,
          email_verified: false,
          phone_verified: false,
          is_premium: false,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }

      // Create associated profile
      await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: data.id,
          preferences: {},
          privacy_settings: {
            show_email: false,
            show_phone: false,
            show_location: true,
            allow_matching: true,
          },
        });

      return data as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  static async verifyEmail(userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({ email_verified: true })
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Error verifying email:', error);
      return false;
    }
  }

  static async verifyPhone(userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({ phone_verified: true })
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Error verifying phone:', error);
      return false;
    }
  }

  static async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      if (!newPassword?.trim()) {
        throw new Error('New password is required');
      }
      const hashedPassword = await this.hashPassword(newPassword);
      
      const { error } = await supabaseAdmin
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  }

  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}