import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";
import Database from "../../../../utils/database";

const verifyPhoneSchema = z.object({
  phone: z.string(),
  code: z.string().length(4),
});

export default publicProcedure
  .input(verifyPhoneSchema)
  .mutation(async ({ input }) => {
    const { phone, code } = input;
    
    // Find user by phone
    const user = await Database.getUserByPhone(phone);
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    
    // Check if already verified
    if (user.phoneVerified) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Phone is already verified",
      });
    }
    
    // Check verification code
    if (user.phoneVerificationCode !== code) {
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
    
    // Update user as phone verified
    await Database.updateUser(user.id, {
      phoneVerified: true,
      phoneVerificationCode: null,
      status: user.emailVerified ? 'active' : 'pending_verification',
    });
    
    return {
      success: true,
      message: "Phone verified successfully!",
      isFullyVerified: user.emailVerified,
    };
  });