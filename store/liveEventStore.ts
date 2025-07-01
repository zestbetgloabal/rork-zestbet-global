import { create } from 'zustand';
import { LiveEvent, LiveChallenge, LiveInteraction } from '@/types';
import { generateRandomId } from '@/utils/helpers';

interface LiveEventState {
  events: LiveEvent[];
  currentEvent: LiveEvent | null;
  isLoading: boolean;
  error: string | null;
  interactions: LiveInteraction[];
  
  // Actions
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<LiveEvent | null>;
  joinEvent: (eventId: string, role?: 'host' | 'participant' | 'viewer') => Promise<boolean>;
  leaveEvent: (eventId: string) => Promise<boolean>;
  sendInteraction: (interaction: Omit<LiveInteraction, 'id' | 'timestamp'>) => Promise<boolean>;
  makeDonation: (eventId: string, amount: number, message?: string) => Promise<boolean>;
  generateAIChallenge: (eventId: string, preferences: { 
    difficulty?: 'easy' | 'medium' | 'hard',
    duration?: number,
    type?: 'solo' | 'team' | 'all'
  }) => Promise<LiveChallenge | null>;
  reset: () => void;
}

// Mock data for development
const mockEvents: LiveEvent[] = [
  {
    id: '1',
    title: 'Challenge Fieber Live: Summer Edition',
    description: 'Join us for our weekly live challenge event! This week we have special summer-themed challenges.',
    status: 'upcoming',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    thumbnailUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000',
    participants: [
      { id: '1', username: 'ZestHost', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000', role: 'host' },
      { id: '2', username: 'ChallengeKing', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000', role: 'participant' },
      { id: '3', username: 'GameMaster', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1000', role: 'participant' },
    ],
    viewerCount: 0,
    fundingGoal: 500,
    fundingRaised: 125,
    sponsors: [
      { id: '1', name: 'ZestBet', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=1000' }
    ],
    challenges: [
      {
        id: '1',
        title: 'Beach Sculpture Challenge',
        description: 'Create a sculpture using only items you would find at the beach.',
        difficulty: 'medium',
        duration: 600, // 10 minutes
        status: 'upcoming',
        participants: [
          { id: '2', username: 'ChallengeKing' },
          { id: '3', username: 'GameMaster' }
        ],
        type: 'solo',
        aiGenerated: true
      },
      {
        id: '2',
        title: 'Summer Trivia Showdown',
        description: 'Test your knowledge about summer facts, movies, and activities.',
        difficulty: 'easy',
        duration: 300, // 5 minutes
        status: 'upcoming',
        participants: [
          { id: '2', username: 'ChallengeKing' },
          { id: '3', username: 'GameMaster' }
        ],
        type: 'team',
        aiGenerated: false
      }
    ]
  },
  {
    id: '2',
    title: 'Challenge Fieber Live: Strategy Edition',
    description: 'A special edition focused on strategic challenges and puzzles.',
    status: 'upcoming',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    thumbnailUrl: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=1000',
    participants: [
      { id: '1', username: 'ZestHost', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000', role: 'host' },
    ],
    viewerCount: 0,
    fundingGoal: 300,
    fundingRaised: 50,
    challenges: []
  }
];

export const useLiveEventStore = create<LiveEventState>((set, get) => ({
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,
  interactions: [],
  
  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      set({ events: mockEvents, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch events', isLoading: false });
    }
  },
  
  fetchEventById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      const event = mockEvents.find(e => e.id === id) || null;
      set({ currentEvent: event, isLoading: false });
      return event;
    } catch (error) {
      set({ error: 'Failed to fetch event', isLoading: false });
      return null;
    }
  },
  
  joinEvent: async (eventId: string, role = 'viewer') => {
    set({ isLoading: true, error: null });
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      // Update the local state to reflect joining
      const { events } = get();
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          // In a real app, we would add the current user
          // For now, we'll just increment the viewer count
          return {
            ...event,
            viewerCount: event.viewerCount + 1
          };
        }
        return event;
      });
      
      set({ events: updatedEvents, isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to join event', isLoading: false });
      return false;
    }
  },
  
  leaveEvent: async (eventId: string) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      
      // Update the local state to reflect leaving
      const { events } = get();
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          // In a real app, we would remove the current user
          // For now, we'll just decrement the viewer count
          return {
            ...event,
            viewerCount: Math.max(0, event.viewerCount - 1)
          };
        }
        return event;
      });
      
      set({ events: updatedEvents, currentEvent: null });
      return true;
    } catch (error) {
      set({ error: 'Failed to leave event' });
      return false;
    }
  },
  
  sendInteraction: async (interaction) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      
      const newInteraction: LiveInteraction = {
        id: generateRandomId(),
        timestamp: new Date(),
        ...interaction
      };
      
      set(state => ({
        interactions: [...state.interactions, newInteraction]
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to send interaction' });
      return false;
    }
  },
  
  makeDonation: async (eventId: string, amount: number, message?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      // Update the local state to reflect the donation
      const { events } = get();
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            fundingRaised: (event.fundingRaised || 0) + amount
          };
        }
        return event;
      });
      
      // Add the donation to interactions
      const newInteraction: LiveInteraction = {
        id: generateRandomId(),
        type: 'donation',
        user: {
          id: '999', // In a real app, this would be the current user's ID
          username: 'CurrentUser', // In a real app, this would be the current user's username
        },
        timestamp: new Date(),
        content: message,
        amount,
        targetChallenge: eventId
      };
      
      set(state => ({
        events: updatedEvents,
        interactions: [...state.interactions, newInteraction],
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to make donation', isLoading: false });
      return false;
    }
  },
  
  generateAIChallenge: async (eventId: string, preferences) => {
    set({ isLoading: true, error: null });
    
    try {
      // In a real app, this would be an API call to an AI service
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing
      
      // Generate a mock challenge based on preferences
      const difficulty = preferences.difficulty || 'medium';
      const duration = preferences.duration || 600; // Default 10 minutes
      const type = preferences.type || 'solo';
      
      // Sample challenge templates based on difficulty
      const challengeTemplates: Record<string, string[]> = {
        easy: [
          'Quick Draw: {item}',
          'Trivia Challenge: {topic}',
          'Word Association: {theme}'
        ],
        medium: [
          'Creative Building: {material}',
          'Puzzle Solving: {puzzle}',
          'Physical Challenge: {activity}'
        ],
        hard: [
          'Complex Strategy: {game}',
          'Multi-step Challenge: {task}',
          'Team Coordination: {objective}'
        ]
      };
      
      // Sample descriptions based on difficulty
      const descriptionTemplates: Record<string, string[]> = {
        easy: [
          'Draw {item} in under 60 seconds. Viewers vote on the best drawing!',
          'Answer questions about {topic} against the clock.',
          'Come up with words related to {theme} as quickly as possible.'
        ],
        medium: [
          'Create something using only {material} within the time limit.',
          'Solve a {puzzle} puzzle before time runs out.',
          'Complete {activity} while following special rules.'
        ],
        hard: [
          'Develop a winning strategy for {game} with limited resources.',
          'Complete all steps of {task} in the correct order within time.',
          'Work with your team to achieve {objective} with communication restrictions.'
        ]
      };
      
      // Random elements to fill in templates
      const elements: Record<string, string[]> = {
        item: ['a pet', 'your favorite food', 'a superhero', 'a movie scene'],
        topic: ['pop culture', 'sports', 'history', 'science'],
        theme: ['summer', 'animals', 'movies', 'food'],
        material: ['household items', 'paper', 'recycled materials', 'food items'],
        puzzle: ['logic', 'visual', 'mathematical', 'word'],
        activity: ['balance challenge', 'memory test', 'coordination task', 'speed challenge'],
        game: ['resource management', 'territory control', 'negotiation', 'pattern recognition'],
        task: ['cooking challenge', 'obstacle course', 'treasure hunt', 'puzzle sequence'],
        objective: ['building a structure', 'solving a mystery', 'creating a performance', 'completing a course']
      };
      
      // Pick random templates and elements
      const templateIndex = Math.floor(Math.random() * 3);
      const titleTemplate = challengeTemplates[difficulty][templateIndex];
      const descriptionTemplate = descriptionTemplates[difficulty][templateIndex];
      
      // Extract the placeholder from the template
      const titlePlaceholder = titleTemplate.match(/{([^}]+)}/)?.[1] || 'item';
      const descriptionPlaceholder = descriptionTemplate.match(/{([^}]+)}/)?.[1] || 'item';
      
      // Pick random elements for the placeholders
      const titleElement = elements[titlePlaceholder as keyof typeof elements][Math.floor(Math.random() * elements[titlePlaceholder as keyof typeof elements].length)];
      const descriptionElement = elements[descriptionPlaceholder as keyof typeof elements][Math.floor(Math.random() * elements[descriptionPlaceholder as keyof typeof elements].length)];
      
      // Create the challenge title and description
      const title = titleTemplate.replace(`{${titlePlaceholder}}`, titleElement);
      const description = descriptionTemplate.replace(`{${descriptionPlaceholder}}`, descriptionElement);
      
      const newChallenge: LiveChallenge = {
        id: generateRandomId(),
        title,
        description,
        difficulty,
        duration,
        status: 'upcoming',
        participants: [],
        type,
        aiGenerated: true
      };
      
      // Update the event with the new challenge
      const { events } = get();
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            challenges: [...event.challenges, newChallenge]
          };
        }
        return event;
      });
      
      set({ events: updatedEvents, isLoading: false });
      return newChallenge;
    } catch (error) {
      set({ error: 'Failed to generate AI challenge', isLoading: false });
      return null;
    }
  },
  
  reset: () => {
    set({
      events: [],
      currentEvent: null,
      isLoading: false,
      error: null,
      interactions: []
    });
  }
}));