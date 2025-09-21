import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import Database from "../../../../utils/database";

const resetPasswordSchema = z.object({
  email: z.string().email(),
  resetCode: z.string().length(4),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export default publicProcedure
  .input(resetPasswordSchema)
  .mutation(async ({ input }) => {
    const { email, resetCode, newPassword } = input;
    
    // Find user by email
    const user = await Database.getUserByEmail(email);
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    
    // Check if reset code exists
    if (!user.passwordResetCode) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No password reset request found. Please request a new reset code.",
      });
    }
    
    // Check reset code
    if (user.passwordResetCode !== resetCode) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid reset code",
      });
    }
    
    // Check if code expired
    if (new Date() > new Date(user.passwordResetExpiry!)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Reset code has expired. Please request a new one.",
      });
    }
    
    // Update user password and clear reset code
    await Database.updateUser(user.id, {
      password: newPassword, // In production, hash this password
      passwordResetCode: null,
      passwordResetExpiry: null,
    });
    
    console.log(`Password reset successful for user: ${email}`);
    
    return {
      success: true,
      message: "Password reset successfully! You can now log in with your new password.",
    };
  });