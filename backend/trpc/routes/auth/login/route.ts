import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import Database from "../../../../utils/database";

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

    // Temporarily allow login without verification for development
    // TODO: Re-enable verification checks after implementing proper email validation
    
    if (user.status === 'suspended') {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Account is suspended. Please contact support.",
      });
    }
    
    // Allow login for all non-suspended accounts temporarily
    console.log(`User ${user.email} logging in with status: ${user.status}`);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar ?? null,
        status: user.status,
      },
      token: "mock-jwt-token",
    };
  });