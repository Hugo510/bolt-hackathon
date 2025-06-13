import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

interface UserProgress {
  totalPoints: number;
  currentLevel: number;
  experiencePoints: number;
  streakDays: number;
  longestStreak: number;
  testsCompleted: number;
  sessionsAttended: number;
  resourcesConsumed: number;
  postsCreated: number;
  commentsMade: number;
  badgesEarned: number;
}

interface UserProgressState extends UserProgress {
  addPoints: (points: number) => void;
  incrementTestsCompleted: () => void;
  incrementSessionsAttended: () => void;
  incrementResourcesConsumed: () => void;
  incrementPostsCreated: () => void;
  incrementCommentsMade: () => void;
  updateStreak: (days: number) => void;
  resetProgress: () => void;
  setProgress: (progress: Partial<UserProgress>) => void;
}

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
      // Silently fail
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // Silently fail
    }
  },
};

const calculateLevel = (experiencePoints: number): number => {
  return Math.floor(experiencePoints / 1000) + 1;
};

export const useUserProgressStore = create<UserProgressState>()(
  persist(
    (set, get) => ({
      totalPoints: 0,
      currentLevel: 1,
      experiencePoints: 0,
      streakDays: 0,
      longestStreak: 0,
      testsCompleted: 0,
      sessionsAttended: 0,
      resourcesConsumed: 0,
      postsCreated: 0,
      commentsMade: 0,
      badgesEarned: 0,

      addPoints: (points) => {
        const state = get();
        const newExperiencePoints = state.experiencePoints + points;
        const newLevel = calculateLevel(newExperiencePoints);
        
        set({
          totalPoints: state.totalPoints + points,
          experiencePoints: newExperiencePoints,
          currentLevel: newLevel,
        });
      },

      incrementTestsCompleted: () => {
        const state = get();
        set({ testsCompleted: state.testsCompleted + 1 });
        get().addPoints(100); // 100 puntos por completar un test
      },

      incrementSessionsAttended: () => {
        const state = get();
        set({ sessionsAttended: state.sessionsAttended + 1 });
        get().addPoints(200); // 200 puntos por asistir a una sesión
      },

      incrementResourcesConsumed: () => {
        const state = get();
        set({ resourcesConsumed: state.resourcesConsumed + 1 });
        get().addPoints(50); // 50 puntos por consumir un recurso
      },

      incrementPostsCreated: () => {
        const state = get();
        set({ postsCreated: state.postsCreated + 1 });
        get().addPoints(75); // 75 puntos por crear un post
      },

      incrementCommentsMade: () => {
        const state = get();
        set({ commentsMade: state.commentsMade + 1 });
        get().addPoints(25); // 25 puntos por hacer un comentario
      },

      updateStreak: (days) => {
        const state = get();
        const newLongestStreak = Math.max(state.longestStreak, days);
        set({ 
          streakDays: days,
          longestStreak: newLongestStreak,
        });
      },

      resetProgress: () => {
        set({
          totalPoints: 0,
          currentLevel: 1,
          experiencePoints: 0,
          streakDays: 0,
          longestStreak: 0,
          testsCompleted: 0,
          sessionsAttended: 0,
          resourcesConsumed: 0,
          postsCreated: 0,
          commentsMade: 0,
          badgesEarned: 0,
        });
      },

      setProgress: (progress) => {
        set((state) => ({ ...state, ...progress }));
      },
    }),
    {
      name: 'user-progress-storage',
      storage: secureStorage,
    }
  )
);