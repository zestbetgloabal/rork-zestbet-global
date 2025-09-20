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
  Zap,
  UserPlus,
  Copy,
  Phone,
  Video
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
  const [activeTab, setActiveTab] = useState<'chat' | 'betting' | 'challenges' | 'participants' | 'invite'>('betting');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [pendingInvites, setPendingInvites] = useState<{id: string, username: string, status: 'pending' | 'joined' | 'declined'}[]>([]);
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
      // Generate invite link for the event
      setInviteLink(`https://zestbet.app/live-events/${currentEvent.id}?invite=${user.id}`);
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
    
    // In a real implementation, you would:
    // 1. Initialize WebRTC peer connection
    // 2. Start capturing camera stream
    // 3. Send stream to signaling server
    // 4. Notify all viewers that stream has started
    
    try {
      // For now, we'll simulate the streaming process
      // In production, you would integrate with a WebRTC service like:
      // - Agora.io
      // - Twilio Video
      // - Amazon Kinesis Video Streams
      // - Custom WebRTC implementation
      
      console.log('Initializing camera stream...');
      console.log('Setting up WebRTC peer connections...');
      console.log('Broadcasting stream to viewers...');
      
      Alert.alert('🔴 Live Stream Started!', 'You are now broadcasting live to your audience. Viewers can now see your camera feed.');
    } catch (error) {
      console.error('Failed to start stream:', error);
      setIsStreaming(false);
      Alert.alert('Stream Error', 'Failed to start the live stream. Please try again.');
    }
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    console.log('Stopping live stream...');
    
    // In a real implementation, you would:
    // 1. Stop camera capture
    // 2. Close WebRTC peer connections
    // 3. Notify signaling server
    // 4. Update event status
    
    try {
      console.log('Stopping camera capture...');
      console.log('Closing WebRTC connections...');
      console.log('Notifying viewers...');
      
      Alert.alert('Stream Ended', 'Your live stream has been stopped. Thank you for streaming!');
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
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
  
  const handleInviteUser = async (username: string) => {
    if (!currentEvent || !user) return;
    
    try {
      // In a real implementation, you would:
      // 1. Send push notification to the user
      // 2. Add them to pending invites list
      // 3. Store invitation in database
      
      const newInvite = {
        id: Date.now().toString(),
        username,
        status: 'pending' as const
      };
      
      setPendingInvites(prev => [...prev, newInvite]);
      
      Alert.alert(
        'Invitation Sent!',
        `${username} has been invited to join your live stream. They will receive a notification.`
      );
      
      console.log(`Sending invite to ${username} for event ${currentEvent.id}`);
      
    } catch (error) {
      console.error('Failed to send invite:', error);
      Alert.alert('Error', 'Failed to send invitation. Please try again.');
    }
  };
  
  const copyInviteLink = async () => {
    try {
      // For web compatibility, we'll use a simple approach
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(inviteLink);
      } else {
        // For mobile, you would use expo-clipboard
        console.log('Copying to clipboard:', inviteLink);
      }
      
      Alert.alert('Link Copied!', 'The invite link has been copied to your clipboard.');
    } catch (error) {
      console.error('Failed to copy link:', error);
      Alert.alert('Error', 'Failed to copy link. Please try again.');
    }
  };
  
  const handleJoinAsViewer = async () => {
    if (!currentEvent || !user) return;
    
    try {
      // Request to join the stream as a viewer who can be invited to participate
      console.log(`User ${user.username} requesting to join stream ${currentEvent.id}`);
      
      Alert.alert(
        'Join Request Sent',
        'Your request to join the stream has been sent to the host. You will be notified when approved.'
      );
      
    } catch (error) {
      console.error('Failed to request join:', error);
      Alert.alert('Error', 'Failed to send join request. Please try again.');
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
                    // Show live stream - in a real implementation, this would be WebRTC stream from the host
                    <View style={styles.viewerStreamContainer}>
                      {/* For now, show a live camera preview to simulate receiving the stream */}
                      {Platform.OS !== 'web' && cameraPermission?.granted ? (
                        <CameraView 
                          style={styles.streamImage}
                          facing="front"
                        />
                      ) : (
                        <Image 
                          source={{ uri: currentEvent.thumbnailUrl || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=450&fit=crop' }} 
                          style={styles.streamImage}
                        />
                      )}
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
            {isStreamOwner && (
              <Pressable 
                style={[styles.tab, activeTab === 'invite' && styles.activeTab]}
                onPress={() => setActiveTab('invite')}
              >
                <UserPlus size={16} color={activeTab === 'invite' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.tabText, activeTab === 'invite' && styles.activeTabText]}>Invite</Text>
              </Pressable>
            )}
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
              
              {!isStreamOwner && (
                <View style={styles.joinRequestContainer}>
                  <Text style={styles.joinRequestTitle}>Want to participate?</Text>
                  <Text style={styles.joinRequestDescription}>
                    Request to join the stream and interact with the host
                  </Text>
                  <Pressable style={styles.joinRequestButton} onPress={handleJoinAsViewer}>
                    <Video size={20} color="white" />
                    <Text style={styles.joinRequestButtonText}>Request to Join</Text>
                  </Pressable>
                </View>
              )}
              
              {/* Participants list would go here */}
            </View>
          )}
          
          {/* Invite Tab (Only for stream owner) */}
          {activeTab === 'invite' && isStreamOwner && (
            <ScrollView style={styles.inviteContainer} contentContainerStyle={styles.inviteContent}>
              <Text style={styles.tabContentTitle}>Invite Viewers</Text>
              <Text style={styles.tabContentDescription}>
                Invite friends to join your live stream
              </Text>
              
              {/* Invite Link Section */}
              <View style={styles.inviteLinkSection}>
                <Text style={styles.sectionTitle}>Share Invite Link</Text>
                <View style={styles.inviteLinkContainer}>
                  <TextInput
                    style={styles.inviteLinkInput}
                    value={inviteLink}
                    editable={false}
                    selectTextOnFocus
                  />
                  <Pressable style={styles.copyLinkButton} onPress={copyInviteLink}>
                    <Copy size={20} color="white" />
                  </Pressable>
                </View>
                <Text style={styles.inviteLinkDescription}>
                  Anyone with this link can join your stream
                </Text>
              </View>
              
              {/* Direct Invite Section */}
              <View style={styles.directInviteSection}>
                <Text style={styles.sectionTitle}>Invite Specific Users</Text>
                <View style={styles.inviteInputContainer}>
                  <TextInput
                    style={styles.inviteUsernameInput}
                    placeholder="Enter username to invite"
                    placeholderTextColor={colors.textSecondary}
                    onSubmitEditing={(event) => {
                      const username = event.nativeEvent.text.trim();
                      if (username) {
                        handleInviteUser(username);
                        // Clear the input after submission
                        (event.target as any).clear?.();
                      }
                    }}
                  />
                  <Pressable style={styles.inviteButton}>
                    <UserPlus size={20} color="white" />
                  </Pressable>
                </View>
              </View>
              
              {/* Pending Invites */}
              {pendingInvites.length > 0 && (
                <View style={styles.pendingInvitesSection}>
                  <Text style={styles.sectionTitle}>Pending Invitations</Text>
                  {pendingInvites.map((invite) => (
                    <View key={invite.id} style={styles.pendingInviteItem}>
                      <View style={styles.inviteUserInfo}>
                        <View style={styles.inviteAvatar}>
                          <Text style={styles.inviteAvatarText}>
                            {invite.username.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.inviteUsername}>{invite.username}</Text>
                      </View>
                      <View style={styles.inviteStatus}>
                        <Text style={[
                          styles.inviteStatusText,
                          invite.status === 'joined' && styles.inviteStatusJoined,
                          invite.status === 'declined' && styles.inviteStatusDeclined
                        ]}>
                          {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Quick Actions */}
              <View style={styles.quickActionsSection}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                  <Pressable style={styles.quickActionButton}>
                    <Phone size={24} color={colors.primary} />
                    <Text style={styles.quickActionText}>Invite via SMS</Text>
                  </Pressable>
                  <Pressable style={styles.quickActionButton}>
                    <Share2 size={24} color={colors.primary} />
                    <Text style={styles.quickActionText}>Share on Social</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
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
  joinRequestContainer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinRequestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  joinRequestDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  joinRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  joinRequestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inviteContainer: {
    flex: 1,
  },
  inviteContent: {
    padding: 16,
  },
  inviteLinkSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  inviteLinkContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  inviteLinkInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    marginRight: 8,
  },
  copyLinkButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteLinkDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  directInviteSection: {
    marginBottom: 24,
  },
  inviteInputContainer: {
    flexDirection: 'row',
  },
  inviteUsernameInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    marginRight: 8,
  },
  inviteButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingInvitesSection: {
    marginBottom: 24,
  },
  pendingInviteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  inviteUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inviteAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  inviteUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  inviteStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  inviteStatusText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  inviteStatusJoined: {
    color: '#4CAF50',
  },
  inviteStatusDeclined: {
    color: '#F44336',
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
});