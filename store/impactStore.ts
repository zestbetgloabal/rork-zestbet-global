import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImpactProject } from '@/types';
import { mockImpactProjects } from '@/constants/mockData';

interface ImpactState {
  projects: ImpactProject[];
  totalDonated: number;
  weeklyFeaturedProject: ImpactProject | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  getTimeUntilNextProject: () => { days: number; hours: number; minutes: number } | null;
  reset: () => void;
}

export const useImpactStore = create<ImpactState>()(
  persist(
    (set, get) => ({
      projects: [],
      totalDonated: 0,
      weeklyFeaturedProject: null,
      isLoading: false,
      error: null,
      
      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // Simulating API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const projects = mockImpactProjects;
          const totalDonated = projects.reduce((sum, project) => sum + project.amount, 0);
          
          // Find the featured project
          const featuredProject = projects.find(project => project.featured) || null;
          
          set({ 
            projects, 
            totalDonated,
            weeklyFeaturedProject: featuredProject,
            isLoading: false 
          });
        } catch (error) {
          set({ error: 'Failed to fetch impact projects', isLoading: false });
        }
      },
      
      getTimeUntilNextProject: () => {
        const { weeklyFeaturedProject } = get();
        
        if (!weeklyFeaturedProject || !weeklyFeaturedProject.endDate) {
          return null;
        }
        
        const now = new Date();
        const endDate = new Date(weeklyFeaturedProject.endDate);
        const timeRemaining = endDate.getTime() - now.getTime();
        
        if (timeRemaining <= 0) {
          return { days: 0, hours: 0, minutes: 0 };
        }
        
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        
        return { days, hours, minutes };
      },
      
      reset: () => {
        set({
          projects: [],
          totalDonated: 0,
          weeklyFeaturedProject: null,
          isLoading: false,
          error: null
        });
      }
    }),
    {
      name: 'impact-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);