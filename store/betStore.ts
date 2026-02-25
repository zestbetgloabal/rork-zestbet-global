import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bet, BetStatus, WalletTransaction } from '@/types';
import { mockBets, mockTransactions } from '@/constants/mockData';
import { CHARITY_PERCENTAGE, WINNER_BONUS_PERCENTAGE } from '@/constants/app';

interface BetState {
  bets: Bet[];
  transactions: WalletTransaction[];
  isLoading: boolean;
  fetchBets: () => Promise<void>;
  createBet: (bet: Omit<Bet, 'id' | 'status' | 'result' | 'creatorConfirmed' | 'opponentConfirmed' | 'winnerId' | 'charityAmount' | 'createdAt'>) => Promise<string | null>;
  acceptBet: (betId: string, opponentId: string, opponentName: string, opponentAvatar: string) => void;
  submitResult: (betId: string, userId: string, result: 'creator_won' | 'opponent_won') => void;
  confirmResult: (betId: string, userId: string) => void;
  settleBet: (betId: string) => { winnerId: string; winAmount: number; charityAmount: number } | null;
  cancelBet: (betId: string) => void;
  getBetsByUser: (userId: string) => Bet[];
  getActiveBets: () => Bet[];
  getPendingBets: () => Bet[];
  addTransaction: (tx: Omit<WalletTransaction, 'id' | 'createdAt'>) => void;
  reset: () => void;
}

export const useBetStore = create<BetState>()(
  persist(
    (set, get) => ({
      bets: [],
      transactions: [],
      isLoading: false,

      fetchBets: async () => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 300));
        const { bets } = get();
        if (bets.length === 0) {
          set({ bets: mockBets, transactions: mockTransactions, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },

      createBet: async (betData) => {
        const id = `bet-${Date.now()}`;
        const newBet: Bet = {
          ...betData,
          id,
          status: betData.opponentId ? 'active' : 'pending',
          result: null,
          creatorConfirmed: false,
          opponentConfirmed: false,
          winnerId: null,
          charityAmount: 0,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          bets: [newBet, ...state.bets],
        }));

        get().addTransaction({
          userId: betData.creatorId,
          type: 'bet_placed',
          amount: -betData.amount,
          description: `Wette erstellt: ${betData.title}`,
          relatedBetId: id,
        });

        console.log('Bet created:', id);
        return id;
      },

      acceptBet: (betId, opponentId, opponentName, opponentAvatar) => {
        set((state) => ({
          bets: state.bets.map((bet) =>
            bet.id === betId
              ? { ...bet, opponentId, opponentName, opponentAvatar, status: 'active' as BetStatus }
              : bet
          ),
        }));

        const acceptedBet = get().bets.find(b => b.id === betId);
        if (acceptedBet) {
          get().addTransaction({
            userId: opponentId,
            type: 'bet_placed',
            amount: -acceptedBet.amount,
            description: `Wette angenommen: ${acceptedBet.title}`,
            relatedBetId: betId,
          });
        }
      },

      submitResult: (betId, userId, result) => {
        set((state) => ({
          bets: state.bets.map((bet) => {
            if (bet.id !== betId) return bet;
            const isCreator = bet.creatorId === userId;
            return {
              ...bet,
              result,
              status: 'waiting_result' as BetStatus,
              creatorConfirmed: isCreator ? true : bet.creatorConfirmed,
              opponentConfirmed: !isCreator ? true : bet.opponentConfirmed,
            };
          }),
        }));
      },

      confirmResult: (betId, userId) => {
        const bet = get().bets.find(b => b.id === betId);
        if (!bet || !bet.result) return;

        const isCreator = bet.creatorId === userId;
        const updatedBet = {
          ...bet,
          creatorConfirmed: isCreator ? true : bet.creatorConfirmed,
          opponentConfirmed: !isCreator ? true : bet.opponentConfirmed,
        };

        if (updatedBet.creatorConfirmed && updatedBet.opponentConfirmed) {
          set((state) => ({
            bets: state.bets.map(b => b.id === betId ? updatedBet : b),
          }));
          get().settleBet(betId);
        } else {
          set((state) => ({
            bets: state.bets.map(b => b.id === betId ? updatedBet : b),
          }));
        }
      },

      settleBet: (betId) => {
        const bet = get().bets.find(b => b.id === betId);
        if (!bet || !bet.result) return null;

        const totalPool = bet.amount * 2;
        const charityAmount = Math.floor(totalPool * CHARITY_PERCENTAGE);
        const winnerBonus = Math.floor(totalPool * WINNER_BONUS_PERCENTAGE);
        const winAmount = totalPool - charityAmount;

        const winnerId = bet.result === 'creator_won' ? bet.creatorId : (bet.opponentId ?? '');

        set((state) => ({
          bets: state.bets.map(b =>
            b.id === betId
              ? { ...b, status: 'completed' as BetStatus, winnerId, charityAmount }
              : b
          ),
        }));

        get().addTransaction({
          userId: winnerId,
          type: 'bet_won',
          amount: winAmount,
          description: `Gewonnen: ${bet.title}`,
          relatedBetId: betId,
        });

        get().addTransaction({
          userId: winnerId,
          type: 'charity',
          amount: -charityAmount,
          description: `Charity-Beitrag (${CHARITY_PERCENTAGE * 100}%)`,
          relatedBetId: betId,
        });

        return { winnerId, winAmount, charityAmount };
      },

      cancelBet: (betId) => {
        const bet = get().bets.find(b => b.id === betId);
        if (!bet) return;

        set((state) => ({
          bets: state.bets.map(b =>
            b.id === betId ? { ...b, status: 'cancelled' as BetStatus } : b
          ),
        }));

        get().addTransaction({
          userId: bet.creatorId,
          type: 'refund',
          amount: bet.amount,
          description: `Wette storniert: ${bet.title}`,
          relatedBetId: betId,
        });
      },

      getBetsByUser: (userId) => {
        return get().bets.filter(b => b.creatorId === userId || b.opponentId === userId);
      },

      getActiveBets: () => {
        return get().bets.filter(b => b.status === 'active' || b.status === 'waiting_result');
      },

      getPendingBets: () => {
        return get().bets.filter(b => b.status === 'pending');
      },

      addTransaction: (tx) => {
        const newTx: WalletTransaction = {
          ...tx,
          id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          transactions: [newTx, ...state.transactions],
        }));
      },

      reset: () => {
        set({ bets: [], transactions: [], isLoading: false });
      },
    }),
    {
      name: 'bet-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ bets: state.bets, transactions: state.transactions }),
    }
  )
);
