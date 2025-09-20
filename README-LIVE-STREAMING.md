# Live Streaming Implementation

This document explains the live streaming functionality that has been implemented in the ZestBet app.

## Overview

The live streaming feature allows event creators to broadcast live video streams to viewers, with integrated live betting and chat functionality.

## Key Components

### 1. Live Event Screen (`app/live-events/[id].tsx`)

- **Real Camera Integration**: Uses `expo-camera` to access device camera
- **Stream Owner Controls**: Event creators can start/stop streaming with camera controls
- **Viewer Experience**: Viewers see live camera feed (simulated for now)
- **Live Betting Integration**: Seamless integration with live betting component
- **Real-time Chat**: Live chat functionality during streams

### 2. WebRTC Service (`backend/services/webrtc.ts`)

- **Stream Management**: Handles stream start/stop events
- **WebRTC Signaling**: Supports WebRTC offer/answer/ICE candidate exchange
- **Room Management**: Manages participants and viewers per event
- **Live Betting Integration**: Combined with betting functionality

### 3. Live Betting Component (`components/LiveBettingComponent.tsx`)

- **HTTP-Only Client**: Fixed subscription issues by using HTTP polling
- **Real-time Updates**: Polls for live betting data every 3 seconds
- **Cross-platform Compatibility**: Works on both web and mobile

## Current Implementation Status

### ✅ Completed Features

1. **Camera Access**: Full camera permission handling and access
2. **Stream UI**: Complete streaming interface with controls
3. **Live Betting**: Working live betting with real-time odds
4. **Chat Integration**: Live chat during streams
5. **Cross-platform Support**: Works on web and mobile
6. **WebRTC Infrastructure**: Basic WebRTC signaling setup

### 🚧 Simulation vs Production

**Current State (Simulation)**:
- Camera preview shows on streamer's device
- Viewers see a simulated stream (camera preview or static image)
- All UI and controls are functional
- Live betting and chat work in real-time

**Production Implementation Needed**:
- Real WebRTC peer-to-peer connections
- Video encoding/decoding
- Stream relay servers for scalability
- Integration with services like:
  - Agora.io
  - Twilio Video
  - Amazon Kinesis Video Streams
  - Custom WebRTC implementation

## Technical Architecture

### Stream Flow

1. **Stream Start**:
   - Event creator taps "Go Live"
   - Camera permission requested
   - Camera preview starts
   - WebRTC signaling initiated
   - Viewers notified of stream start

2. **Live Streaming**:
   - Camera feed captured
   - Video encoded and transmitted
   - Viewers receive and decode stream
   - Live betting and chat continue

3. **Stream End**:
   - Creator stops stream
   - WebRTC connections closed
   - Viewers notified of stream end

### Key Features

- **Real Camera Integration**: Uses device camera with flip controls
- **Live Indicators**: Shows "LIVE" status and viewer count
- **Stream Controls**: Start/stop streaming with visual feedback
- **Viewer Experience**: Waiting states and live stream display
- **Cross-platform**: Works on iOS, Android, and Web

## Usage Instructions

### For Event Creators

1. Navigate to a live event you created
2. Tap "🔴 Go Live" button
3. Grant camera permissions when prompted
4. Use flip button to switch between front/back camera
5. Tap "Stop Stream" to end the broadcast

### For Viewers

1. Join a live event
2. Wait for the creator to start streaming
3. View the live stream once it begins
4. Participate in live betting and chat
5. See real-time viewer count and live indicators

## Next Steps for Production

1. **WebRTC Implementation**:
   - Set up STUN/TURN servers
   - Implement peer connection management
   - Handle connection failures and reconnection

2. **Scalability**:
   - Media relay servers for multiple viewers
   - CDN integration for global distribution
   - Load balancing for high viewer counts

3. **Quality Controls**:
   - Adaptive bitrate streaming
   - Video quality selection
   - Network condition handling

4. **Advanced Features**:
   - Screen sharing capability
   - Multiple camera angles
   - Stream recording and playback
   - Moderation tools

## Error Handling

- Camera permission denied: Shows appropriate error message
- Network issues: Graceful degradation to static content
- Stream failures: Automatic retry mechanisms
- Cross-platform compatibility: Platform-specific fallbacks

## Security Considerations

- Camera permissions properly requested
- Stream access controlled by event ownership
- WebRTC connections secured with proper signaling
- User authentication for streaming rights

The current implementation provides a solid foundation for live streaming with all the UI/UX components in place. The main remaining work is implementing the actual WebRTC video transmission for production use.