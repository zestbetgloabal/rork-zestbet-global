import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const listBetsSchema = z.object({
  category: z.string().optional(),
  status: z.enum(["active", "completed", "cancelled"]).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export default publicProcedure
  .input(listBetsSchema)
  .query(async ({ input }) => {
    const { category, status, limit, offset } = input;
    
    // TODO: Implement actual bet listing logic
    // - Query database with filters
    // - Apply pagination
    // - Return formatted results
    
    // Mock data
    const mockBets = [
      {
        id: "1",
        title: "Deutschland gewinnt die EM 2024",
        description: "Wette auf den Sieg der deutschen Nationalmannschaft",
        amount: 50,
        category: "sports",
        endDate: new Date("2024-07-14"),
        isPublic: true,
        participants: ["user1", "user2"],
        createdBy: "user1",
        status: "active",
        createdAt: new Date(),
      },
      {
        id: "2",
        title: "Bitcoin erreicht 100k USD",
        description: "Bitcoin wird bis Ende 2024 100.000 USD erreichen",
        amount: 100,
        category: "crypto",
        endDate: new Date("2024-12-31"),
        isPublic: true,
        participants: ["user2", "user3"],
        createdBy: "user2",
        status: "active",
        createdAt: new Date(),
      },
    ];
    
    // Apply filters
    let filteredBets = mockBets;
    if (category) {
      filteredBets = filteredBets.filter(bet => bet.category === category);
    }
    if (status) {
      filteredBets = filteredBets.filter(bet => bet.status === status);
    }
    
    // Apply pagination
    const paginatedBets = filteredBets.slice(offset, offset + limit);
    
    return {
      bets: paginatedBets,
      total: filteredBets.length,
      hasMore: offset + limit < filteredBets.length,
    };
  });