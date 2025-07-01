import { create } from 'zustand';
import { Mission } from '@/types';
import { mockMissions } from '@/constants/mockData';

interface MissionState {
  missions: Mission[];
  isLoading: boolean;
  error: string | null;
  fetchMissions: () => Promise<void>;
  completeMission: (missionId: string) => Promise<boolean>;
  reset: () => void;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  missions: [],
  isLoading: false,
  error: null,
  fetchMissions: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Ensure the status is properly typed as "completed" | "open"
      const typedMissions = mockMissions.map(mission => ({
        ...mission,
        status: mission.status as "completed" | "open"
      }));
      
      set({ missions: typedMissions, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch missions', isLoading: false });
    }
  },
  completeMission: async (missionId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set((state) => ({
        missions: state.missions.map(mission => 
          mission.id === missionId 
            ? { ...mission, status: 'completed' as const } 
            : mission
        ),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: 'Failed to complete mission', isLoading: false });
      return false;
    }
  },
  reset: () => {
    set({
      missions: [],
      isLoading: false,
      error: null
    });
  }
}));