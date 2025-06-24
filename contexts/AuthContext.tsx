import React, { createContext, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isFirstLaunch: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  markOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    session,
    user,
    loading,
    isFirstLaunch,
    setSession,
    setUser,
    setLoading,
    setFirstLaunch,
    clearAuth,
  } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Inicializando autenticación...');

        // Obtener sesión inicial de manera segura
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Error obteniendo sesión:', error);
          // Limpiar AsyncStorage si hay errores de deserialización
          if (error.message?.includes('JSON')) {
            await AsyncStorage.removeItem('auth-storage');
          }
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          console.log('✅ Sesión cargada:', session ? 'Autenticado' : 'No autenticado');
          console.log('👤 Usuario:', session?.user?.email || 'N/A');
        }
      } catch (error) {
        console.error('❌ Error inicializando auth:', error);
        // Limpiar storage corrupto
        try {
          await AsyncStorage.removeItem('auth-storage');
        } catch (cleanupError) {
          console.error('Error limpiando storage:', cleanupError);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Cambio de auth:', event, session ? 'Sesión activa' : 'Sin sesión');
        console.log('👤 Usuario después del cambio:', session?.user?.email || 'N/A');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (authUser: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: authUser.id,
          full_name: authUser.user_metadata?.full_name || 'Usuario',
          interests: [],
        });

      if (error) {
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearAuth();
  };

  const markOnboardingComplete = () => {
    setFirstLaunch(false);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        isFirstLaunch,
        signIn,
        signUp,
        signOut,
        markOnboardingComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}