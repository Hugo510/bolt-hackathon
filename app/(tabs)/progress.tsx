import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Award, Target, Calendar, BarChart3 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserProgressStore } from '@/stores/userProgressStore';
import { useResponsive, useResponsiveSpacing, useResponsiveFontSize } from '@/hooks/useResponsive';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';
import FadeInView from '@/components/animations/FadeInView';
import ScaleInView from '@/components/animations/ScaleInView';
import StaggeredList from '@/components/animations/StaggeredList';
import AnimatedBadge from '@/components/graphics/AnimatedBadge';
import EmotionalChart from '@/components/graphics/EmotionalChart';
import ProgressRing from '@/components/graphics/ProgressRing';
import MoodFace from '@/components/graphics/MoodFace';
import VictoryChartComponent from '@/components/graphics/VictoryChart';
import ProgressIndicator from '@/components/ui/ProgressIndicator';
import BadgeDisplay from '@/components/ui/BadgeDisplay';

export default function ProgressScreen() {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fontSize = useResponsiveFontSize();
  
  const {
    currentLevel,
    experiencePoints,
    testsCompleted,
    sessionsAttended,
    resourcesConsumed,
    streakDays,
    badgesEarned,
    getProgressToNextLevel,
  } = useUserProgressStore();

  const [selectedChart, setSelectedChart] = useState<'emotional' | 'activity'>('emotional');

  // Datos de ejemplo para los gráficos
  const emotionalData = [
    { emotion: 'Feliz', value: 8, color: '#10B981', date: '2024-01-01' },
    { emotion: 'Ansioso', value: 4, color: '#F59E0B', date: '2024-01-02' },
    { emotion: 'Motivado', value: 9, color: '#6366F1', date: '2024-01-03' },
    { emotion: 'Tranquilo', value: 7, color: '#3B82F6', date: '2024-01-04' },
    { emotion: 'Curioso', value: 8, color: '#8B5CF6', date: '2024-01-05' },
  ];

  const activityData = [
    { x: 'Lun', y: 3 },
    { x: 'Mar', y: 5 },
    { x: 'Mié', y: 2 },
    { x: 'Jue', y: 8 },
    { x: 'Vie', y: 6 },
    { x: 'Sáb', y: 4 },
    { x: 'Dom', y: 7 },
  ];

  const stats = [
    {
      title: 'Tests Completados',
      value: testsCompleted,
      icon: Target,
      color: theme.colors.primary,
      progress: testsCompleted / 10, // Máximo 10 tests
    },
    {
      title: 'Sesiones de Mentoría',
      value: sessionsAttended,
      icon: Calendar,
      color: theme.colors.secondary,
      progress: sessionsAttended / 20, // Máximo 20 sesiones
    },
    {
      title: 'Recursos Consumidos',
      value: resourcesConsumed,
      icon: BarChart3,
      color: theme.colors.success,
      progress: resourcesConsumed / 50, // Máximo 50 recursos
    },
  ];

  const responsiveStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingVertical: spacing.lg,
      alignItems: 'center',
    },
    title: {
      fontSize: isMobile ? fontSize.xxl : fontSize.display,
      fontFamily: 'Inter_700Bold',
      color: theme.colors.text,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    levelSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      alignItems: 'center',
    },
    levelTitle: {
      fontSize: fontSize.lg,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      marginBottom: spacing.md,
    },
    experienceText: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      marginTop: spacing.sm,
    },
    statsGrid: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      alignItems: 'center',
    },
    statIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    statValue: {
      fontSize: fontSize.xl,
      fontFamily: 'Inter_700Bold',
      color: theme.colors.text,
      marginBottom: spacing.xs,
    },
    statTitle: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_500Medium',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    chartSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    chartTabs: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 4,
    },
    chartTab: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 8,
      alignItems: 'center',
    },
    chartTabActive: {
      backgroundColor: theme.colors.primary,
    },
    chartTabText: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_500Medium',
      color: theme.colors.textSecondary,
    },
    chartTabTextActive: {
      color: '#FFFFFF',
    },
    moodSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      alignItems: 'center',
    },
    moodTitle: {
      fontSize: fontSize.lg,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      marginBottom: spacing.md,
    },
    moodFaces: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: spacing.md,
    },
    moodFaceContainer: {
      alignItems: 'center',
    },
    moodLabel: {
      fontSize: fontSize.xs,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      marginTop: spacing.xs,
    },
  });

  return (
    <SafeAreaView style={responsiveStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ResponsiveContainer>
          {/* Header */}
          <FadeInView delay={0}>
            <View style={responsiveStyles.header}>
              <Text style={responsiveStyles.title}>Tu Progreso</Text>
              <Text style={responsiveStyles.subtitle}>
                Visualiza tu crecimiento y logros
              </Text>
            </View>
          </FadeInView>

          {/* Nivel y Experiencia */}
          <ScaleInView delay={200}>
            <View style={responsiveStyles.levelSection}>
              <Text style={responsiveStyles.levelTitle}>Nivel {currentLevel}</Text>
              <ProgressRing
                progress={getProgressToNextLevel()}
                size={120}
                colors={[theme.colors.primary, theme.colors.secondary]}
              >
                <TrendingUp size={32} color={theme.colors.primary} />
              </ProgressRing>
              <Text style={responsiveStyles.experienceText}>
                {experiencePoints} XP total
              </Text>
            </View>
          </ScaleInView>

          {/* Estadísticas */}
          <FadeInView delay={400}>
            <View style={responsiveStyles.statsGrid}>
              <StaggeredList staggerDelay={100} initialDelay={600}>
                {stats.map((stat, index) => (
                  <View key={index} style={responsiveStyles.statCard}>
                    <View style={[responsiveStyles.statIcon, { backgroundColor: stat.color + '20' }]}>
                      <stat.icon size={24} color={stat.color} />
                    </View>
                    <Text style={responsiveStyles.statValue}>{stat.value}</Text>
                    <Text style={responsiveStyles.statTitle}>{stat.title}</Text>
                    <ProgressRing
                      progress={stat.progress}
                      size={60}
                      strokeWidth={4}
                      colors={[stat.color]}
                      showPercentage={false}
                    />
                  </View>
                ))}
              </StaggeredList>
            </View>
          </FadeInView>

          {/* Gráficos */}
          <SlideInView delay={800} direction="up">
            <View style={responsiveStyles.chartSection}>
              <View style={responsiveStyles.chartTabs}>
                <TouchableOpacity
                  style={[
                    responsiveStyles.chartTab,
                    selectedChart === 'emotional' && responsiveStyles.chartTabActive,
                  ]}
                  onPress={() => setSelectedChart('emotional')}
                >
                  <Text
                    style={[
                      responsiveStyles.chartTabText,
                      selectedChart === 'emotional' && responsiveStyles.chartTabTextActive,
                    ]}
                  >
                    Emocional
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    responsiveStyles.chartTab,
                    selectedChart === 'activity' && responsiveStyles.chartTabActive,
                  ]}
                  onPress={() => setSelectedChart('activity')}
                >
                  <Text
                    style={[
                      responsiveStyles.chartTabText,
                      selectedChart === 'activity' && responsiveStyles.chartTabTextActive,
                    ]}
                  >
                    Actividad
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedChart === 'emotional' ? (
                <EmotionalChart data={emotionalData} animated />
              ) : (
                <VictoryChartComponent
                  data={activityData}
                  title="Actividad Semanal"
                  type="area"
                  color={theme.colors.primary}
                />
              )}
            </View>
          </SlideInView>

          {/* Estados de Ánimo */}
          <FadeInView delay={1000}>
            <View style={responsiveStyles.moodSection}>
              <Text style={responsiveStyles.moodTitle}>Estados de Ánimo Recientes</Text>
              <View style={responsiveStyles.moodFaces}>
                <StaggeredList staggerDelay={150} initialDelay={1200}>
                  <View style={responsiveStyles.moodFaceContainer}>
                    <MoodFace mood="happy" size={60} animated />
                    <Text style={responsiveStyles.moodLabel}>Ayer</Text>
                  </View>
                  <View style={responsiveStyles.moodFaceContainer}>
                    <MoodFace mood="excited" size={60} animated />
                    <Text style={responsiveStyles.moodLabel}>Hoy</Text>
                  </View>
                  <View style={responsiveStyles.moodFaceContainer}>
                    <MoodFace mood="neutral" size={60} animated />
                    <Text style={responsiveStyles.moodLabel}>Promedio</Text>
                  </View>
                </StaggeredList>
              </View>
            </View>
          </FadeInView>

          {/* Insignias */}
          <FadeInView delay={1200}>
            <BadgeDisplay showAll />
          </FadeInView>

          {/* Insignias Animadas */}
          <ScaleInView delay={1400}>
            <View style={responsiveStyles.moodSection}>
              <Text style={responsiveStyles.moodTitle}>Logros Destacados</Text>
              <View style={responsiveStyles.moodFaces}>
                <StaggeredList staggerDelay={200} initialDelay={1600}>
                  <AnimatedBadge
                    type="star"
                    size={80}
                    color="#FFD700"
                    animated
                    glowing
                    title="Estrella"
                  />
                  <AnimatedBadge
                    type="trophy"
                    size={80}
                    color="#FF6B6B"
                    animated
                    title="Campeón"
                  />
                  <AnimatedBadge
                    type="crown"
                    size={80}
                    color="#8B5CF6"
                    animated
                    glowing
                    title="Rey/Reina"
                  />
                </StaggeredList>
              </View>
            </View>
          </ScaleInView>

          {/* Indicador de Progreso Detallado */}
          <FadeInView delay={1800}>
            <ProgressIndicator size="lg" animated />
          </FadeInView>
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}