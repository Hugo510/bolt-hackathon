import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeSupabase } from '@/lib/supabase';
import ConnectionDebugger from '@/components/debug/ConnectionDebugger';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  useFrameworkReady();
  
  const [showDebugger, setShowDebugger] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Inter_400Regular': Inter_400Regular,
    'Inter_500Medium': Inter_500Medium,
    'Inter_600SemiBold': Inter_600SemiBold,
    'Inter_700Bold': Inter_700Bold,
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Inicializando aplicación...');
        
        // Inicializar Supabase
        const supabaseStatus = await initializeSupabase();
        console.log('✅ Supabase inicializado:', supabaseStatus);
        
        setSupabaseReady(true);
        
        // Mostrar debugger en desarrollo si hay problemas
        if (process.env.NODE_ENV === 'development' && !supabaseStatus.connected) {
          setShowDebugger(true);
        }
        
      } catch (error) {
        console.error('❌ Error inicializando aplicación:', error);
        
        // Mostrar debugger en caso de error
        if (process.env.NODE_ENV === 'development') {
          setShowDebugger(true);
        }
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && supabaseReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, supabaseReady]);

  // Mostrar debugger con triple tap en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      let tapCount = 0;
      const handleTripleTap = () => {
        tapCount++;
        if (tapCount === 3) {
          setShowDebugger(true);
          tapCount = 0;
        }
        setTimeout(() => { tapCount = 0; }, 1000);
      };

      // Agregar listener para triple tap (solo en desarrollo)
      document.addEventListener('click', handleTripleTap);
      return () => document.removeEventListener('click', handleTripleTap);
    }
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!supabaseReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
            
            {/* Debugger de conexión (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
              <ConnectionDebugger 
                visible={showDebugger} 
                onClose={() => setShowDebugger(false)} 
              />
            )}
          </GestureHandlerRootView>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}