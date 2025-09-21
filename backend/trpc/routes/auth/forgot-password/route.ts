import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import Database from "../../../../utils/database";
import EmailService from "../../../../services/email";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Function to generate reset code
function generateResetCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default publicProcedure
  .input(forgotPasswordSchema)
  .mutation(async ({ input }) => {
    const { email } = input;
    
    // Find user by email
    const user = await Database.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message: "If an account with this email exists, you will receive a password reset code.",
      };
    }
    
    // Generate reset code
    const resetCode = generateResetCode();
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Update user with reset code
    await Database.updateUser(user.id, {
      passwordResetCode: resetCode,
      passwordResetExpiry: resetExpiry,
    });
    
    // Send password reset email
    try {
      await EmailService.sendPasswordResetEmail(email, user.name, resetCode);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't fail the request if email sending fails
    }
    
    return {
      success: true,
      message: "If an account with this email exists, you will receive a password reset code.",
    };
  });