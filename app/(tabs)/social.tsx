import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  Pressable, 
  ActivityIndicator,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import { Send, Users, UserPlus, ChevronLeft } from 'lucide-react-native';
import { useChatStore } from '@/store/chatStore';
import ChatMessage from '@/components/ChatMessage';
import colors from '@/constants/colors';
import { ChatMessage as ChatMessageType, ChatParticipant } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const { 
    messages, 
    currentRoom, 
    isLoading, 
    fetchMessages, 
    sendMessage,
    friends,
    startDirectMessage,
    sendDirectMessage,
    getDirectMessages,
  } = useChatStore();

  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [activeDM, setActiveDM] = useState<ChatParticipant | null>(null);
  const flatListRef = useRef<FlatList<ChatMessageType>>(null);
  const insets = useSafeAreaInsets();
  const [inputContainerHeight, setInputContainerHeight] = useState<number>(72 + (Platform.OS === 'ios' ? 24 : 12));
  
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);
  
  const currentMessages = useMemo<ChatMessageType[]>(() => {
    if (activeDM) return getDirectMessages(activeDM.id);
    return messages;
  }, [activeDM, getDirectMessages, messages]);
  
  useEffect(() => {
    if (currentMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentMessages]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      console.log('[Chat] keyboardDidShow -> scrollToEnd');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      console.log('[Chat] keyboardDidHide');
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  
  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    setIsSending(true);
    let success = false;
    if (activeDM) {
      success = await sendDirectMessage(activeDM.id, inputText);
    } else {
      success = await sendMessage(inputText);
    }
    if (success) {
      setInputText('');
      Keyboard.dismiss();
    }
    setIsSending(false);
  };
  
  const handleStartDM = async (participant: ChatParticipant) => {
    await startDirectMessage(participant);
    setActiveDM(participant);
    setIsPickerOpen(false);
  };

  const renderMessage = ({ item }: { item: ChatMessageType }) => {
    const isCurrentUser = item.senderId === 'current_user';
    return (
      <ChatMessage 
        message={item} 
        isCurrentUser={isCurrentUser}
      />
    );
  };
  
  if (isLoading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: 'height', default: undefined })}
      keyboardVerticalOffset={88}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {activeDM ? (
            <Pressable
              onPress={() => setActiveDM(null)}
              style={styles.backButton}
              accessibilityRole="button"
              testID="chat-back-button"
            >
              <ChevronLeft size={20} color={colors.primary} />
            </Pressable>
          ) : (
            <Users size={20} color={colors.primary} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.roomName} testID="chat-title">
              {activeDM ? activeDM.username : (currentRoom?.name ?? 'Chat')}
            </Text>
            <Text style={styles.participantCount} testID="chat-subtitle">
              {activeDM ? 'Direktnachricht' : `${currentRoom?.participants.length ?? 0} Mitglieder`}
            </Text>
          </View>
          <Pressable
            onPress={() => setIsPickerOpen(true)}
            style={styles.dmButton}
            accessibilityRole="button"
            testID="open-dm-picker"
          >
            <UserPlus size={20} color={colors.primary} />
          </Pressable>
        </View>
        {!activeDM && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendsScroller}
          >
            {friends.map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => handleStartDM(f)}
                style={styles.friendChip}
                accessibilityRole="button"
                testID={`friend-chip-${f.id}`}
              >
                {f.avatar ? (
                  <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
                ) : (
                  <View style={styles.friendAvatarPlaceholder} />
                )}
                <Text style={styles.friendName} numberOfLines={1}>{f.username}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
      
      <FlatList
        ref={flatListRef}
        data={currentMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={[styles.messagesContent, { paddingBottom: inputContainerHeight + 8 + (Platform.OS === 'ios' ? insets.bottom : 0) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          console.log('[Chat] List content size changed, scroll to end');
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
        onLayout={() => {
          console.log('[Chat] List layout, scroll to end');
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 0);
        }}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        testID="chat-list"
      />
      
      <View style={styles.inputContainer} onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h && Math.abs(h - inputContainerHeight) > 1) {
            console.log('[Chat] inputContainer height set to', h);
            setInputContainerHeight(h);
          }
        }}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={activeDM ? `Nachricht an ${activeDM.username}...` : 'Nachricht schreiben...'}
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            scrollEnabled
            numberOfLines={1}
            textAlignVertical="top"
            onFocus={() => {
              console.log('[Chat] Input focused, scrolling to end');
              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
            }}
            onContentSizeChange={() => {
              console.log('[Chat] Input size changed, ensure last messages visible');
              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 0);
            }}
            testID="chat-input"
          />
          
          <Pressable 
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending) ? styles.disabledSendButton : null
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
            testID="send-button"
          >
            {isSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Send size={20} color="white" />
            )}
          </Pressable>
        </View>
      </View>

      <Modal
        visible={isPickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsPickerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Freund auswählen</Text>
            <ScrollView style={styles.modalList}>
              {friends.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={styles.modalItem}
                  onPress={() => handleStartDM(f)}
                  testID={`dm-select-${f.id}`}
                >
                  {f.avatar ? (
                    <Image source={{ uri: f.avatar }} style={styles.modalAvatar} />
                  ) : (
                    <View style={styles.modalAvatarPlaceholder} />
                  )}
                  <View style={styles.modalTextWrap}>
                    <Text style={styles.modalName}>{f.username}</Text>
                    <Text style={styles.modalSub}>{f.isOnline ? 'Online' : 'Offline'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Pressable style={styles.modalClose} onPress={() => setIsPickerOpen(false)} testID="close-dm-picker">
              <Text style={styles.modalCloseText}>Schließen</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  dmButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerText: {
    marginLeft: 8,
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  participantCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  friendsScroller: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  friendChip: {
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 4,
  },
  friendAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  friendName: {
    fontSize: 12,
    color: colors.text,
    maxWidth: 72,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 8,
  },
  inputContainer: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
    maxHeight: 120,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginBottom: 2,
  },
  disabledSendButton: {
    backgroundColor: colors.border,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  modalList: {
    maxHeight: 340,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  modalAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  modalTextWrap: {
    flex: 1,
  },
  modalName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  modalSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalClose: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCloseText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
});