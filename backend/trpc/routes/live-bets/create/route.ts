import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import Database from '../../../../utils/database';

const inputSchema = z.object({
  eventId: z.string(),
  marketId: z.string(),
  optionKey: z.string(),
  amount: z.number().min(1),
});

export default protectedProcedure
  .input(inputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user?.id ?? 'mock-user-id';

    const markets = await Database.listLiveBetMarkets(input.eventId);
    const market = markets.find((m: any) => m.id === input.marketId);
    if (!market) {
      return { success: false as const, message: 'Market not found' };
    }

    const option = market.options.find((o: any) => o.key === input.optionKey);
    if (!option) {
      return { success: false as const, message: 'Option not found' };
    }

    const user = await Database.getUserById(userId);
    if (!user || (user.zestCoins ?? 0) < input.amount) {
      return { success: false as const, message: 'Insufficient balance' };
    }

    await Database.adjustUserBalance(userId, -input.amount);

    const wager = await Database.placeLiveBet({
      marketId: input.marketId,
      eventId: input.eventId,
      userId,
      optionKey: input.optionKey,
      amount: input.amount,
      oddsAtPlacement: option.odds,
      potentialWin: Number((input.amount * option.odds).toFixed(2)),
    });

    return {
      success: true as const,
      wager,
      newBalance: (user.zestCoins ?? 0) - input.amount,
      message: 'Bet placed successfully',
    };
  });