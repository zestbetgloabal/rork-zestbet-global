import React, { useState } from 'react';
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
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Copy, Share2, Mail, MessageSquare, Users, Gift } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function InviteTab() {
  const { user } = useUserStore();
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  
  const inviteCode = user?.inviteCode || 'ZEST123';
  
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
  
  const inviteLink = `https://zestbet.com/invite/${inviteCode}?redirect=${encodeURIComponent(getStoreLink())}`;
  const inviteMessage = `Join me on ZestBet and get Ƶ50 bonus! Use my invite code: ${inviteCode} or download the app here: ${inviteLink}`;
  
  const handleCopy = () => {
    // In a real app, this would use Clipboard.setString
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Copied', 'Invite code copied to clipboard');
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
        await new Promise(resolve => setTimeout(resolve, 1500));
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
        await new Promise(resolve => setTimeout(resolve, 1500));
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      ) : (
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