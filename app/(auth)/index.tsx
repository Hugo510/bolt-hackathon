import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
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
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Brain, Users, MessageCircle, Star, ArrowRight, Moon, Sun, Sparkles } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AuthIndex() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { isFirstLaunch } = useAuth();
  
  // Animaciones principales
  const breathingScale = useSharedValue(1);
  const floatingY = useSharedValue(0);
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(50);
  
  // Estados para interactividad
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [currentQuote, setCurrentQuote] = useState(0);

  const moods = [
    { emoji: '😊', label: 'Feliz', color: '#FFE4E6', textColor: '#BE185D' },
    { emoji: '🤔', label: 'Curioso', color: '#EDE9FE', textColor: '#7C3AED' },
    { emoji: '😌', label: 'Tranquilo', color: '#DBEAFE', textColor: '#2563EB' },
    { emoji: '😟', label: 'Ansioso', color: '#FEF3C7', textColor: '#D97706' },
    { emoji: '💪', label: 'Motivado', color: '#D1FAE5', textColor: '#059669' },
  ];

  const features = [
    {
      icon: Brain,
      title: 'Tests Vocacionales',
      description: 'Descubre tu carrera ideal con evaluaciones personalizadas',
      color: '#EDE9FE',
      iconColor: '#7C3AED',
    },
    {
      icon: Users,
      title: 'Mentores Expertos',
      description: 'Conecta con profesionales que te guiarán en tu camino',
      color: '#DBEAFE',
      iconColor: '#2563EB',
    },
    {
      icon: MessageCircle,
      title: 'Apoyo Emocional',
      description: 'Chat inteligente disponible 24/7 para acompañarte',
      color: '#D1FAE5',
      iconColor: '#059669',
    },
  ];

  const inspirationalQuotes = [
    { text: "El futuro pertenece a quienes creen en la belleza de sus sueños", author: "Eleanor Roosevelt" },
    { text: "Tu única limitación eres tú mismo", author: "Anónimo" },
    { text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día", author: "Robert Collier" },
  ];

  useEffect(() => {
    // Animación de respiración continua
    breathingScale.value = withRepeat(
      withTiming(1.1, { duration: 2000 }),
      -1,
      true
    );

    // Animación flotante
    floatingY.value = withRepeat(
      withTiming(-10, { duration: 3000 }),
      -1,
      true
    );

    // Animaciones de entrada
    fadeIn.value = withTiming(1, { duration: 1000 });
    slideUp.value = withSpring(0, { damping: 15, stiffness: 100 });

    // Cambio automático de frases inspiracionales
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % inspirationalQuotes.length);
    }, 4000);

    return () => clearInterval(quoteInterval);
  }, []);

  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
  }));

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatingY.value }],
  }));

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

  const MoodChip = ({ mood, isSelected, onPress }: { 
    mood: typeof moods[0], 
    isSelected: boolean, 
    onPress: () => void 
  }) => (
    <TouchableOpacity
      style={[
        styles.moodChip,
        { backgroundColor: isSelected ? mood.color : '#FFFFFF' },
        isSelected && { borderColor: mood.textColor, borderWidth: 2 }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
      <Text style={[
        styles.moodLabel,
        { color: isSelected ? mood.textColor : '#6B7280' }
      ]}>
        {mood.label}
      </Text>
    </TouchableOpacity>
  );

  const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => (
    <Animated.View
      style={[
        styles.featureCard,
        fadeInStyle,
        { backgroundColor: feature.color }
      ]}
    >
      <View style={[styles.featureIcon, { backgroundColor: feature.iconColor + '20' }]}>
        <feature.icon size={28} color={feature.iconColor} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Fondo con gradiente sutil */}
      <LinearGradient
        colors={['#FAFAFA', '#F3F4F6', '#FAFAFA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Botón de tema */}
      <TouchableOpacity
        style={styles.themeButton}
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        {isDark ? (
          <Sun size={20} color="#F59E0B" />
        ) : (
          <Moon size={20} color="#6366F1" />
        )}
      </TouchableOpacity>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header con elemento de respiración */}
          <Animated.View style={[styles.header, fadeInStyle]}>
            <Animated.View style={[styles.breathingContainer, breathingStyle, floatingStyle]}>
              <View style={styles.breathingCircle}>
                <Heart size={32} color="#EC4899" />
              </View>
              <View style={styles.sparkleContainer}>
                <Sparkles size={16} color="#F59E0B" style={styles.sparkle1} />
                <Sparkles size={12} color="#8B5CF6" style={styles.sparkle2} />
                <Sparkles size={14} color="#06B6D4" style={styles.sparkle3} />
              </View>
            </Animated.View>

            <Text style={styles.welcomeText}>
              {isFirstLaunch ? '¡Bienvenido!' : 'Bienvenido de vuelta'}
            </Text>
            <Text style={styles.mainTitle}>CarreraGuía</Text>
            <Text style={styles.subtitle}>
              Tu compañero inteligente para descubrir tu vocación y cuidar tu bienestar emocional
            </Text>
          </Animated.View>

          {/* Selector de estado emocional */}
          <Animated.View style={[styles.moodSection, fadeInStyle]}>
            <Text style={styles.sectionTitle}>¿Cómo te sientes hoy?</Text>
            <View style={styles.moodGrid}>
              {moods.map((mood, index) => (
                <MoodChip
                  key={index}
                  mood={mood}
                  isSelected={selectedMood === mood.label}
                  onPress={() => setSelectedMood(selectedMood === mood.label ? null : mood.label)}
                />
              ))}
            </View>
          </Animated.View>

          {/* Tarjeta de progreso emocional */}
          <Animated.View style={[styles.progressCard, fadeInStyle]}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Tu Bienestar</Text>
                <Text style={styles.progressSubtitle}>Seguimiento diario de tu estado emocional</Text>
              </View>
              <View style={styles.progressIcon}>
                <Star size={24} color="#F59E0B" fill="#F59E0B" />
              </View>
            </View>
            
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>7</Text>
                <Text style={styles.progressLabel}>Días de racha</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>85%</Text>
                <Text style={styles.progressLabel}>Bienestar</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>12</Text>
                <Text style={styles.progressLabel}>Sesiones</Text>
              </View>
            </View>
          </Animated.View>

          {/* Características principales */}
          <Animated.View style={[styles.featuresSection, fadeInStyle]}>
            <Text style={styles.sectionTitle}>¿Qué puedes hacer?</Text>
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </Animated.View>

          {/* Frase inspiracional */}
          <Animated.View style={[styles.quoteCard, fadeInStyle]}>
            <Text style={styles.quoteText}>
              "{inspirationalQuotes[currentQuote].text}"
            </Text>
            <Text style={styles.quoteAuthor}>
              - {inspirationalQuotes[currentQuote].author}
            </Text>
          </Animated.View>

          {/* Botones de acción */}
          <Animated.View style={[styles.actionButtons, fadeInStyle]}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.primaryButtonText}>Comenzar mi viaje</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
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
    backgroundColor: '#FFFFFF',
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  breathingContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  sparkleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle1: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 20,
    left: 10,
  },
  sparkle3: {
    position: 'absolute',
    top: 30,
    left: -5,
  },
  welcomeText: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#6B7280',
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  moodSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 100,
  },
  moodEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
  },
  progressSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  progressIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  progressStat: {
    alignItems: 'center',
    flex: 1,
  },
  progressNumber: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#1F2937',
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  quoteCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  quoteText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#0C4A6E',
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#0C4A6E',
    textAlign: 'right',
  },
  actionButtons: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#6366F1',
  },
});