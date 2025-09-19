import { observable } from '@trpc/server/observable';
import { publicProcedure } from '../../../create-context';
import pubsub, { LiveBetEvent } from '../../../../services/pubsub';

export default publicProcedure.subscription(() => {
  return observable<LiveBetEvent>((emit) => {
    const off = pubsub.on((evt) => emit.next(evt));

    // Heartbeat to keep connections warm
    const interval = setInterval(() => {
      emit.next({ type: 'heartbeat', message: 'live' });
    }, 15000);

    return () => {
      off();
      clearInterval(interval);
    };
  });
});