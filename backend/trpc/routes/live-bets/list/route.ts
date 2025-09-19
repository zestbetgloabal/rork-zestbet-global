import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import Database from '../../../../utils/database';

const inputSchema = z.object({
  eventId: z.string(),
});

export default publicProcedure
  .input(inputSchema)
  .query(async ({ input }) => {
    const markets = await Database.listLiveBetMarkets(input.eventId);

    // Fallback mock if none exist yet
    if (!markets || markets.length === 0) {
      const mock = await Database.createLiveBetMarket({
        eventId: input.eventId,
        question: 'Wer gewinnt die nächste Runde?',
        options: [
          { id: 'opt_home', key: 'home', label: 'Home', odds: 2.1 },
          { id: 'opt_draw', key: 'draw', label: 'Unentschieden', odds: 3.2 },
          { id: 'opt_away', key: 'away', label: 'Away', odds: 2.8 },
        ],
      });
      return { markets: [mock] };
    }

    return { markets };
  });