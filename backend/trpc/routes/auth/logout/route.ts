import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .mutation(async ({ ctx }) => {
    try {
      // In a real implementation, you would:
      // 1. Invalidate the JWT token in a blacklist/database
      // 2. Clear any server-side session data
      // 3. Update user status to offline
      // 4. Log the logout event
      
      console.log('User logged out successfully');
      
      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if server logout fails, we should allow client logout
      return {
        success: true,
        message: "Logged out successfully",
      };
    }
  });