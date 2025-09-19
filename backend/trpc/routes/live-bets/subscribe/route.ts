import { observable } from '@trpc/server/observable';
import { publicProcedure } from '../../../create-context';

export default publicProcedure.subscription(() => {
  return observable<string>((emit) => {
    const interval = setInterval(() => {
      emit.next('live-update');
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  });
});