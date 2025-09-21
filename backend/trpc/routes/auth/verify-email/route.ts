import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import Database from "../../../../utils/database";

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(4),
});

export default publicProcedure
  .input(verifyEmailSchema)
  .mutation(async ({ input }) => {
    const { email, code } = input;
    
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
    
    // Check verification code
    if (user.emailVerificationCode !== code) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid verification code",
      });
    }
    
    // Check if code expired
    if (new Date() > new Date(user.verificationCodeExpiry)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Verification code has expired. Please request a new one.",
      });
    }
    
    // Update user as email verified
    await Database.updateUser(user.id, {
      emailVerified: true,
      emailVerificationCode: null,
      status: user.phoneVerified ? 'active' : 'pending_verification',
    });
    
    return {
      success: true,
      message: "Email verified successfully!",
      isFullyVerified: user.phoneVerified,
    };
  });