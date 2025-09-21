import { publicProcedure } from "@/backend/trpc/create-context";
import { blacklistToken } from "@/backend/utils/auth";

export default publicProcedure
  .mutation(async ({ ctx }) => {
    try {
      const authHeader = ctx.req?.headers?.get?.('authorization') || (ctx.req as any)?.headers?.authorization;
      const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : undefined;

      if (token) {
        console.log('Logging out user with token:', token.substring(0, 10) + '...');
        const ttlSeconds = 15 * 60;
        blacklistToken(token, ttlSeconds);
        console.log('Token blacklisted for', ttlSeconds, 'seconds');
      } else {
        console.log('Logout called without token - client-side logout');
      }

      return {
        success: true,
        message: "Logged out successfully",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: true,
        message: "Logged out successfully (with errors)",
        timestamp: new Date().toISOString(),
      };
    }
  });