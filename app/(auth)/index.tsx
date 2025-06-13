import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Sparkles, ArrowRight, Moon, Sun } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AuthIndex() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  
  const floatingY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animación de entrada
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    
    // Animación flotante continua
    floatingY.value = withRepeat(
      withTiming(20, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatingY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Fondo con gradiente animado */}
      <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
        <LinearGradient
          colors={[
            theme.colors.primary + '20',
            theme.colors.secondary + '10',
            theme.colors.background,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Botón de tema */}
      <TouchableOpacity
        style={[styles.themeButton, { backgroundColor: theme.colors.surface }]}
        onPress={toggleTheme}
      >
        {isDark ? (
          <Sun size={20} color={theme.colors.primary} />
        ) : (
          <Moon size={20} color={theme.colors.primary} />
        )}
      </TouchableOpacity>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header con imagen flotante */}
          <View style={styles.header}>
            <Animated.View style={[styles.imageContainer, floatingStyle]}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg' }}
                style={styles.heroImage}
              />
              <View style={[styles.imageOverlay, { backgroundColor: theme.colors.primary + '20' }]} />
              
              {/* Elementos decorativos flotantes */}
              <Animated.View style={[styles.sparkle, styles.sparkle1]}>
                <Sparkles size={16} color={theme.colors.accent} />
              </Animated.View>
              <Animated.View style={[styles.sparkle, styles.sparkle2]}>
                <Sparkles size={12} color={theme.colors.secondary} />
              </Animated.View>
            </Animated.View>

            <Animated.View style={floatingStyle}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Descubre tu{'\n'}
                <Text style={{ color: theme.colors.primary }}>vocación</Text>
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Conecta con mentores, encuentra tu camino profesional y construye el futuro que deseas
              </Text>
            </Animated.View>
          </View>

          {/* Botones con animaciones */}
          <Animated.View style={[styles.buttonsContainer, floatingStyle]}>
            <AnimatedButton
              title="Comenzar"
              onPress={() => router.push('/(auth)/register')}
              variant="gradient"
              size="lg"
              icon={<ArrowRight size={20} color="white" />}
              style={styles.primaryButton}
            />

            <AnimatedButton
              title="Ya tengo cuenta"
              onPress={() => router.push('/(auth)/login')}
              variant="secondary"
              size="lg"
              style={styles.secondaryButton}
            />
          </Animated.View>

          {/* Indicadores de características */}
          <Animated.View style={[styles.features, floatingStyle]}>
            {[
              '🧠 Tests vocacionales',
              '👥 Mentores expertos',
              '💬 Apoyo emocional',
            ].map((feature, index) => (
              <View key={index} style={[styles.featureItem, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  heroImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 20,
    right: 10,
  },
  sparkle2: {
    bottom: 30,
    left: 15,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    gap: 16,
    paddingBottom: 20,
  },
  primaryButton: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  secondaryButton: {
    borderWidth: 2,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 40,
    gap: 8,
  },
  featureItem: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
});