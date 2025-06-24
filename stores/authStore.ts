import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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

// Implementación de storage compatible con Zustand
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
      storage: createJSONStorage(() => zustandAsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isFirstLaunch: state.isFirstLaunch,
        // Incluir propiedades requeridas con valores por defecto
        loading: false,
        setUser: state.setUser,
        setSession: state.setSession,
        setLoading: state.setLoading,
        setFirstLaunch: state.setFirstLaunch,
        clearAuth: state.clearAuth,
      }),
    }
  )
);
