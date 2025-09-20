import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import Database from "../../../../utils/database";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
});

export default publicProcedure
  .input(registerSchema)
  .mutation(async ({ input }) => {
    const { email } = input;
    
    // Check if user already exists
    const existingUser = await Database.getUserByEmail(email);
    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Account with this email already exists",
      });
    }
    
    // Registration is now restricted - only allow specific domains or manual approval
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Registration is currently restricted. Please contact support to create an account.",
    });
  });