import { Server } from 'socket.io';

interface LiveBettingRoom {
  eventId: string;
  participants: Map<string, {
    userId: string;
    username: string;
    socketId: string;
  }>;
  bettingData: {
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
  };
}

class WebRTCService {
  private io: Server;
  private rooms: Map<string, LiveBettingRoom> = new Map();

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: any) => {
      console.log('User connected:', socket.id);

      // Join live betting room
      socket.on('join-live-event', (data: { eventId: string; userId: string; username: string }) => {
        const { eventId, userId, username } = data;
        
        // Leave any previous rooms
        socket.rooms.forEach((room: string) => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        // Join new room
        socket.join(`event-${eventId}`);
        
        // Initialize room if it doesn't exist
        if (!this.rooms.has(eventId)) {
          this.rooms.set(eventId, {
            eventId,
            participants: new Map(),
            bettingData: {
              currentOdds: { home: 2.1, draw: 3.2, away: 2.8 },
              recentBets: [],
              totalBets: {
                home: { count: 0, amount: 0 },
                draw: { count: 0, amount: 0 },
                away: { count: 0, amount: 0 }
              }
            }
          });
        }

        const room = this.rooms.get(eventId)!;
        room.participants.set(userId, { userId, username, socketId: socket.id });

        // Send current betting data to the new participant
        socket.emit('betting-data-update', room.bettingData);
        
        // Notify others about new participant
        socket.to(`event-${eventId}`).emit('participant-joined', {
          userId,
          username,
          participantCount: room.participants.size
        });

        console.log(`User ${username} joined event ${eventId}`);
      });

      // Handle live bet placement
      socket.on('place-live-bet', (data: {
        eventId: string;
        userId: string;
        username: string;
        betType: string;
        amount: number;
        odds: number;
      }) => {
        const { eventId, userId, username, betType, amount, odds } = data;
        const room = this.rooms.get(eventId);
        
        if (!room) {
          socket.emit('bet-error', { message: 'Event room not found' });
          return;
        }

        // Create bet record
        const bet = {
          id: `bet_${Date.now()}_${userId}`,
          username,
          betType,
          amount,
          odds,
          timestamp: new Date()
        };

        // Update room betting data
        room.bettingData.recentBets.unshift(bet);
        if (room.bettingData.recentBets.length > 20) {
          room.bettingData.recentBets.pop();
        }

        // Update total bets
        if (room.bettingData.totalBets[betType]) {
          room.bettingData.totalBets[betType].count += 1;
          room.bettingData.totalBets[betType].amount += amount;
        }

        // Simulate odds changes based on betting activity
        this.updateOdds(room, betType, amount);

        // Broadcast updated betting data to all participants
        this.io.to(`event-${eventId}`).emit('betting-data-update', room.bettingData);
        
        // Send confirmation to the bettor
        socket.emit('bet-placed', {
          success: true,
          betId: bet.id,
          message: 'Bet placed successfully'
        });

        console.log(`Bet placed: ${username} bet ${amount} on ${betType} for event ${eventId}`);
      });

      // Handle odds requests
      socket.on('request-odds-update', (eventId: string) => {
        const room = this.rooms.get(eventId);
        if (room) {
          socket.emit('odds-update', room.bettingData.currentOdds);
        }
      });

      // Handle chat messages in live events
      socket.on('send-live-message', (data: {
        eventId: string;
        userId: string;
        username: string;
        message: string;
      }) => {
        const { eventId, userId, username, message } = data;
        
        const chatMessage = {
          id: `msg_${Date.now()}_${userId}`,
          userId,
          username,
          message,
          timestamp: new Date()
        };

        // Broadcast message to all participants in the event
        this.io.to(`event-${eventId}`).emit('live-message', chatMessage);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove user from all rooms
        this.rooms.forEach((room, eventId) => {
          const userToRemove = Array.from(room.participants.entries())
            .find(([_, participant]) => participant.socketId === socket.id);
          
          if (userToRemove) {
            const [userId, participant] = userToRemove;
            room.participants.delete(userId);
            
            // Notify others about participant leaving
            socket.to(`event-${eventId}`).emit('participant-left', {
              userId,
              username: participant.username,
              participantCount: room.participants.size
            });
          }
        });
      });
    });
  }

  private updateOdds(room: LiveBettingRoom, betType: string, amount: number) {
    const { currentOdds, totalBets } = room.bettingData;
    
    // Simple odds adjustment algorithm
    // In a real system, this would be more sophisticated
    const totalAmount = Object.values(totalBets).reduce((sum, bet) => sum + bet.amount, 0);
    const betTypeAmount = totalBets[betType]?.amount || 0;
    
    if (totalAmount > 0) {
      const marketShare = betTypeAmount / totalAmount;
      
      // Decrease odds for popular bets, increase for unpopular ones
      if (marketShare > 0.4) {
        currentOdds[betType] = Math.max(1.1, currentOdds[betType] * 0.98);
      } else if (marketShare < 0.2) {
        currentOdds[betType] = Math.min(10.0, currentOdds[betType] * 1.02);
      }
      
      // Adjust other odds to maintain balance
      const otherTypes = Object.keys(currentOdds).filter(type => type !== betType);
      otherTypes.forEach(type => {
        currentOdds[type] = Math.min(10.0, currentOdds[type] * 1.01);
      });
    }
  }

  // Public methods for external use
  public broadcastEventUpdate(eventId: string, update: any) {
    this.io.to(`event-${eventId}`).emit('event-update', update);
  }

  public broadcastOddsChange(eventId: string, newOdds: Record<string, number>) {
    const room = this.rooms.get(eventId);
    if (room) {
      room.bettingData.currentOdds = newOdds;
      this.io.to(`event-${eventId}`).emit('odds-update', newOdds);
    }
  }

  public getRoomData(eventId: string): LiveBettingRoom | undefined {
    return this.rooms.get(eventId);
  }

  public getActiveRooms(): string[] {
    return Array.from(this.rooms.keys());
  }
}

export default WebRTCService;