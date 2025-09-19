import { EventEmitter } from 'events';

export type LiveBetEvent =
  | { type: 'heartbeat'; message: string }
  | { type: 'bet_win'; userId: string; wagerId: string; amount: number; marketId: string; message: string }
  | { type: 'bet_lost'; userId: string; wagerId: string; marketId: string; message: string }
  | { type: 'market_settled'; marketId: string; winningOptionKey: string; message: string };

class PubSub {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(0);
  }

  on(listener: (evt: LiveBetEvent) => void) {
    const handler = (evt: LiveBetEvent) => listener(evt);
    this.emitter.on('event', handler);
    return () => this.emitter.off('event', handler);
  }

  emit(evt: LiveBetEvent) {
    this.emitter.emit('event', evt);
  }
}

export const pubsub = new PubSub();
export default pubsub;
