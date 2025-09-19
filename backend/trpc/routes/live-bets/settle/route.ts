import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import Database from '../../../../utils/database';
import pubsub from '../../../../services/pubsub';

const inputSchema = z.object({
  marketId: z.string(),
  winningOptionKey: z.string(),
});

export default protectedProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    const market = await Database.getMarketById(input.marketId);
    if (!market) {
      return { success: false as const, message: 'Market not found' };
    }
    if (market.status !== 'open') {
      return { success: false as const, message: 'Market already closed' };
    }

    await Database.updateMarket(input.marketId, { status: 'settled' });

    const wagers = await Database.getWagersByMarket(input.marketId);

    let totalPayout = 0;
    for (const w of wagers) {
      if (w.optionKey === input.winningOptionKey) {
        await Database.updateWagerStatus(w.id, 'won');
        await Database.adjustUserBalance(w.userId, w.potentialWin);
        totalPayout += w.potentialWin;
        pubsub.emit({
          type: 'bet_win',
          userId: w.userId,
          wagerId: w.id,
          amount: w.potentialWin,
          marketId: input.marketId,
          message: 'Wette gewonnen!'
        });
      } else {
        await Database.updateWagerStatus(w.id, 'lost');
        pubsub.emit({
          type: 'bet_lost',
          userId: w.userId,
          wagerId: w.id,
          marketId: input.marketId,
          message: 'Wette verloren'
        });
      }
    }

    pubsub.emit({ type: 'market_settled', marketId: input.marketId, winningOptionKey: input.winningOptionKey, message: 'Market settled' });

    return { success: true as const, message: 'Market settled', totalPayout };
  });
