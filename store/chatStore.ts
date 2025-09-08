import { create } from 'zustand';
import { ChatMessage, ChatRoom, ChatParticipant } from '@/types';

interface ChatState {
  messages: ChatMessage[];
  currentRoom: ChatRoom | null;
  isLoading: boolean;
  error: string | null;
  dms: Record<string, ChatMessage[]>;
  friends: ChatParticipant[];
  fetchMessages: () => Promise<void>;
  sendMessage: (content: string) => Promise<boolean>;
  joinRoom: (roomId: string) => Promise<void>;
  startDirectMessage: (participant: ChatParticipant) => Promise<void>;
  sendDirectMessage: (toUserId: string, content: string) => Promise<boolean>;
  getDirectMessages: (userId: string) => ChatMessage[];
  reset: () => void;
}

// Mock data for the general chat room
const mockMessages: ChatMessage[] = [
  {
    id: '1',
    senderId: 'user1',
    senderUsername: 'BetMaster',
    senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60',
    content: 'Just won big on the Lakers game! 🏀💰',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    type: 'text'
  },
  {
    id: '2',
    senderId: 'user2',
    senderUsername: 'SportsFan',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60',
    content: 'Nice! What was your strategy?',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    type: 'text'
  },
  {
    id: '3',
    senderId: 'user3',
    senderUsername: 'LuckyStreak',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop&q=60',
    content: 'Anyone watching the Champions League tonight?',
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    type: 'text'
  },
  {
    id: '4',
    senderId: 'system',
    senderUsername: 'System',
    content: 'Welcome to the Zest community chat! Share your betting insights and connect with fellow bettors.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    type: 'system'
  }
];

const mockRoom: ChatRoom = {
  id: 'general',
  name: 'General Chat',
  description: 'Community discussion for all Zest users',
  type: 'public',
  participants: [
    {
      id: 'user1',
      username: 'BetMaster',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60',
      role: 'member',
      joinedAt: new Date(),
      isOnline: true
    },
    {
      id: 'user2',
      username: 'SportsFan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60',
      role: 'member',
      joinedAt: new Date(),
      isOnline: true
    },
    {
      id: 'user3',
      username: 'LuckyStreak',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop&q=60',
      role: 'member',
      joinedAt: new Date(),
      isOnline: false
    }
  ],
  unreadCount: 0,
  createdAt: new Date()
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  currentRoom: null,
  isLoading: false,
  error: null,
  dms: {},
  friends: mockRoom.participants,
  
  fetchMessages: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ 
        messages: mockMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
        currentRoom: mockRoom,
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to fetch messages', isLoading: false });
    }
  },
  
  sendMessage: async (content: string) => {
    if (!content.trim()) return false;
    try {
      const newMessage: ChatMessage = {
        id: `${Date.now()}`,
        senderId: 'current_user',
        senderUsername: 'You',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60',
        content: content.trim(),
        timestamp: new Date(),
        type: 'text'
      };
      set((state) => ({
        messages: [...state.messages, newMessage]
      }));
      return true;
    } catch (error) {
      set({ error: 'Failed to send message' });
      return false;
    }
  },
  
  joinRoom: async (_roomId: string) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      set({ 
        currentRoom: mockRoom,
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to join room', isLoading: false });
    }
  },

  startDirectMessage: async (participant: ChatParticipant) => {
    const room: ChatRoom = {
      id: `dm_${participant.id}`,
      name: participant.username,
      type: 'private',
      participants: [
        {
          id: 'current_user',
          username: 'You',
          role: 'member',
          joinedAt: new Date(),
          isOnline: true,
        },
        participant,
      ],
      unreadCount: 0,
      createdAt: new Date(),
    };
    set((state) => ({
      currentRoom: room,
      dms: state.dms[participant.id] ? state.dms : { ...state.dms, [participant.id]: [] },
    }));
  },

  sendDirectMessage: async (toUserId: string, content: string) => {
    if (!content.trim()) return false;
    try {
      const newMessage: ChatMessage = {
        id: `${Date.now()}`,
        senderId: 'current_user',
        senderUsername: 'You',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60',
        content: content.trim(),
        timestamp: new Date(),
        type: 'text'
      };
      set((state) => ({
        dms: {
          ...state.dms,
          [toUserId]: [...(state.dms[toUserId] ?? []), newMessage],
        },
      }));
      return true;
    } catch (error) {
      set({ error: 'Failed to send direct message' });
      return false;
    }
  },

  getDirectMessages: (userId: string) => {
    const { dms } = get();
    return dms[userId] ?? [];
  },

  reset: () => {
    set({
      messages: [],
      currentRoom: null,
      isLoading: false,
      error: null,
      dms: {},
    });
  }
}));