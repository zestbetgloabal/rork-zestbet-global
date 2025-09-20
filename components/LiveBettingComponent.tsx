import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import colors from '@/constants/colors';
import { formatCurrency } from '@/utils/helpers';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Clock,
  Zap
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

interface LiveBettingData {
  currentOdds: Record<string, number>;
  recentBets: {
    id: string;
    username: string;
    betType: string;
    amount: number;
    odds: number;
    timestamp: Date;
  }[];
  totalBets: Record<string, { count: number; amount: number }>;
}

interface LiveBetMarketOption {
  id: string;
  key: string;
  label: string;
  odds: number;
}

interface LiveBetMarket {
  id: string;
  eventId: string;
  question: string;
  options: LiveBetMarketOption[];
  status: 'open' | 'settled' | 'void';
}

interface LiveBettingProps {
  eventId: string;
  userId: string;
  username: string;
  userBalance: number;
  onBetPlaced?: (betDetails: any) => void;
}

export default function LiveBettingComponent({
  eventId,
  userId,
  username,
  userBalance,
  onBetPlaced
}: LiveBettingProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [bettingData, setBettingData] = useState<LiveBettingData>({
    currentOdds: {},
    recentBets: [],
    totalBets: {}
  });
  const [selectedBetType, setSelectedBetType] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('');
  const [isPlacingBet, setIsPlacingBet] = useState<boolean>(false);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [oddsChanges, setOddsChanges] = useState<Record<string, 'up' | 'down' | 'same'>>({});
  const [activeMarket, setActiveMarket] = useState<LiveBetMarket | null>(null);
  const [subscriptionEnabled, setSubscriptionEnabled] = useState<boolean>(true);
  
  const previousOddsRef = useRef<Record<string, number>>({});

  // Prefetch markets via tRPC to render UI quickly
  const marketsQuery = trpc.liveBets.list.useQuery({ eventId }, {
    enabled: !!eventId,
    staleTime: 5_000,
  });

  useEffect(() => {
    if (marketsQuery.data?.markets?.length) {
      const market = marketsQuery.data.markets[0] as LiveBetMarket;
      setActiveMarket(market);
      const odds: Record<string, number> = {};
      const totals: Record<string, { count: number; amount: number }> = {};
      market.options.forEach(opt => {
        odds[opt.key] = opt.odds;
        totals[opt.key] = { count: 0, amount: 0 };
      });
      setBettingData(prev => ({ ...prev, currentOdds: odds, totalBets: totals }));
    }
  }, [marketsQuery.data]);

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = Platform.OS === 'web' 
      ? (process.env.EXPO_PUBLIC_SOCKET_URL ?? 'ws://localhost:3001') 
      : (process.env.EXPO_PUBLIC_SOCKET_URL ?? 'ws://localhost:3001');
    
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      timeout: 5000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to live betting server');
      setConnected(true);
      
      // Join the live event room
      newSocket.emit('join-live-event', {
        eventId,
        userId,
        username
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from live betting server');
      setConnected(false);
    });

    newSocket.on('betting-data-update', (data: LiveBettingData) => {
      console.log('Betting data updated:', data);
      
      // Track odds changes
      const changes: Record<string, 'up' | 'down' | 'same'> = {};
      Object.keys(data.currentOdds).forEach(betType => {
        const currentOdds = data.currentOdds[betType];
        const previousOdds = previousOddsRef.current[betType];
        
        if (previousOdds !== undefined) {
          if (currentOdds > previousOdds) {
            changes[betType] = 'up';
          } else if (currentOdds < previousOdds) {
            changes[betType] = 'down';
          } else {
            changes[betType] = 'same';
          }
        } else {
          changes[betType] = 'same';
        }
      });
      
      setOddsChanges(changes);
      previousOddsRef.current = { ...data.currentOdds };
      setBettingData(data);
      
      // Clear odds change indicators after 2 seconds
      setTimeout(() => {
        setOddsChanges(prev => {
          const cleared: Record<string, 'up' | 'down' | 'same'> = {};
          Object.keys(prev).forEach(key => {
            cleared[key] = 'same';
          });
          return cleared;
        });
      }, 2000);
    });

    newSocket.on('participant-joined', (data: { userId: string; username: string; participantCount: number }) => {
      setParticipantCount(data.participantCount);
    });

    newSocket.on('participant-left', (data: { userId: string; username: string; participantCount: number }) => {
      setParticipantCount(data.participantCount);
    });

    newSocket.on('bet-placed', (data: { success: boolean; betId: string; message: string }) => {
      setIsPlacingBet(false);
      if (data.success) {
        Alert.alert('Bet Placed!', data.message);
        setBetAmount('');
        setSelectedBetType('');
        onBetPlaced?.(data);
      }
    });

    newSocket.on('bet-error', (data: { message: string }) => {
      setIsPlacingBet(false);
      Alert.alert('Bet Error', data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [eventId, userId, username]);

  const liveBetCreate = trpc.liveBets.create.useMutation();

  // Use subscription with error handling and fallback to polling
  useEffect(() => {
    if (!subscriptionEnabled) {
      // Fallback to polling every 5 seconds
      const interval = setInterval(() => {
        marketsQuery.refetch();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [subscriptionEnabled, marketsQuery]);

  // Use subscription with conditional enabling - disabled for now due to HTTP link limitations
  // const subscriptionResult = trpc.liveBets.subscribe.useSubscription(undefined, {
  //   enabled: subscriptionEnabled && Platform.OS !== 'web',
  //   onData: (evt) => {
  //     if (!evt) return;
  //     if (typeof evt !== 'object' || !('type' in evt)) return;
  //     if (evt.type === 'bet_win') {
  //       const amount = (evt as any).amount ?? 0;
  //       Alert.alert('Wette gewonnen!', `Du hast ${formatCurrency(amount)} erhalten.`);
  //     }
  //     if (evt.type === 'market_settled') {
  //       const winning = (evt as any).winningOptionKey ?? '';
  //       Alert.alert('Market settled', `Winner: ${winning}`);
  //     }
  //   },
  //   onError: (err) => {
  //     console.log('Subscription error, falling back to polling:', err?.message);
  //     setSubscriptionEnabled(false);
  //   }
  // });

  // Disable subscription for now due to HTTP link limitations
  useEffect(() => {
    setSubscriptionEnabled(false);
  }, []);

  const handlePlaceBet = async () => {
    if (!socket || !connected) {
      Alert.alert('Connection Error', 'Not connected to live betting server');
      return;
    }

    if (!selectedBetType) {
      Alert.alert('Select Bet Type', 'Please select a bet type first');
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid bet amount');
      return;
    }

    const MIN_BET = 1;
    const MAX_BET = 10000;
    if (amount < MIN_BET) {
      Alert.alert('Betrag zu niedrig', `Mindesteinsatz ist ${formatCurrency(MIN_BET)}`);
      return;
    }
    if (amount > MAX_BET) {
      Alert.alert('Betrag zu hoch', `Maximaleinsatz ist ${formatCurrency(MAX_BET)}`);
      return;
    }

    if (amount > userBalance) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough balance for this bet');
      return;
    }

    const odds = bettingData.currentOdds[selectedBetType];
    if (!odds) {
      Alert.alert('Odds Error', 'Unable to get current odds for this bet type');
      return;
    }

    setIsPlacingBet(true);

    try {
      if (!activeMarket) throw new Error('No active market');

      const res = await liveBetCreate.mutateAsync({
        eventId,
        marketId: activeMarket.id,
        optionKey: selectedBetType,
        amount,
      });

      if (!res.success) {
        throw new Error(res.message ?? 'Failed to place bet');
      }

      if (socket) {
        socket.emit('place-live-bet', {
          eventId,
          userId,
          username,
          betType: selectedBetType,
          amount,
          odds
        });
      }

      Alert.alert('Bet Placed!', res.message);
      setBetAmount('');
      setSelectedBetType('');
      onBetPlaced?.(res.wager);
    } catch (e: any) {
      Alert.alert('Bet Error', e?.message ?? 'Unknown error');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const getBetTypeLabel = (betType: string): string => {
    const labels: Record<string, string> = {
      home: 'Home Win',
      draw: 'Draw',
      away: 'Away Win',
      yes: 'Yes',
      no: 'No',
      over: 'Over',
      under: 'Under'
    };
    return labels[betType] || betType;
  };

  const getOddsChangeIcon = (betType: string) => {
    const change = oddsChanges[betType];
    if (change === 'up') {
      return <TrendingUp size={16} color={colors.success} />;
    } else if (change === 'down') {
      return <TrendingDown size={16} color={colors.error} />;
    }
    return null;
  };

  const renderBetOption = (betType: string, odds: number) => {
    const isSelected = selectedBetType === betType;
    const totalBet = bettingData.totalBets[betType];
    const betCount = totalBet?.count || 0;
    const betAmount = totalBet?.amount || 0;

    return (
      <Pressable
        key={betType}
        style={[
          styles.betOption,
          isSelected && styles.selectedBetOption
        ]}
        onPress={() => setSelectedBetType(betType)}
      >
        <View style={styles.betOptionHeader}>
          <Text style={[
            styles.betTypeLabel,
            isSelected && styles.selectedBetTypeLabel
          ]}>
            {getBetTypeLabel(betType)}
          </Text>
          {getOddsChangeIcon(betType)}
        </View>
        
        <View style={styles.oddsContainer}>
          <Text style={[
            styles.oddsText,
            isSelected && styles.selectedOddsText
          ]}>
            {odds.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.betStats}>
          <Text style={styles.betStatsText}>
            {betCount} bets • {formatCurrency(betAmount)}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (!connected) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Connecting to live betting...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Zap size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>Live Betting</Text>
        </View>
        <View style={styles.headerRight}>
          <Users size={16} color={colors.textSecondary} />
          <Text style={styles.participantCount}>{participantCount}</Text>
        </View>
      </View>

      {/* Betting Options */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bettingOptions}
      >
        {Object.entries(bettingData.currentOdds).map(([betType, odds]) =>
          renderBetOption(betType, odds)
        )}
      </ScrollView>

      {/* Bet Input */}
      {selectedBetType && (
        <View style={styles.betInputContainer}>
          <View style={styles.betInputHeader}>
            <Text style={styles.betInputTitle}>
              Place bet on {getBetTypeLabel(selectedBetType)}
            </Text>
            <Text style={styles.currentOdds}>
              @ {bettingData.currentOdds[selectedBetType]?.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.amountInputContainer}>
            <TextInput
              style={styles.amountInput}
              placeholder="Enter amount"
              value={betAmount}
              onChangeText={setBetAmount}
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.quickAmounts}>
              {[10, 25, 50, 100].map(amount => (
                <Pressable
                  key={amount}
                  style={styles.quickAmountButton}
                  onPress={() => setBetAmount(amount.toString())}
                >
                  <Text style={styles.quickAmountText}>${amount}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {betAmount && (
            <View style={styles.betSummary}>
              <Text style={styles.betSummaryText}>
                Potential win: {formatCurrency(
                  parseFloat(betAmount) * (bettingData.currentOdds[selectedBetType] || 1)
                )}
              </Text>
            </View>
          )}

          <Text style={styles.limitsText}>Limits: min 1 • max 10,000</Text>

          <Pressable
            style={[
              styles.placeBetButton,
              (!betAmount || isPlacingBet) && styles.disabledButton
            ]}
            onPress={handlePlaceBet}
            disabled={!betAmount || isPlacingBet}
          >
            {isPlacingBet ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <DollarSign size={20} color="white" />
                <Text style={styles.placeBetButtonText}>Place Bet</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {/* Recent Bets */}
      <View style={styles.recentBetsContainer}>
        <Text style={styles.recentBetsTitle}>Recent Bets</Text>
        <ScrollView style={styles.recentBetsList}>
          {bettingData.recentBets.map((bet) => (
            <View key={bet.id} style={styles.recentBetItem}>
              <View style={styles.recentBetInfo}>
                <Text style={styles.recentBetUsername}>{bet.username}</Text>
                <Text style={styles.recentBetDetails}>
                  {getBetTypeLabel(bet.betType)} • {formatCurrency(bet.amount)} @ {bet.odds.toFixed(2)}
                </Text>
              </View>
              <View style={styles.recentBetTime}>
                <Clock size={12} color={colors.textSecondary} />
                <Text style={styles.recentBetTimeText}>
                  {new Date(bet.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  bettingOptions: {
    padding: 16,
    paddingBottom: 8,
  },
  betOption: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBetOption: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  betOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  betTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  selectedBetTypeLabel: {
    color: colors.primary,
  },
  oddsContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  oddsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  selectedOddsText: {
    color: colors.primary,
  },
  betStats: {
    alignItems: 'center',
  },
  betStatsText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  betInputContainer: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  betInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  betInputTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  currentOdds: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  amountInputContainer: {
    marginBottom: 16,
  },
  amountInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountText: {
    fontSize: 14,
    color: colors.text,
  },
  betSummary: {
    backgroundColor: `${colors.success}20`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  betSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    textAlign: 'center',
  },
  placeBetButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  placeBetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  limitsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  recentBetsContainer: {
    flex: 1,
    margin: 16,
    marginTop: 0,
  },
  recentBetsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  recentBetsList: {
    flex: 1,
  },
  recentBetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recentBetInfo: {
    flex: 1,
  },
  recentBetUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  recentBetDetails: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recentBetTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentBetTimeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});