import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import Database from "../../../../utils/database";
import EmailService from "../../../../services/email";

const resendVerificationSchema = z.object({
  email: z.string().email(),
});

// Function to generate verification code
function generateVerificationCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default publicProcedure
  .input(resendVerificationSchema)
  .mutation(async ({ input }) => {
    const { email } = input;
    
    // Find user by email
    const user = await Database.getUserByEmail(email);
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    
    // Check if already verified
    if (user.emailVerified) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Email is already verified",
      });
    }
    
    // Generate new verification code
    const newVerificationCode = generateVerificationCode();
    const newExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Update user with new verification code
    await Database.updateUser(user.id, {
      emailVerificationCode: newVerificationCode,
      verificationCodeExpiry: newExpiry,
    });
    
    // Send new verification email
    try {
      await EmailService.sendVerificationEmail(email, user.name, newVerificationCode);
      console.log(`New verification email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send verification email. Please try again later.",
      });
    }
    
    return {
      success: true,
      message: "New verification code sent to your email address.",
    };
  });