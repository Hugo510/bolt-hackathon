import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsive, useResponsiveSpacing, useResponsiveFontSize } from '@/hooks/useResponsive';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';
import ResponsiveGrid from '@/components/ui/ResponsiveGrid';
import BreathingCircle from '@/components/ui/BreathingCircle';
import EmotionChip from '@/components/ui/EmotionChip';
import { Heart, Brain, Users, MessageCircle, ArrowRight, Moon, Sun, Sparkles } from 'lucide-react-native';

export default function AuthIndex() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { isFirstLaunch } = useAuth();
  const { isMobile, isTablet, width, height, orientation } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fontSize = useResponsiveFontSize();
  
  // Animaciones principales
  const breathingScale = useSharedValue(1);
  const floatingY = useSharedValue(0);
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(50);
  
  // Estados para interactividad
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [currentQuote, setCurrentQuote] = useState(0);

  const moods = [
    { emoji: '😊', label: 'Feliz', color: theme.colors.primary + '20', textColor: theme.colors.primary },
    { emoji: '🤔', label: 'Curioso', color: theme.colors.secondary + '20', textColor: theme.colors.secondary },
    { emoji: '😌', label: 'Tranquilo', color: theme.colors.accent + '20', textColor: theme.colors.accent },
    { emoji: '😟', label: 'Ansioso', color: theme.colors.warning + '20', textColor: theme.colors.warning },
    { emoji: '💪', label: 'Motivado', color: theme.colors.success + '20', textColor: theme.colors.success },
  ];

  const features = [
    {
      icon: Brain,
      title: 'Tests Vocacionales',
      description: 'Descubre tu carrera ideal con evaluaciones personalizadas',
      color: theme.colors.primary + '15',
      iconColor: theme.colors.primary,
    },
    {
      icon: Users,
      title: 'Mentores Expertos',
      description: 'Conecta con profesionales que te guiarán en tu camino',
      color: theme.colors.secondary + '15',
      iconColor: theme.colors.secondary,
    },
    {
      icon: MessageCircle,
      title: 'Apoyo Emocional',
      description: 'Chat inteligente disponible 24/7 para acompañarte',
      color: theme.colors.success + '15',
      iconColor: theme.colors.success,
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

  // Estilos responsivos dinámicos
  const responsiveStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    themeButton: {
      position: 'absolute',
      top: isMobile ? 60 : 80,
      right: spacing.md,
      width: isMobile ? 44 : 52,
      height: isMobile ? 44 : 52,
      borderRadius: isMobile ? 22 : 26,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      backgroundColor: theme.colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    header: {
      alignItems: 'center',
      paddingTop: isMobile ? spacing.xl : spacing.xxl,
      paddingBottom: spacing.lg,
    },
    breathingContainer: {
      position: 'relative',
      marginBottom: spacing.lg,
    },
    welcomeText: {
      fontSize: fontSize.lg,
      fontFamily: 'Inter_600SemiBold',
      marginBottom: spacing.xs,
      color: theme.colors.textSecondary,
    },
    mainTitle: {
      fontSize: isMobile ? fontSize.display : fontSize.display + 8,
      fontFamily: 'Inter_700Bold',
      marginBottom: spacing.md,
      textAlign: 'center',
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_400Regular',
      textAlign: 'center',
      lineHeight: fontSize.md * 1.5,
      paddingHorizontal: spacing.md,
      color: theme.colors.textSecondary,
    },
    sectionTitle: {
      fontSize: fontSize.xl,
      fontFamily: 'Inter_600SemiBold',
      marginBottom: spacing.lg,
      textAlign: 'center',
      color: theme.colors.text,
    },
    moodSection: {
      marginBottom: spacing.xl,
    },
    moodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    featuresSection: {
      marginBottom: spacing.xl,
    },
    featureCard: {
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'center' : 'flex-start',
      padding: spacing.lg,
      borderRadius: 16,
      marginBottom: spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      textAlign: isMobile ? 'center' : 'left',
    },
    featureIcon: {
      width: isMobile ? 48 : 56,
      height: isMobile ? 48 : 56,
      borderRadius: isMobile ? 24 : 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isMobile ? 0 : spacing.md,
      marginBottom: isMobile ? spacing.sm : 0,
    },
    featureContent: {
      flex: 1,
      alignItems: isMobile ? 'center' : 'flex-start',
    },
    featureTitle: {
      fontSize: fontSize.lg,
      fontFamily: 'Inter_600SemiBold',
      marginBottom: spacing.xs,
      color: theme.colors.text,
      textAlign: isMobile ? 'center' : 'left',
    },
    featureDescription: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_400Regular',
      lineHeight: fontSize.sm * 1.4,
      color: theme.colors.textSecondary,
      textAlign: isMobile ? 'center' : 'left',
    },
    quoteCard: {
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    quoteText: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_400Regular',
      lineHeight: fontSize.md * 1.5,
      marginBottom: spacing.sm,
      fontStyle: 'italic',
      color: theme.colors.primary,
    },
    quoteAuthor: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_600SemiBold',
      textAlign: 'right',
      color: theme.colors.primary,
    },
    actionButtons: {
      gap: spacing.md,
      flexDirection: isTablet && orientation === 'landscape' ? 'row' : 'column',
    },
    primaryButton: {
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
      flex: isTablet && orientation === 'landscape' ? 1 : undefined,
    },
    gradientButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: isMobile ? 18 : 20,
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    primaryButtonText: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_600SemiBold',
      color: '#FFFFFF',
    },
    secondaryButton: {
      borderRadius: 16,
      paddingVertical: isMobile ? 18 : 20,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      borderWidth: 2,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      flex: isTablet && orientation === 'landscape' ? 1 : undefined,
    },
    secondaryButtonText: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.primary,
    },
  });

  const MoodChip = ({ mood, isSelected, onPress }: { 
    mood: typeof moods[0], 
    isSelected: boolean, 
    onPress: () => void 
  }) => (
    <EmotionChip
      emoji={mood.emoji}
      label={mood.label}
      selected={isSelected}
      onPress={onPress}
      backgroundColor={mood.color}
      textColor={mood.textColor}
    />
  );

  const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => (
    <Animated.View
      style={[
        responsiveStyles.featureCard,
        fadeInStyle,
        { backgroundColor: feature.color }
      ]}
    >
      <View style={[responsiveStyles.featureIcon, { backgroundColor: feature.iconColor + '20' }]}>
        <feature.icon size={isMobile ? 24 : 28} color={feature.iconColor} />
      </View>
      <View style={responsiveStyles.featureContent}>
        <Text style={responsiveStyles.featureTitle}>{feature.title}</Text>
        <Text style={responsiveStyles.featureDescription}>{feature.description}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={responsiveStyles.container}>
      {/* Fondo con gradiente sutil */}
      <LinearGradient
        colors={isDark 
          ? [theme.colors.background, theme.colors.surface, theme.colors.background]
          : [theme.colors.background, '#F3F4F6', theme.colors.background]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Botón de tema */}
      <TouchableOpacity
        style={responsiveStyles.themeButton}
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        {isDark ? (
          <Sun size={isMobile ? 20 : 24} color={theme.colors.accent} />
        ) : (
          <Moon size={isMobile ? 20 : 24} color={theme.colors.primary} />
        )}
      </TouchableOpacity>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={responsiveStyles.scrollContent}
        >
          <ResponsiveContainer maxWidth={{ mobile: '100%', tablet: 600, desktop: 800 }}>
            {/* Header con elemento de respiración */}
            <Animated.View style={[responsiveStyles.header, fadeInStyle]}>
              <Animated.View style={[responsiveStyles.breathingContainer, breathingStyle, floatingStyle]}>
                <BreathingCircle 
                  size={isMobile ? 100 : isTablet ? 120 : 140} 
                  color={theme.colors.primary}
                >
                  <Heart size={isMobile ? 28 : 32} color={theme.colors.primary} />
                </BreathingCircle>
                <View style={StyleSheet.absoluteFill}>
                  <Sparkles size={16} color={theme.colors.accent} style={{ position: 'absolute', top: 10, right: 15 }} />
                  <Sparkles size={12} color={theme.colors.secondary} style={{ position: 'absolute', bottom: 20, left: 10 }} />
                  <Sparkles size={14} color={theme.colors.success} style={{ position: 'absolute', top: 30, left: -5 }} />
                </View>
              </Animated.View>

              <Text style={responsiveStyles.welcomeText}>¡Bienvenido!</Text>
              <Text style={responsiveStyles.mainTitle}>CarreraGuía</Text>
              <Text style={responsiveStyles.subtitle}>
                Tu compañero inteligente para descubrir tu vocación y cuidar tu bienestar emocional
              </Text>
            </Animated.View>

            {/* Selector de estado emocional */}
            <Animated.View style={[responsiveStyles.moodSection, fadeInStyle]}>
              <Text style={responsiveStyles.sectionTitle}>¿Cómo te sientes hoy?</Text>
              <View style={responsiveStyles.moodGrid}>
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

            {/* Características principales */}
            <Animated.View style={[responsiveStyles.featuresSection, fadeInStyle]}>
              <Text style={responsiveStyles.sectionTitle}>¿Qué puedes hacer?</Text>
              {features.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </Animated.View>

            {/* Frase inspiracional */}
            <Animated.View style={[responsiveStyles.quoteCard, fadeInStyle]}>
              <Text style={responsiveStyles.quoteText}>
                "{inspirationalQuotes[currentQuote].text}"
              </Text>
              <Text style={responsiveStyles.quoteAuthor}>
                - {inspirationalQuotes[currentQuote].author}
              </Text>
            </Animated.View>

            {/* Botones de acción */}
            <Animated.View style={[responsiveStyles.actionButtons, fadeInStyle]}>
              <TouchableOpacity
                style={responsiveStyles.primaryButton}
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={theme.colors.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={responsiveStyles.gradientButton}
                >
                  <Text style={responsiveStyles.primaryButtonText}>Comenzar mi viaje</Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={responsiveStyles.secondaryButton}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.7}
              >
                <Text style={responsiveStyles.secondaryButtonText}>Ya tengo cuenta</Text>
              </TouchableOpacity>
            </Animated.View>
          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}