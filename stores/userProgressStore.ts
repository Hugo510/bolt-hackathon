import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  badgesEarned: string[];
  lastActivityDate: string;
}

interface UserProgressState extends UserProgress {
  addPoints: (points: number, reason?: string) => void;
  incrementTestsCompleted: () => void;
  incrementSessionsAttended: () => void;
  incrementResourcesConsumed: () => void;
  incrementPostsCreated: () => void;
  incrementCommentsMade: () => void;
  updateStreak: () => void;
  addBadge: (badge: string) => void;
  resetProgress: () => void;
  setProgress: (progress: Partial<UserProgress>) => void;
  getProgressToNextLevel: () => number;
  getPointsToNextLevel: () => number;
}

const zustandAsyncStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const item = await AsyncStorage.getItem(name);
      return item;
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
    }
  },
};

const calculateLevel = (experiencePoints: number): number => {
  return Math.floor(experiencePoints / 1000) + 1;
};

const getPointsForLevel = (level: number): number => {
  return level * 1000;
};

const checkForNewBadges = (state: UserProgress): string[] => {
  const newBadges: string[] = [];

  // Badge por completar primer test
  if (state.testsCompleted >= 1 && !state.badgesEarned.includes('first-test')) {
    newBadges.push('first-test');
  }

  // Badge por racha de 7 días
  if (state.streakDays >= 7 && !state.badgesEarned.includes('week-streak')) {
    newBadges.push('week-streak');
  }

  // Badge por 10 sesiones
  if (
    state.sessionsAttended >= 10 &&
    !state.badgesEarned.includes('mentor-enthusiast')
  ) {
    newBadges.push('mentor-enthusiast');
  }

  // Badge por alcanzar nivel 5
  if (state.currentLevel >= 5 && !state.badgesEarned.includes('level-5')) {
    newBadges.push('level-5');
  }

  return newBadges;
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
      badgesEarned: [],
      lastActivityDate: new Date().toISOString().split('T')[0],

      addPoints: (points, reason) => {
        const state = get();
        const newExperiencePoints = state.experiencePoints + points;
        const newLevel = calculateLevel(newExperiencePoints);
        const newBadges = checkForNewBadges({
          ...state,
          experiencePoints: newExperiencePoints,
          currentLevel: newLevel,
        });

        set({
          totalPoints: state.totalPoints + points,
          experiencePoints: newExperiencePoints,
          currentLevel: newLevel,
          badgesEarned: [...state.badgesEarned, ...newBadges],
        });
      },

      incrementTestsCompleted: () => {
        const state = get();
        set({ testsCompleted: state.testsCompleted + 1 });
        get().addPoints(100, 'Test completado');
        get().updateStreak();
      },

      incrementSessionsAttended: () => {
        const state = get();
        set({ sessionsAttended: state.sessionsAttended + 1 });
        get().addPoints(200, 'Sesión de mentoría');
        get().updateStreak();
      },

      incrementResourcesConsumed: () => {
        const state = get();
        set({ resourcesConsumed: state.resourcesConsumed + 1 });
        get().addPoints(50, 'Recurso consumido');
        get().updateStreak();
      },

      incrementPostsCreated: () => {
        const state = get();
        set({ postsCreated: state.postsCreated + 1 });
        get().addPoints(75, 'Post creado');
        get().updateStreak();
      },

      incrementCommentsMade: () => {
        const state = get();
        set({ commentsMade: state.commentsMade + 1 });
        get().addPoints(25, 'Comentario realizado');
      },

      updateStreak: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

        if (state.lastActivityDate === yesterday) {
          // Continúa la racha
          const newStreak = state.streakDays + 1;
          set({
            streakDays: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            lastActivityDate: today,
          });
        } else if (state.lastActivityDate !== today) {
          // Nueva racha o se rompió
          set({
            streakDays: 1,
            lastActivityDate: today,
          });
        }
      },

      addBadge: (badge) => {
        const state = get();
        if (!state.badgesEarned.includes(badge)) {
          set({ badgesEarned: [...state.badgesEarned, badge] });
        }
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
          badgesEarned: [],
          lastActivityDate: new Date().toISOString().split('T')[0],
        });
      },

      setProgress: (progress) => {
        set((state) => ({ ...state, ...progress }));
      },

      getProgressToNextLevel: () => {
        const state = get();
        const currentLevelPoints = getPointsForLevel(state.currentLevel - 1);
        const nextLevelPoints = getPointsForLevel(state.currentLevel);
        const progressInLevel = state.experiencePoints - currentLevelPoints;
        const pointsNeededForLevel = nextLevelPoints - currentLevelPoints;

        return progressInLevel / pointsNeededForLevel;
      },

      getPointsToNextLevel: () => {
        const state = get();
        const nextLevelPoints = getPointsForLevel(state.currentLevel);
        return nextLevelPoints - state.experiencePoints;
      },
    }),
    {
      name: 'user-progress-storage',
      storage: createJSONStorage(() => zustandAsyncStorage),
    }
  )
);
