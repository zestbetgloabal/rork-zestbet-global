import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import Database from "../../../../utils/database";

const socialLoginSchema = z.object({
  provider: z.enum(["google", "facebook", "apple"]),
  token: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  avatar: z.string().url().optional(),
});

export default publicProcedure
  .input(socialLoginSchema)
  .mutation(async ({ input }) => {
    const { provider, token, email, avatar } = input;
    
    if (!token || token === "invalid") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid social login token",
      });
    }
    
    // Check if user exists with this email
    if (email) {
      const existingUser = await Database.getUserByEmail(email);
      if (existingUser) {
        // Check if account is approved
        if (existingUser.status === 'pending' || existingUser.status === 'suspended') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Account is not approved for login. Please contact support.",
          });
        }
        
        return {
          success: true,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            avatar: existingUser.avatar || avatar,
            provider,
            status: existingUser.status,
          },
          token: "mock-jwt-token",
          isNewUser: false,
        };
      }
    }
    
    // No existing account found - social registration is restricted
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Social login is only available for existing accounts. Please contact support to create an account.",
    });
  });