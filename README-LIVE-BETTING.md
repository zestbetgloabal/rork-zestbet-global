# Real-Time Betting System with WebRTC Integration

This implementation provides a complete real-time betting system for live events using WebRTC for peer-to-peer communication and Socket.IO for real-time data synchronization.

## Features

### 🎯 Real-Time Betting
- **Live Odds Updates**: Odds change dynamically based on betting activity
- **Instant Bet Placement**: Bets are processed and broadcasted in real-time
- **Live Betting Feed**: See recent bets from other users as they happen
- **Dynamic Market Data**: Total bet counts and amounts update live

### 🔄 WebRTC Integration
- **Peer-to-Peer Communication**: Direct communication between users
- **Real-Time Data Sync**: Instant updates across all connected clients
- **Room-Based Architecture**: Each live event has its own betting room
- **Connection Management**: Automatic handling of user joins/leaves

### 📱 Mobile-First Design
- **Cross-Platform**: Works on iOS, Android, and Web
- **Responsive UI**: Optimized for mobile betting experience
- **Touch-Friendly**: Large buttons and intuitive gestures
- **Real-Time Indicators**: Visual feedback for odds changes and bet activity

## Architecture

### Backend Components

#### 1. WebRTC Service (`backend/services/webrtc.ts`)
```typescript
class WebRTCService {
  // Manages Socket.IO connections
  // Handles real-time betting rooms
  // Processes live bet placement
  // Updates odds dynamically
}
```

#### 2. tRPC API Routes (`backend/trpc/routes/live-events/`)
- `listLiveEventsProcedure`: Get live events with betting data
- `placeLiveBetProcedure`: Place bets with validation
- `getLiveBettingDataProcedure`: Get current betting statistics

#### 3. Real-Time Features
- **Socket.IO Integration**: Real-time communication
- **Room Management**: Event-based betting rooms
- **Odds Calculation**: Dynamic odds based on betting activity
- **Bet Broadcasting**: Instant bet updates to all users

### Frontend Components

#### 1. LiveBettingComponent (`components/LiveBettingComponent.tsx`)
- Real-time betting interface
- Live odds display with change indicators
- Bet placement with validation
- Recent bets feed
- Connection status management

#### 2. Live Event Integration (`app/live-events/[id].tsx`)
- Tabbed interface (Betting, Chat, Challenges, Participants)
- Live stream integration
- Real-time participant count
- Interactive betting during live events

## Usage

### Starting a Live Betting Session

1. **Join Event**: Users automatically join the betting room when viewing a live event
2. **Real-Time Connection**: Socket.IO establishes connection to WebRTC service
3. **Betting Interface**: Live betting component loads with current odds
4. **Place Bets**: Users can place bets with real-time validation

### Betting Flow

```typescript
// 1. User selects bet type and amount
const betData = {
  eventId: "event_123",
  betType: "home", // home, draw, away, yes, no, etc.
  amount: 50,
  odds: 2.1
};

// 2. Bet is validated and processed
socket.emit('place-live-bet', betData);

// 3. Bet is broadcasted to all users
socket.broadcast.emit('betting-data-update', updatedData);

// 4. Odds are recalculated and updated
updateOdds(room, betType, amount);
```

### Real-Time Updates

- **Odds Changes**: Visual indicators show when odds increase/decrease
- **Recent Bets**: Live feed of bets placed by other users
- **Participant Count**: Real-time count of active bettors
- **Market Statistics**: Total bets and amounts per betting option

## Technical Implementation

### WebRTC Service Features

#### Room Management
```typescript
interface LiveBettingRoom {
  eventId: string;
  participants: Map<string, Participant>;
  bettingData: {
    currentOdds: Record<string, number>;
    recentBets: Bet[];
    totalBets: Record<string, BetStats>;
  };
}
```

#### Odds Calculation Algorithm
```typescript
private updateOdds(room: LiveBettingRoom, betType: string, amount: number) {
  const totalAmount = getTotalBetAmount(room);
  const marketShare = getBetTypeAmount(room, betType) / totalAmount;
  
  // Decrease odds for popular bets
  if (marketShare > 0.4) {
    currentOdds[betType] *= 0.98;
  }
  // Increase odds for unpopular bets
  else if (marketShare < 0.2) {
    currentOdds[betType] *= 1.02;
  }
}
```

