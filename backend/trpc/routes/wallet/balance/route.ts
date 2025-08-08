import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .query(async () => {
    // TODO: Implement actual wallet balance fetching
    // - Get user from authentication context
    // - Fetch wallet balance from database
    // - Return current balance and transaction history
    
    // Mock data
    return {
      balance: 1250,
      currency: "ZEST",
      transactions: [
        {
          id: "1",
          type: "win",
          amount: 100,
          description: "Gewinn aus Sportwette",
          date: new Date("2024-01-15"),
        },
        {
          id: "2",
          type: "bet",
          amount: -50,
          description: "Wette auf EM 2024",
          date: new Date("2024-01-10"),
        },
        {
          id: "3",
          type: "reward",
          amount: 200,
          description: "Challenge Belohnung",
          date: new Date("2024-01-05"),
        },
      ],
    };
  });