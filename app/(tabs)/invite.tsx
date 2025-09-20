import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  TextInput,
  Alert,
  Share,
  Platform,
  Linking,

  ScrollView,
  Image
} from 'react-native';
import { Copy, Share2, Mail, MessageSquare, Users, Gift, Video, UserPlus, ExternalLink } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';
import { useLiveEventStore } from '@/store/liveEventStore';
import { LiveEvent } from '@/types';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { useRouter } from 'expo-router';

export default function InviteTab() {
  const { user } = useUserStore();
  const { events, fetchEvents } = useLiveEventStore();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'live-events'>('general');

  
  // Get active live events created by the current user
  const activeLiveEvents = events.filter((event: LiveEvent) => 
    (event.status === 'live' || event.status === 'upcoming') && 
    event.creatorId === user?.id
  );
  
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  // Switch to live events tab if user has active events
  useEffect(() => {
    if (activeLiveEvents.length > 0) {
      setActiveTab('live-events');
    }
  }, [activeLiveEvents.length]);
  
  const inviteCode = user?.inviteCode || 'ZEST123';
  
  const generateLiveEventInviteLink = (eventId: string) => {
    const baseUrl = Platform.OS === 'web' ? window.location.origin : 'https://zestbet.app';
    return `${baseUrl}/live-events/${eventId}?invite=${user?.id || 'guest'}`;
  };
  
  const shareLiveEventInvite = async (event: LiveEvent) => {
    const inviteLink = generateLiveEventInviteLink(event.id);
    const message = `🔴 Join my live event: "${event.title}"\n\nWatch and participate live at: ${inviteLink}\n\nDownload ZestBet: https://zestbet.com/download`;
    
    try {
      await Share.share({
        message,
        title: `Join ${event.title} on ZestBet`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share live event invite');
    }
  };
  
  const copyLiveEventLink = async (event: LiveEvent) => {
    const inviteLink = generateLiveEventInviteLink(event.id);
    
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(inviteLink);
      } else {
        // For mobile platforms, we'll simulate clipboard functionality
        console.log('Copying to clipboard:', inviteLink);
      }
      
      Alert.alert('Link Copied!', `Live event invite link copied:\n\n${inviteLink}`);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Show the link in the alert so user can copy manually
      Alert.alert('Invite Link', `Copy this link to share:\n\n${inviteLink}`);
    }
  };
  
  const openLiveEvent = (eventId: string) => {
    router.push(`/live-events/${eventId}`);
  };
  
  // Create app store links based on platform
  const appStoreLink = 'https://apps.apple.com/app/zestbet/id1234567890';
  const playStoreLink = 'https://play.google.com/store/apps/details?id=com.zestbet.app';
  
  // Create invite link with app store redirect
  const getStoreLink = () => {
    if (Platform.OS === 'ios') {
      return appStoreLink;
    } else if (Platform.OS === 'android') {
      return playStoreLink;
    } else {
      // For web or unknown platforms, use a universal link
      return 'https://zestbet.com/download';
    }
  };
  
  const getInviteLink = () => {
    const baseUrl = Platform.OS === 'web' ? window.location.origin : 'https://zestbet.app';
    return `${baseUrl}/invite/${inviteCode}?redirect=${encodeURIComponent(getStoreLink())}`;
  };
  
  const inviteLink = getInviteLink();
  const inviteMessage = `🎯 Join me on ZestBet and get Ƶ50 bonus!\n\n💰 Use my invite code: ${inviteCode}\n🔗 Or click here: ${inviteLink}\n\n📱 Download the app and start winning!`;
  
  const handleCopy = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(inviteCode);
      } else {
        // For mobile platforms, we'll simulate clipboard functionality
        console.log('Copying invite code:', inviteCode);
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Copied!', `Invite code copied: ${inviteCode}`);
    } catch (error) {
      console.error('Failed to copy:', error);
      Alert.alert('Invite Code', `Your invite code: ${inviteCode}`);
    }
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: inviteMessage,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share invite');
    }
  };
  
  const handleSendSMS = async () => {
    if (showContactForm && contactPhone.trim() === '') {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }
    
    const phoneNumber = showContactForm ? contactPhone : '';
    const smsUrl = Platform.OS === 'ios' 
      ? `sms:${phoneNumber}&body=${encodeURIComponent(inviteMessage)}`
      : `sms:${phoneNumber}?body=${encodeURIComponent(inviteMessage)}`;
    
    try {
      if (showContactForm) {
        setIsSending(true);
        // Simulate sending SMS via API
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSending(false);
        setContactPhone('');
        setShowContactForm(false);
        Alert.alert('Success', 'Invitation SMS sent successfully!');
        return;
      }
      
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
      } else {
        setShowContactForm(true);
      }
    } catch (error) {
      setIsSending(false);
      Alert.alert('Error', 'Failed to send SMS. Please try again.');
    }
  };
  
  const handleSendEmail = async () => {
    if (showContactForm && contactEmail.trim() === '') {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    
    try {
      if (showContactForm) {
        setIsSending(true);
        // Simulate sending email via API
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSending(false);
        setContactEmail('');
        setShowContactForm(false);
        Alert.alert('Success', 'Invitation email sent successfully!');
        return;
      }
      
      const emailUrl = `mailto:?subject=${encodeURIComponent('Join me on ZestBet!')}&body=${encodeURIComponent(inviteMessage)}`;
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        setShowContactForm(true);
      }
    } catch (error) {
      setIsSending(false);
      Alert.alert('Error', 'Failed to send email. Please try again.');
    }
  };
  
  const handleSendToContacts = () => {
    setShowContactForm(true);
  };
  
  const handleCancelContactForm = () => {
    setShowContactForm(false);
    setContactEmail('');
    setContactPhone('');
  };
  
  // Direct send invite code function
  const handleDirectSend = async () => {
    if (!contactEmail && !contactPhone) {
      Alert.alert('Error', 'Please enter an email address or phone number');
      return;
    }
    
    setIsSending(true);
    
    try {
      // In a real app, this would make an API call to send the invite
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      let message = 'Invitation sent successfully!';
      if (contactEmail && contactPhone) {
        message = 'Invitation sent via email and SMS!';
      } else if (contactEmail) {
        message = 'Invitation sent via email!';
      } else if (contactPhone) {
        message = 'Invitation sent via SMS!';
      }
      
      Alert.alert('Success', message);
      setContactEmail('');
      setContactPhone('');
      setShowContactForm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to send invitation. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <Pressable 
          style={[styles.tabButton, activeTab === 'general' && styles.activeTabButton]}
          onPress={() => setActiveTab('general')}
        >
          <Gift size={20} color={activeTab === 'general' ? 'white' : colors.primary} />
          <Text style={[styles.tabButtonText, activeTab === 'general' && styles.activeTabButtonText]}>General Invites</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.tabButton, activeTab === 'live-events' && styles.activeTabButton]}
          onPress={() => setActiveTab('live-events')}
        >
          <Video size={20} color={activeTab === 'live-events' ? 'white' : colors.primary} />
          <Text style={[styles.tabButtonText, activeTab === 'live-events' && styles.activeTabButtonText]}>Live Events</Text>
          {activeLiveEvents.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeLiveEvents.length}</Text>
            </View>
          )}
        </Pressable>
      </View>
      
      {showContactForm ? (
        <View style={styles.contactFormContainer}>
          <Text style={styles.contactFormTitle}>Send Invitation</Text>
          
          <Text style={styles.contactFormLabel}>Email Address</Text>
          <TextInput
            style={styles.contactInput}
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.textSecondary}
          />
          
          <Text style={styles.contactFormLabel}>Phone Number</Text>
          <TextInput
            style={styles.contactInput}
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            placeholderTextColor={colors.textSecondary}
          />
          
          <Text style={styles.contactFormHelp}>
            Enter at least one contact method to send the invitation
          </Text>
          
          <View style={styles.contactFormActions}>
            <Button
              title="Cancel"
              onPress={handleCancelContactForm}
              variant="outline"
              style={styles.contactFormCancelButton}
            />
            <Button
              title="Send Invitation"
              onPress={handleDirectSend}
              loading={isSending}
              style={styles.contactFormSendButton}
              disabled={!contactEmail && !contactPhone}
            />
          </View>
        </View>
      ) : activeTab === 'general' ? (
        <View style={styles.content}>
          <View style={styles.rewardCard}>
            <Gift size={32} color="white" style={styles.rewardIcon} />
            <Text style={styles.rewardTitle}>Invite Friends, Get Rewards</Text>
            <Text style={styles.rewardDescription}>
              For each friend who joins using your invite code, you both get Ƶ50!
            </Text>
          </View>
          
          <Text style={styles.sectionTitle}>Your Invite Code</Text>
          
          <View style={styles.codeContainer}>
            <TextInput
              style={styles.codeInput}
              value={inviteCode}
              editable={false}
            />
            <Pressable style={styles.copyButton} onPress={handleCopy}>
              <Copy size={20} color={colors.primary} />
              <Text style={styles.copyButtonText}>{copied ? 'Copied!' : 'Copy'}</Text>
            </Pressable>
          </View>
          
          <Text style={styles.sectionTitle}>Share Invite</Text>
          
          <View style={styles.shareOptions}>
            <Pressable style={styles.shareOption} onPress={handleShare}>
              <View style={[styles.shareIconContainer, { backgroundColor: colors.primary }]}>
                <Share2 size={24} color="white" />
              </View>
              <Text style={styles.shareOptionText}>Share</Text>
            </Pressable>
            
            <Pressable style={styles.shareOption} onPress={handleSendSMS}>
              <View style={[styles.shareIconContainer, { backgroundColor: colors.success }]}>
                <MessageSquare size={24} color="white" />
              </View>
              <Text style={styles.shareOptionText}>SMS</Text>
            </Pressable>
            
            <Pressable style={styles.shareOption} onPress={handleSendEmail}>
              <View style={[styles.shareIconContainer, { backgroundColor: colors.secondary }]}>
                <Mail size={24} color="white" />
              </View>
              <Text style={styles.shareOptionText}>Email</Text>
            </Pressable>
            
            <Pressable style={styles.shareOption} onPress={handleSendToContacts}>
              <View style={[styles.shareIconContainer, { backgroundColor: colors.primary }]}>
                <Users size={24} color="white" />
              </View>
              <Text style={styles.shareOptionText}>Contacts</Text>
            </Pressable>
          </View>
          
          <View style={styles.linkContainer}>
            <Text style={styles.linkTitle}>Invite Link</Text>
            <Text style={styles.link} numberOfLines={2}>{inviteLink}</Text>
            <Text style={styles.linkDescription}>
              This link will direct your friends to download the app from the App Store or Google Play
            </Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Friends Invited</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Ƶ0</Text>
              <Text style={styles.statLabel}>Rewards Earned</Text>
            </View>
          </View>
        </View>
      ) : (
        /* Live Events Tab */
        <View style={styles.content}>
          {activeLiveEvents.length === 0 ? (
            <View style={styles.noEventsContainer}>
              <Video size={64} color={colors.textSecondary} />
              <Text style={styles.noEventsTitle}>No Active Live Events</Text>
              <Text style={styles.noEventsDescription}>
                Create a live event to start inviting viewers and participants
              </Text>
              <Button
                title="Create Live Event"
                onPress={() => router.push('/create-live-event')}
                style={styles.createEventButton}
                icon={<Video size={20} color="white" />}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.sectionTitle}>Your Active Live Events</Text>
              <Text style={styles.sectionDescription}>
                Share these events to invite viewers and participants
              </Text>
              
              {activeLiveEvents.map((event: LiveEvent) => (
                <View key={event.id} style={styles.liveEventCard}>
                  <View style={styles.liveEventHeader}>
                    <Image 
                      source={{ uri: event.thumbnailUrl || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=400' }}
                      style={styles.liveEventThumbnail}
                    />
                    <View style={styles.liveEventInfo}>
                      <Text style={styles.liveEventTitle} numberOfLines={2}>{event.title}</Text>
                      <View style={styles.liveEventMeta}>
                        <View style={[styles.statusBadge, event.status === 'live' ? styles.liveBadge : styles.upcomingBadge]}>
                          <Text style={styles.statusBadgeText}>
                            {event.status === 'live' ? '🔴 LIVE' : '⏰ UPCOMING'}
                          </Text>
                        </View>
                        <Text style={styles.liveEventViewers}>
                          <Users size={12} color={colors.textSecondary} /> {event.viewerCount || 0}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.liveEventActions}>
                    <Pressable 
                      style={styles.liveEventAction}
                      onPress={() => copyLiveEventLink(event)}
                    >
                      <Copy size={18} color={colors.primary} />
                      <Text style={styles.liveEventActionText}>Copy Link</Text>
                    </Pressable>
                    
                    <Pressable 
                      style={styles.liveEventAction}
                      onPress={() => shareLiveEventInvite(event)}
                    >
                      <Share2 size={18} color={colors.primary} />
                      <Text style={styles.liveEventActionText}>Share</Text>
                    </Pressable>
                    
                    <Pressable 
                      style={styles.liveEventAction}
                      onPress={() => openLiveEvent(event.id)}
                    >
                      <ExternalLink size={18} color={colors.primary} />
                      <Text style={styles.liveEventActionText}>Open</Text>
                    </Pressable>
                  </View>
                  
                  <View style={styles.inviteLinkPreview}>
                    <Text style={styles.inviteLinkLabel}>Invite Link:</Text>
                    <Text style={styles.inviteLinkText} numberOfLines={1}>
                      {generateLiveEventInviteLink(event.id)}
                    </Text>
                  </View>
                </View>
              ))}
              
              <View style={styles.quickInviteSection}>
                <Text style={styles.sectionTitle}>Quick Invite Options</Text>
                <View style={styles.quickInviteGrid}>
                  <Pressable style={styles.quickInviteOption}>
                    <MessageSquare size={24} color={colors.primary} />
                    <Text style={styles.quickInviteText}>SMS Invite</Text>
                  </Pressable>
                  <Pressable style={styles.quickInviteOption}>
                    <Mail size={24} color={colors.primary} />
                    <Text style={styles.quickInviteText}>Email Invite</Text>
                  </Pressable>
                  <Pressable style={styles.quickInviteOption}>
                    <UserPlus size={24} color={colors.primary} />
                    <Text style={styles.quickInviteText}>Direct Invite</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  rewardCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  rewardIcon: {
    marginBottom: 12,
  },
  rewardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  rewardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: colors.card,
    color: colors.text,
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginLeft: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  copyButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  shareOption: {
    alignItems: 'center',
    width: '22%',
  },
  shareIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareOptionText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  linkContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
  },
  linkDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    position: 'relative',
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  activeTabButtonText: {
    color: 'white',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noEventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noEventsDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  createEventButton: {
    paddingHorizontal: 24,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  liveEventCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  liveEventHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  liveEventThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  liveEventInfo: {
    flex: 1,
  },
  liveEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  liveEventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadge: {
    backgroundColor: '#FF3B30',
  },
  upcomingBadge: {
    backgroundColor: colors.primary,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  liveEventViewers: {
    fontSize: 12,
    color: colors.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveEventActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  liveEventAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  liveEventActionText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 6,
    fontWeight: '600',
  },
  inviteLinkPreview: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  inviteLinkLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  inviteLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  quickInviteSection: {
    marginTop: 24,
  },
  quickInviteGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickInviteOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickInviteText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  contactFormContainer: {
    padding: 16,
  },
  contactFormTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  contactFormLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  contactInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: colors.card,
    color: colors.text,
  },
  contactFormHelp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 16,
  },
  contactFormActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactFormCancelButton: {
    flex: 1,
    marginRight: 8,
  },
  contactFormSendButton: {
    flex: 2,
    marginLeft: 8,
  },
});