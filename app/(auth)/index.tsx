import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsive, useResponsiveSpacing, useResponsiveFontSize } from '@/hooks/useResponsive';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';
import AnimatedButton from '@/components/ui/AnimatedButton';
import FadeInView from '@/components/animations/FadeInView';
import EmotionChip from '@/components/ui/EmotionChip';
import ScaleInView from '@/components/animations/ScaleInView';
import StaggeredList from '@/components/animations/StaggeredList';
import SlideInView from '@/components/animations/SlideInView';
import PulseView from '@/components/animations/PulseView';
import { Heart, Brain, Users, MessageCircle, ArrowRight, Moon, Sun, Sparkles, Star } from 'lucide-react-native';
import BoltBadge from '@/components/ui/BoltBadge';

export default function AuthIndex() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { isMobile, isTablet, width, height, orientation } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fontSize = useResponsiveFontSize();

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
    sparkleContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
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
    <FadeInView
      delay={600 + index * 200}
      direction="up"
    >
      <View style={[responsiveStyles.featureCard, { backgroundColor: feature.color }]}>
        <ScaleInView delay={800 + index * 200}>
          <View style={[responsiveStyles.featureIcon, { backgroundColor: feature.iconColor + '20' }]}>
            <feature.icon size={isMobile ? 24 : 28} color={feature.iconColor} />
          </View>
        </ScaleInView>
        <View style={responsiveStyles.featureContent}>
          <Text style={responsiveStyles.featureTitle}>{feature.title}</Text>
          <Text style={responsiveStyles.featureDescription}>{feature.description}</Text>
        </View>
      </View>
    </FadeInView>
  );

  const handleThemeToggle = () => {
    console.log('🔴 BOTÓN PRESIONADO - handleThemeToggle ejecutado');
    console.log('🔴 Estado actual - isDark:', isDark);

    toggleTheme().then(() => {
      console.log('🔴 toggleTheme completado');
    }).catch((error) => {
      console.error('🔴 Error en toggleTheme:', error);
    });
  };

  const handleMoodPress = (mood: string) => {
    try {
      setSelectedMood(selectedMood === mood ? null : mood);
    } catch (error) {
      console.error('Error al seleccionar mood:', error);
    }
  };

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
        style={[
          {
            position: 'absolute',
            top: isMobile ? 60 : 80,
            right: spacing.md,
            width: isMobile ? 44 : 52,
            height: isMobile ? 44 : 52,
            borderRadius: isMobile ? 22 : 26,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 8,
          }
        ]}
        onPress={handleThemeToggle}
        onPressIn={() => console.log('🔴 onPressIn ejecutado')}
        onPressOut={() => console.log('🔴 onPressOut ejecutado')}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        accessibilityHint="Toca para alternar entre tema claro y oscuro"
      >
        {isDark ? (
          <Sun size={isMobile ? 20 : 24} color={theme.colors.warning} />
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
            <FadeInView delay={200} direction="down">
              <View style={responsiveStyles.header}>
                <View style={responsiveStyles.breathingContainer}>
                  <PulseView duration={3000} minScale={1} maxScale={1.05}>
                    <View style={{
                      width: isMobile ? 100 : isTablet ? 120 : 140,
                      height: isMobile ? 100 : isTablet ? 120 : 140,
                      borderRadius: (isMobile ? 100 : isTablet ? 120 : 140) / 2,
                      backgroundColor: theme.colors.primary + '20',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Heart size={isMobile ? 28 : 32} color={theme.colors.primary} />
                    </View>
                  </PulseView>

                  <View style={responsiveStyles.sparkleContainer}>
                    <ScaleInView delay={800} bounce={true}>
                      <Sparkles
                        size={16}
                        color={theme.colors.accent}
                        style={{ position: 'absolute', top: 10, right: 15 }}
                      />
                    </ScaleInView>
                    <ScaleInView delay={1000} bounce={true}>
                      <Sparkles
                        size={12}
                        color={theme.colors.secondary}
                        style={{ position: 'absolute', bottom: 20, left: 10 }}
                      />
                    </ScaleInView>
                    <ScaleInView delay={1200} bounce={true}>
                      <Sparkles
                        size={14}
                        color={theme.colors.success}
                        style={{ position: 'absolute', top: 30, left: -5 }}
                      />
                    </ScaleInView>
                  </View>
                </View>

                <FadeInView delay={400} direction="up">
                  <Text style={responsiveStyles.welcomeText}>¡Bienvenido!</Text>
                </FadeInView>

                <FadeInView delay={500} direction="up">
                  <Text style={responsiveStyles.mainTitle}>CarreraGuía</Text>
                </FadeInView>

                <FadeInView delay={600} direction="up">
                  <Text style={responsiveStyles.subtitle}>
                    Tu compañero inteligente para descubrir tu vocación y cuidar tu bienestar emocional
                  </Text>
                </FadeInView>
              </View>
            </FadeInView>

            {/* Selector de estado emocional */}
            <FadeInView delay={800} direction="up">
              <View style={responsiveStyles.moodSection}>
                <Text style={responsiveStyles.sectionTitle}>¿Cómo te sientes hoy?</Text>
                <View style={responsiveStyles.moodGrid}>
                  <StaggeredList staggerDelay={100} initialDelay={1000}>
                    {moods.map((mood, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleMoodPress(mood.label)}
                        style={[
                          {
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            borderRadius: 20,
                            backgroundColor: selectedMood === mood.label ? mood.color : theme.colors.surface,
                            borderWidth: selectedMood === mood.label ? 2 : 1,
                            borderColor: selectedMood === mood.label ? mood.textColor : theme.colors.border,
                            marginRight: spacing.sm,
                            marginBottom: spacing.sm,
                          }
                        ]}
                      >
                        <Text style={{ fontSize: 20, marginRight: spacing.xs }}>{mood.emoji}</Text>
                        <Text style={{
                          fontSize: fontSize.sm,
                          fontFamily: 'Inter_500Medium',
                          color: selectedMood === mood.label ? mood.textColor : theme.colors.text,
                        }}>
                          {mood.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </StaggeredList>
                </View>
              </View>
            </FadeInView>

            {/* Características principales */}
            <FadeInView delay={1200} direction="up">
              <View style={responsiveStyles.featuresSection}>
                <Text style={responsiveStyles.sectionTitle}>¿Qué puedes hacer?</Text>
                {features.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} index={index} />
                ))}
              </View>
            </FadeInView>

            {/* Frase inspiracional */}
            <SlideInView delay={1800} direction="left">
              <View style={responsiveStyles.quoteCard}>
                <ScaleInView delay={2000}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                    <Star size={20} color={theme.colors.primary} />
                    <Text style={[responsiveStyles.quoteText, { marginLeft: 8, marginBottom: 0, fontStyle: 'normal', fontWeight: '600' }]}>
                      Inspiración del día
                    </Text>
                  </View>
                </ScaleInView>

                <FadeInView delay={2200}>
                  <Text style={responsiveStyles.quoteText}>
                    "{inspirationalQuotes[currentQuote].text}"
                  </Text>
                  <Text style={responsiveStyles.quoteAuthor}>
                    - {inspirationalQuotes[currentQuote].author}
                  </Text>
                </FadeInView>
              </View>
            </SlideInView>

            {/* Botones de acción */}
            <View style={responsiveStyles.actionButtons}>
              <SlideInView delay={2400} direction="up">
                <AnimatedButton
                  title="Comenzar mi viaje"
                  onPress={() => router.push('/(auth)/register')}
                  variant="gradient"
                  size="lg"
                  icon={<ArrowRight size={20} color="#FFFFFF" />}
                />
              </SlideInView>

              <SlideInView delay={2600} direction="up">
                <AnimatedButton
                  title="Ya tengo cuenta"
                  onPress={() => router.push('/(auth)/login')}
                  variant="secondary"
                  size="lg"
                />
              </SlideInView>
            </View>
          </ResponsiveContainer>
        </ScrollView>
        
        {/* Built with Bolt.new badge */}
        <BoltBadge position="bottom-right" size="medium" />
      </SafeAreaView>
    </View>
  );
}