### Frontend Real-Time Features

#### Socket.IO Integration
```typescript
const socket = io(socketUrl);

socket.on('betting-data-update', (data) => {
  setBettingData(data);
  updateOddsChangeIndicators(data.currentOdds);
});

socket.on('bet-placed', (confirmation) => {
  showBetConfirmation(confirmation);
});
```

#### Live Odds Display
```typescript
const getOddsChangeIcon = (betType: string) => {
  const change = oddsChanges[betType];
  if (change === 'up') return <TrendingUp color={colors.success} />;
  if (change === 'down') return <TrendingDown color={colors.error} />;
  return null;
};
```

## Configuration

### Environment Variables
```bash
# Socket.IO server port
SOCKET_PORT=3001

# WebRTC configuration
WEBRTC_ENABLED=true
```

### Socket.IO Client Configuration
```typescript
const socketUrl = Platform.OS === 'web' 
  ? 'ws://localhost:3001' 
  : 'ws://your-server-url.com';

const socket = io(socketUrl, {
  transports: ['websocket'],
  timeout: 5000,
});
```

## API Endpoints

### tRPC Routes

#### Get Live Events
```typescript
trpc.liveEvents.list.useQuery({
  category: 'football',
  status: 'live',
  limit: 20
});
```

#### Place Live Bet
```typescript
trpc.liveEvents.placeBet.useMutation({
  eventId: 'event_123',
  betType: 'home',
  amount: 50,
  odds: 2.1
});
```

#### Get Betting Data
```typescript
trpc.liveEvents.getBettingData.useQuery({
  eventId: 'event_123'
});
```

### WebSocket Events

#### Client → Server
- `join-live-event`: Join betting room
- `place-live-bet`: Place a bet
- `request-odds-update`: Request current odds
- `send-live-message`: Send chat message

#### Server → Client
- `betting-data-update`: Updated betting data
- `bet-placed`: Bet confirmation
- `odds-update`: Odds changes
- `participant-joined/left`: User activity

## Security Considerations

### Bet Validation
- User balance verification
- Minimum/maximum bet limits
- Rate limiting for bet placement
- Duplicate bet prevention

### Real-Time Security
- User authentication for Socket.IO
- Room access control
- Message validation
- Anti-spam measures

## Performance Optimizations

### Client-Side
- Debounced odds updates
- Efficient re-rendering with React.memo
- Connection pooling
- Automatic reconnection

### Server-Side
- Room-based message broadcasting
- Efficient odds calculation
- Memory management for betting data
- Connection cleanup on disconnect

## Deployment

### Development
```bash
# Start backend with WebRTC service
npm run dev

# Socket.IO server runs on port 3001
# Main API runs on port 3000
```

### Production
```bash
# Build and deploy
npm run build
npm run start

# Configure load balancer for Socket.IO sticky sessions
# Set up Redis for multi-instance Socket.IO scaling
```

## Future Enhancements

### Advanced Features
- **Video Streaming**: Integrate live video with betting
- **Advanced Analytics**: Betting pattern analysis
- **Social Features**: Follow other bettors
- **Tournament Mode**: Multi-event betting competitions

### Scalability
- **Redis Integration**: Multi-server Socket.IO scaling
- **Database Optimization**: Real-time betting data storage
- **CDN Integration**: Global low-latency connections
- **Microservices**: Separate betting and streaming services

## Troubleshooting

### Common Issues

#### Connection Problems
```typescript
// Check WebRTC service status
fetch('/api/live-betting-status')
  .then(res => res.json())
  .then(data => console.log('Service status:', data));
```

#### Betting Errors
- Verify user balance
- Check bet amount limits
- Ensure event is live
- Validate network connection

#### Performance Issues
- Monitor Socket.IO connection count
- Check server memory usage
- Optimize betting data updates
- Implement connection pooling

This real-time betting system provides a complete foundation for live event betting with WebRTC integration, ensuring low-latency updates and seamless user experience across all platforms.