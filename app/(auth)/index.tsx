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
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Sparkles, ArrowRight, Moon, Sun, Heart, Brain, Users } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AuthIndex() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { isFirstLaunch } = useAuth();
  
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
                source={{ uri: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2' }}
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
                {isFirstLaunch ? '¡Bienvenido!' : 'Bienvenido de vuelta'}
              </Text>
              <Text style={[styles.mainTitle, { color: theme.colors.primary }]}>
                Descubre tu vocación
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Conecta con mentores, encuentra tu camino profesional y construye el futuro que deseas
              </Text>
            </Animated.View>
          </View>

          {/* Características destacadas */}
          <Animated.View style={[styles.features, floatingStyle]}>
            {[
              { icon: Brain, text: 'Tests vocacionales personalizados', color: theme.colors.primary },
              { icon: Users, text: 'Mentores expertos certificados', color: theme.colors.secondary },
              { icon: Heart, text: 'Apoyo emocional 24/7', color: theme.colors.accent },
            ].map((feature, index) => (
              <View key={index} style={[styles.featureItem, { backgroundColor: theme.colors.surface }]}>
                <feature.icon size={20} color={feature.color} />
                <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </Animated.View>

          {/* Botones con animaciones */}
          <Animated.View style={[styles.buttonsContainer, floatingStyle]}>
            <AnimatedButton
              title="Comenzar mi viaje"
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

          {/* Footer inspiracional */}
          <Animated.View style={[styles.footer, floatingStyle]}>
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              "El futuro pertenece a quienes creen en la belleza de sus sueños"
            </Text>
            <Text style={[styles.footerAuthor, { color: theme.colors.textMuted }]}>
              - Eleanor Roosevelt
            </Text>
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
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  features: {
    gap: 16,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
    flex: 1,
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
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  footerAuthor: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});