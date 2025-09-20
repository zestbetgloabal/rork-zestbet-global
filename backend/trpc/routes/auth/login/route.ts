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

    // Check if account is verified/approved
    if (user.status === 'pending' || user.status === 'suspended') {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Account is not approved for login. Please contact support.",
      });
    }

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