import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default publicProcedure
  .input(loginSchema)
  .mutation(async ({ input }) => {
    const { email, password } = input;
    
    // TODO: Implement actual authentication logic
    // This is a mock implementation
    if (email === "test@example.com" && password === "password123") {
      return {
        success: true,
        user: {
          id: "1",
          email,
          name: "Test User",
          avatar: null,
        },
        token: "mock-jwt-token",
      };
    }
    
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid credentials",
    });
  });