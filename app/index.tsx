import { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    console.log('🚀 Splash Screen - Estado inicial:', { session: !!session, loading });

    // Animaciones de entrada
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });

    setTimeout(() => {
      titleOpacity.value = withTiming(1, { duration: 600 });
    }, 400);
  }, []);

  useEffect(() => {
    console.log('🔄 Splash Screen - Cambio de estado:', { session: !!session, loading });

    // Navegación más rápida y directa
    if (!loading) {
      const timer = setTimeout(() => {
        if (session) {
          console.log('👤 Usuario autenticado, navegando a tabs');
          router.replace('/(tabs)');
        } else {
          console.log('🔓 Usuario no autenticado, navegando a auth');
          router.replace('/(auth)');
        }
      }, 1500); // Reducir tiempo de espera

      return () => clearTimeout(timer);
    }
  }, [session, loading, router]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#06b6d4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2' }}
            style={styles.logo}
          />
        </Animated.View>

        <Animated.View style={titleAnimatedStyle}>
          <Text style={styles.title}>CarreraGuía</Text>
          <Text style={styles.subtitle}>Tu futuro comienza aquí</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});