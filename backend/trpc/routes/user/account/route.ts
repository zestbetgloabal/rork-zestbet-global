import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

const deactivateReasonSchema = z.object({
  reason: z
    .string()
    .min(0)
    .max(500)
    .optional(),
});

export const deactivateAccount = protectedProcedure
  .input(deactivateReasonSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user?.id ?? "unknown";

    console.log("[user.deactivate] request", { userId, input });

    // TODO: mark user as inactive in DB, revoke sessions, schedule data retention window

    return {
      success: true as const,
      status: "deactivated" as const,
      userId,
      message:
        "Your account has been deactivated. You can reactivate by logging in again if your policy allows it.",
    };
  });

export const deleteAccount = protectedProcedure
  .input(
    z.object({
      confirm: z.literal(true),
      feedback: z.string().max(1000).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user?.id ?? "unknown";

    console.log("[user.delete] request", { userId, input });

    // TODO: enqueue hard delete job, immediately anonymize PII, revoke tokens, wipe user-generated content per policy

    return {
      success: true as const,
      status: "scheduled_delete" as const,
      userId,
      message:
        "Your account deletion has been scheduled. You will be logged out on all devices.",
    };
  });

export default {
  deactivateAccount,
  deleteAccount,
};