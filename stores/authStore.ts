import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isFirstLaunch: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setFirstLaunch: (isFirst: boolean) => void;
  clearAuth: () => void;
}

// Implementación de storage para AsyncStorage
const asyncStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch {
      // Silently fail
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch {
      // Silently fail
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      loading: true,
      isFirstLaunch: true,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setFirstLaunch: (isFirst) => set({ isFirstLaunch: isFirst }),
      clearAuth: () => set({ user: null, session: null }),
    }),
    {
      name: 'auth-storage',
      storage: asyncStorage,
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isFirstLaunch: state.isFirstLaunch,
      }),
    }
  )
);