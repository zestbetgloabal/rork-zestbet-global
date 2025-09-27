import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import Database from "../../../../utils/database";
import { generateToken, jwtUtils, verifyPassword, comparePassword } from "../../../../utils/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default publicProcedure
  .input(loginSchema)
  .mutation(async ({ input }) => {
    const { email, password } = input;

    const user = await Database.getUserByEmail(email);

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials.",
      });
    }

    // Use secure password verification (try both new and legacy methods)
    let isValidPassword = false;
    try {
      // Try new bcrypt method first
      isValidPassword = await verifyPassword(password, user.password);
    } catch (error) {
      // Fallback to legacy method for existing users
      isValidPassword = comparePassword(password, user.password);
    }
    
    if (!isValidPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials.",
      });
    }

    if (user.status === 'suspended') {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Account is suspended. Please contact support.",
      });
    }
    
    if (user.status === 'banned') {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Account is banned. Please contact support.",
      });
    }
    
    if (user.status === 'pending_verification' && !user.emailVerified) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Please verify your email address before logging in. Check your inbox for the verification code.",
        cause: {
          requiresEmailVerification: true,
          email: user.email,
        },
      });
    }
    
    // Generate secure token with longer expiry
    const token = generateToken({ userId: user.id, email: user.email, name: user.name }, '7d');

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar ?? null,
        status: user.status,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      token,
      tokenExpiresIn: '7d',
      alg: 'HS256',
      keyHint: jwtUtils.jwtSecret ? 'env' : 'default',
    };
  });