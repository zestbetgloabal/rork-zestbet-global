import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import Database from "../../../../utils/database";
import { generateToken, jwtUtils } from "../../../../utils/auth";

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
        message: "Account not found. Only registered accounts are allowed.",
      });
    }

    if (user.password !== password) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid password.",
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
    
    console.log(`User ${user.email} logging in with status: ${user.status}`);

    const token = generateToken({ userId: user.id, email: user.email, name: user.name }, '15m');

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
      tokenExpiresIn: '15m',
      alg: 'HS256',
      keyHint: jwtUtils.jwtSecret ? 'env' : 'default',
    };
  });