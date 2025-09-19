import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import Database from '../../../../utils/database';
import pubsub from '../../../../services/pubsub';

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

    if (market.status !== 'open') {
      return { success: false as const, message: 'Market is closed' };
    }

    const option = market.options.find((o: any) => o.key === input.optionKey);
    if (!option) {
      return { success: false as const, message: 'Option not found' };
    }

    // Sensible limits and validations
    const MIN_BET = 1;
    const MAX_BET = 10000;
    if (input.amount < MIN_BET) {
      return { success: false as const, message: `Minimum bet is ${MIN_BET}` };
    }
    if (input.amount > MAX_BET) {
      return { success: false as const, message: `Maximum bet is ${MAX_BET}` };
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

    // Emit confirmation via pubsub for subscribers
    pubsub.emit({
      type: 'heartbeat',
      message: 'bet_placed',
    });

    return {
      success: true as const,
      wager,
      newBalance: (user.zestCoins ?? 0) - input.amount,
      message: 'Bet placed successfully',
    };
  });