import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Pressable, 
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useLiveEventStore } from '@/store/liveEventStore';
import { useUserStore } from '@/store/userStore';

import LiveBettingComponent from '@/components/LiveBettingComponent';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { 
  ArrowLeft, 
  Brain, 
  DollarSign, 
  Heart, 
  MessageCircle, 
  Send, 
  Share2, 
  Users,
  Zap
} from 'lucide-react-native';
import { formatDateTime, formatCurrency } from '@/utils/helpers';
import { LiveInteraction } from '@/types';

export default function LiveEventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { 
    currentEvent, 
    fetchEventById, 
    isLoading, 
    joinEvent, 
    interactions,
    sendInteraction,
    makeDonation,
    generateAIChallenge
  } = useLiveEventStore();
  const { user } = useUserStore();
  
  const [message, setMessage] = useState('');
  const [donationAmount, setDonationAmount] = useState('5');
  const [showDonationPanel, setShowDonationPanel] = useState(false);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'betting' | 'challenges' | 'participants'>('betting');
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isStreamOwner, setIsStreamOwner] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  
  // Fix: Properly type the ref to FlatList
  const scrollViewRef = useRef<FlatList<LiveInteraction>>(null);
  
  useEffect(() => {
    if (id) {
      fetchEventById(id as string);
      joinEvent(id as string);
    }
  }, [id, fetchEventById, joinEvent]);

  useEffect(() => {
    if (currentEvent && user) {
      setIsStreamOwner(currentEvent.creatorId === user.id);
    }
  }, [currentEvent, user]);

  const startStreaming = async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        Alert.alert('Camera Permission', 'Camera permission is required to start streaming.');
        return;
      }
    }

    setIsStreaming(true);
    console.log('Starting live stream...');
    // In a real implementation, you would start WebRTC streaming here
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    console.log('Stopping live stream...');
    // In a real implementation, you would stop WebRTC streaming here
  };

  const toggleCamera = () => {
    setCameraFacing((current: CameraType) => (current === 'back' ? 'front' : 'back'));
  };
  
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const success = await sendInteraction({
      type: 'comment',
      user: {
        id: user?.id || 'guest',
        username: user?.username || 'Guest',
        avatar: user?.avatar
      },
      content: message
    });
    
    if (success) {
      setMessage('');
      // Scroll to bottom of chat
      if (scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }
  };
  
  const handleDonate = async () => {
    const amount = parseInt(donationAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount.');
      return;
    }
    
    if (currentEvent) {
      const success = await makeDonation(currentEvent.id, amount, 'Thanks for the great event!');
      if (success) {
        setShowDonationPanel(false);
        Alert.alert('Thank You!', 'Your donation has been received.');
      }
    }
  };
  
  const handleGenerateChallenge = async () => {
    if (!currentEvent) return;
    
    setIsGeneratingChallenge(true);
    
    try {
      const challenge = await generateAIChallenge(currentEvent.id, {
        difficulty: 'medium',
        duration: 600, // 10 minutes
        type: 'solo'
      });
      
      if (challenge) {
        Alert.alert(
          'Challenge Generated!',
          `The AI has created a new challenge: "${challenge.title}"`
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to generate challenge. Please try again.');
    } finally {
      setIsGeneratingChallenge(false);
    }
  };
  
  const renderInteraction = ({ item }: { item: LiveInteraction }) => {
    switch (item.type) {
      case 'comment':
        return (
          <View style={styles.chatMessage}>
            <View style={styles.chatAvatar}>
              {item.user.avatar ? (
                <Image source={{ uri: item.user.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{item.user.username.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>
            <View style={styles.chatContent}>
              <Text style={styles.chatUsername}>{item.user.username}</Text>
              <Text style={styles.chatText}>{item.content}</Text>
            </View>
          </View>
        );
        
      case 'donation':
        return (
          <View style={styles.donationMessage}>
            <DollarSign size={20} color={colors.primary} />
            <View style={styles.donationContent}>
              <Text style={styles.donationText}>
                <Text style={styles.donationUsername}>{item.user.username}</Text> donated {formatCurrency(item.amount || 0)}
              </Text>
              {item.content && <Text style={styles.donationComment}>{item.content}</Text>}
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  if (isLoading || !currentEvent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading event...</Text>
      </View>
    );
  }
  
  const isLive = currentEvent.status === 'live';
  const isUpcoming = currentEvent.status === 'upcoming';
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{currentEvent.title}</Text>
        <Pressable style={styles.shareButton}>
          <Share2 size={24} color={colors.text} />
        </Pressable>
      </View>
      
      {/* Event Content */}
      <View style={styles.content}>
        {/* Stream View */}
        <View style={styles.streamContainer}>
          {isLive ? (
            <View style={styles.liveStreamContainer}>
              {/* Real Live Stream */}
              {isStreamOwner && isStreaming ? (
                // Stream owner's camera view
                <View style={styles.streamContent}>
                  <CameraView 
                    ref={cameraRef}
                    style={styles.cameraView}
                    facing={cameraFacing}
                  />
                  
                  {/* Camera Controls */}
                  <View style={styles.cameraControls}>
                    <Pressable style={styles.cameraControlButton} onPress={toggleCamera}>
                      <Text style={styles.cameraControlText}>Flip</Text>
                    </Pressable>
                    <Pressable style={styles.stopStreamButton} onPress={stopStreaming}>
                      <Text style={styles.stopStreamText}>Stop Stream</Text>
                    </Pressable>
                  </View>
                </View>
              ) : isStreamOwner && !isStreaming ? (
                // Stream owner's start streaming view
                <View style={styles.streamContent}>
                  <View style={styles.startStreamContainer}>
                    <View style={styles.streamPulse}>
                      <View style={styles.pulseRing} />
                      <View style={styles.pulseCore} />
                    </View>
                    <Text style={styles.startStreamTitle}>Ready to go live?</Text>
                    <Text style={styles.startStreamDescription}>
                      Start your camera to begin streaming to your audience
                    </Text>
                    <Pressable style={styles.startStreamButton} onPress={startStreaming}>
                      <Text style={styles.startStreamButtonText}>🔴 Go Live</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                // Viewer's stream view
                <View style={styles.streamContent}>
                  {isStreaming ? (
                    // Show live stream (in real implementation, this would be WebRTC stream)
                    <View style={styles.viewerStreamContainer}>
                      <Image 
                        source={{ uri: currentEvent.thumbnailUrl || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=450&fit=crop' }} 
                        style={styles.streamImage}
                      />
                      <View style={styles.liveStreamOverlay}>
                        <Text style={styles.liveStreamText}>🔴 LIVE</Text>
                        <Text style={styles.streamDescription}>Streaming now</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.waitingForStreamContainer}>
                      <View style={styles.streamPulse}>
                        <View style={styles.pulseRing} />
                        <View style={styles.pulseCore} />
                      </View>
                      <Text style={styles.waitingStreamText}>Waiting for stream to start...</Text>
                      <Text style={styles.waitingStreamDescription}>
                        The host will begin streaming shortly
                      </Text>
                    </View>
                  )}
                </View>
              )}
              
              {/* Live Indicator and Viewer Count */}
              <View style={styles.streamInfo}>
                <View style={styles.liveIndicator}>
                  <Text style={styles.liveText}>{isStreaming ? 'LIVE' : 'WAITING'}</Text>
                </View>
                <View style={styles.viewerCount}>
                  <Users size={14} color="white" />
                  <Text style={styles.viewerCountText}>{currentEvent.viewerCount}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.streamPlaceholder}>
              <Image 
                source={{ uri: currentEvent.thumbnailUrl || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=450&fit=crop' }} 
                style={styles.thumbnailImage}
              />
              <View style={styles.upcomingOverlay}>
                <Text style={styles.upcomingText}>
                  {isUpcoming ? 'Starting ' + formatDateTime(currentEvent.startTime) : 'Event has ended'}
                </Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Tabs for Betting, Chat, Challenges */}
        <View style={styles.tabsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
          >
            <Pressable 
              style={[styles.tab, activeTab === 'betting' && styles.activeTab]}
              onPress={() => setActiveTab('betting')}
            >
              <Zap size={16} color={activeTab === 'betting' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === 'betting' && styles.activeTabText]}>Live Betting</Text>
            </Pressable>
            <Pressable 
              style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
              onPress={() => setActiveTab('chat')}
            >
              <MessageCircle size={16} color={activeTab === 'chat' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>Chat</Text>
            </Pressable>
            <Pressable 
              style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
              onPress={() => setActiveTab('challenges')}
            >
              <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>Challenges</Text>
            </Pressable>
            <Pressable 
              style={[styles.tab, activeTab === 'participants' && styles.activeTab]}
              onPress={() => setActiveTab('participants')}
            >
              <Users size={16} color={activeTab === 'participants' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === 'participants' && styles.activeTabText]}>Participants</Text>
            </Pressable>
          </ScrollView>
        </View>
        
        {/* Content Area */}
        <View style={styles.interactionArea}>
          {/* Live Betting Tab */}
          {activeTab === 'betting' && isLive && (
            <LiveBettingComponent
              eventId={currentEvent.id}
              userId={user?.id || 'guest'}
              username={user?.username || 'Guest'}
              userBalance={user?.zestBalance || 0}
              onBetPlaced={(betDetails) => {
                console.log('Bet placed:', betDetails);
                // Handle bet placement success
              }}
            />
          )}
          
          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <KeyboardAvoidingView
              style={styles.keyboardAvoidingView}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={0}
            >
              {/* Donation Panel */}
              {showDonationPanel && (
            <View style={styles.donationPanel}>
              <Text style={styles.donationPanelTitle}>Support this event</Text>
              <Text style={styles.donationPanelDescription}>
                Your donation helps fund future events and supports the creators.
              </Text>
              
              <View style={styles.donationAmountContainer}>
                <Pressable 
                  style={[styles.donationPreset, donationAmount === '1' && styles.donationPresetActive]}
                  onPress={() => setDonationAmount('1')}
                >
                  <Text style={[styles.donationPresetText, donationAmount === '1' && styles.donationPresetTextActive]}>$1</Text>
                </Pressable>
                <Pressable 
                  style={[styles.donationPreset, donationAmount === '5' && styles.donationPresetActive]}
                  onPress={() => setDonationAmount('5')}
                >
                  <Text style={[styles.donationPresetText, donationAmount === '5' && styles.donationPresetTextActive]}>$5</Text>
                </Pressable>
                <Pressable 
                  style={[styles.donationPreset, donationAmount === '10' && styles.donationPresetActive]}
                  onPress={() => setDonationAmount('10')}
                >
                  <Text style={[styles.donationPresetText, donationAmount === '10' && styles.donationPresetTextActive]}>$10</Text>
                </Pressable>
                <Pressable 
                  style={[styles.donationPreset, donationAmount === '20' && styles.donationPresetActive]}
                  onPress={() => setDonationAmount('20')}
                >
                  <Text style={[styles.donationPresetText, donationAmount === '20' && styles.donationPresetTextActive]}>$20</Text>
                </Pressable>
                <TextInput
                  style={styles.donationCustomInput}
                  value={donationAmount}
                  onChangeText={setDonationAmount}
                  keyboardType="number-pad"
                  placeholder="Custom"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              
              <View style={styles.donationActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowDonationPanel(false)}
                  variant="outline"
                  style={styles.donationCancelButton}
                />
                <Button
                  title="Donate"
                  onPress={handleDonate}
                  variant="primary"
                  style={styles.donationButton}
                />
              </View>
            </View>
          )}
          
          {/* Chat Messages */}
          <FlatList
            ref={scrollViewRef}
            data={interactions}
            renderItem={renderInteraction}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.chatContainer}
            ListEmptyComponent={
              <View style={styles.emptyChatContainer}>
                <Text style={styles.emptyChatText}>No messages yet. Be the first to say hello!</Text>
              </View>
            }
            onContentSizeChange={() => {
              console.log('[LiveEvent Chat] List content changed, scroll to end');
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }}
            onLayout={() => {
              console.log('[LiveEvent Chat] List layout, scroll to end');
              setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0);
            }}
          />
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable 
              style={styles.actionButton}
              onPress={() => setShowDonationPanel(!showDonationPanel)}
            >
              <Heart size={20} color={colors.primary} />
            </Pressable>
            
            <Pressable 
              style={styles.actionButton}
              onPress={handleGenerateChallenge}
              disabled={isGeneratingChallenge}
            >
              {isGeneratingChallenge ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Brain size={20} color={colors.primary} />
              )}
            </Pressable>
          </View>
          
              {/* Message Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Send a message..."
                  placeholderTextColor={colors.textSecondary}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  onFocus={() => {
                    console.log('[LiveEvent Chat] Input focused, scroll to end');
                    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 50);
                  }}
                  onContentSizeChange={() => {
                    console.log('[LiveEvent Chat] Input size changed, scroll to end');
                    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0);
                  }}
                  testID="live-chat-input"
                />
                <Pressable 
                  style={[
                    styles.sendButton,
                    !message.trim() && styles.disabledSendButton
                  ]}
                  onPress={handleSendMessage}
                  disabled={!message.trim()}
                >
                  <Send size={20} color="white" />
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          )}
          
          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <View style={styles.challengesContainer}>
              <Text style={styles.tabContentTitle}>Live Challenges</Text>
              <Text style={styles.tabContentDescription}>
                Participate in real-time challenges during the event
              </Text>
              {/* Add challenge content here */}
            </View>
          )}
          
          {/* Participants Tab */}
          {activeTab === 'participants' && (
            <View style={styles.participantsContainer}>
              <Text style={styles.tabContentTitle}>Event Participants</Text>
              <Text style={styles.tabContentDescription}>
                {currentEvent.viewerCount} viewers watching this event
              </Text>
              {/* Add participants list here */}
            </View>
          )}
        </View>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  streamContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  liveStreamContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  streamContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  streamImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraView: {
    width: '100%',
    height: '100%',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cameraControlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cameraControlText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  stopStreamButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  stopStreamText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startStreamContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 40,
  },
  startStreamTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  startStreamDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  startStreamButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  startStreamButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewerStreamContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  liveStreamOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  waitingForStreamContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 40,
  },
  waitingStreamText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  waitingStreamDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  streamOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamPulse: {
    position: 'relative',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 59, 48, 0.3)',
    transform: [{ scale: 1.2 }],
  },
  pulseCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
  },
  liveStreamText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streamDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  streamPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  upcomingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  streamInfo: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  liveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  viewerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewerCountText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  tabsContainer: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  interactionArea: {
    flex: 1,
    position: 'relative',
  },
  donationPanel: {
    backgroundColor: colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  donationPanelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  donationPanelDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  donationAmountContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  donationPreset: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  donationPresetActive: {
    backgroundColor: `${colors.primary}20`,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  donationPresetText: {
    fontSize: 14,
    color: colors.text,
  },
  donationPresetTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  donationCustomInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    textAlign: 'center',
    color: colors.text,
  },
  donationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  donationCancelButton: {
    marginRight: 8,
  },
  donationButton: {
    minWidth: 100,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 80, // Space for input
  },
  emptyChatContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyChatText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chatMessage: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chatAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
  },
  chatUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  chatText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  donationMessage: {
    flexDirection: 'row',
    backgroundColor: `${colors.primary}10`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  donationContent: {
    flex: 1,
    marginLeft: 8,
  },
  donationText: {
    fontSize: 14,
    color: colors.text,
  },
  donationUsername: {
    fontWeight: 'bold',
  },
  donationComment: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    flexDirection: 'column',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    color: colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: colors.border,
  },
  challengesContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantsContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  tabContentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});