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

    if (!user || user.password !== password) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar ?? null,
      },
      token: "mock-jwt-token",
    };
  });