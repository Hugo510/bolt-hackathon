import { Stack, Redirect } from 'expo-router';
import { View, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function AuthLayout() {
  const { session, loading } = useAuth();
  const { theme } = useTheme();

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme?.colors?.background || '#FFFFFF' }}>
        <Text style={{ color: theme?.colors?.text || '#000000' }}>Verificando sesión...</Text>
      </View>
    );
  }

  // Redirigir si ya hay sesión
  if (session) {
    console.log('✅ Usuario ya autenticado, redirigiendo a tabs desde auth layout');
    return <Redirect href="/(tabs)" />;
  }

  console.log('🔓 Mostrando pantallas de autenticación');

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}