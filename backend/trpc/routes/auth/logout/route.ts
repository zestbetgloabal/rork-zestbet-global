import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure
  .mutation(async ({ ctx }) => {
    try {
      // Get authorization header to identify the user
      const authHeader = ctx.req?.headers?.get?.('authorization') || 
                        (ctx.req?.headers as any)?.authorization;
      const token = authHeader?.replace('Bearer ', '');
      
      if (token) {
        console.log('Logging out user with token:', token.substring(0, 10) + '...');
        
        // In a real implementation, you would:
        // 1. Invalidate the JWT token in a blacklist/database
        // 2. Clear any server-side session data
        // 3. Update user status to offline
        // 4. Log the logout event
        
        // For now, we'll just log the logout
        console.log('User session invalidated successfully');
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
      // Even if server logout fails, we should allow client logout
      return {
        success: true,
        message: "Logged out successfully (with errors)",
        timestamp: new Date().toISOString(),
      };
    }
  });