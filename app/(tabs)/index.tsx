import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brain, Users, MessageCircle, BookOpen, Star, TrendingUp, Calendar, Award } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsive, useResponsiveSpacing, useResponsiveFontSize } from '@/hooks/useResponsive';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';
import ResponsiveGrid from '@/components/ui/ResponsiveGrid';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import FadeInView from '@/components/animations/FadeInView';
import ScaleInView from '@/components/animations/ScaleInView';
import StaggeredList from '@/components/animations/StaggeredList';
import SlideInView from '@/components/animations/SlideInView';
import ProgressBar from '@/components/animations/ProgressBar';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PulseView from '@/components/animations/PulseView';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { session, user, loading } = useAuth();
  const { isMobile, isTablet, width } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fontSize = useResponsiveFontSize();

  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Estilos responsivos dinámicos
  const responsiveStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      paddingVertical: spacing.lg,
      gap: isMobile ? spacing.sm : 0,
    },
    headerText: {
      flex: 1,
    },
    greeting: {
      fontSize: isMobile ? fontSize.xl : fontSize.xxl,
      fontFamily: 'Inter_700Bold',
      color: theme.colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
    },
    profileContainer: {
      width: isMobile ? 48 : 56,
      height: isMobile ? 48 : 56,
      borderRadius: isMobile ? 24 : 28,
      overflow: 'hidden',
      marginTop: isMobile ? spacing.sm : 0,
    },
    moodSection: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      marginBottom: spacing.md,
    },
    moodContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      justifyContent: isMobile ? 'flex-start' : 'center',
    },
    progressCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    progressTitle: {
      fontSize: fontSize.lg,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
    },
    progressSubtitle: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      marginTop: spacing.xs,
    },
    levelBadge: {
      width: isMobile ? 40 : 48,
      height: isMobile ? 40 : 48,
      borderRadius: isMobile ? 20 : 24,
      backgroundColor: '#E0E7FF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing.md,
    },
    stat: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: fontSize.xl,
      fontFamily: 'Inter_700Bold',
      color: theme.colors.text,
    },
    statLabel: {
      fontSize: fontSize.xs,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      marginTop: spacing.xs,
    },
    actionsSection: {
      marginBottom: spacing.xl,
    },
    actionCard: {
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'center' : 'flex-start',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      textAlign: isMobile ? 'center' : 'left',
    },
    actionIcon: {
      width: isMobile ? 48 : 56,
      height: isMobile ? 48 : 56,
      borderRadius: isMobile ? 24 : 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isMobile ? 0 : spacing.md,
      marginBottom: isMobile ? spacing.sm : 0,
    },
    actionContent: {
      flex: 1,
      alignItems: isMobile ? 'center' : 'flex-start',
    },
    actionTitle: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      marginBottom: spacing.xs,
      textAlign: isMobile ? 'center' : 'left',
    },
    actionSubtitle: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      textAlign: isMobile ? 'center' : 'left',
    },
    inspirationCard: {
      backgroundColor: '#FEF3C7',
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    inspirationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    inspirationTitle: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_600SemiBold',
      color: '#92400E',
      marginLeft: spacing.sm,
    },
    inspirationText: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_400Regular',
      color: '#92400E',
      lineHeight: fontSize.md * 1.5,
      marginBottom: spacing.sm,
    },
    inspirationAuthor: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_500Medium',
      color: '#92400E',
      textAlign: 'right',
    },
  });

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <SafeAreaView style={[responsiveStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={responsiveStyles.greeting}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  // Si llegamos aquí, el usuario está autenticado (el layout se encarga de la redirección)
  console.log('✅ Renderizando home screen para usuario autenticado:', user?.email);

  const quickActions = [
    {
      id: 1,
      title: 'Test Vocacional',
      subtitle: 'Descubre tu carrera ideal',
      icon: Brain,
      color: '#E0E7FF',
      iconColor: '#6366F1',
      route: '/(tabs)/test',
    },
    {
      id: 2,
      title: 'Hablar con Mentor',
      subtitle: 'Conecta con profesionales',
      icon: Users,
      color: '#DBEAFE',
      iconColor: '#3B82F6',
      route: '/(tabs)/mentors',
    },
    {
      id: 3,
      title: 'Apoyo Emocional',
      subtitle: 'Chat con IA especializada',
      icon: MessageCircle,
      color: '#D1FAE5',
      iconColor: '#10B981',
      route: '/(tabs)/chat',
    },
  ];

  const moods = [
    { emoji: '😊', label: 'Feliz', color: '#10B981' },
    { emoji: '😌', label: 'Tranquilo', color: '#3B82F6' },
    { emoji: '🤔', label: 'Pensativo', color: '#8B5CF6' },
    { emoji: '😟', label: 'Preocupado', color: '#F59E0B' },
    { emoji: '😴', label: 'Cansado', color: '#6B7280' },
  ];

  const handleActionPress = (route: string) => {
    try {
      console.log('🔄 Navegando a:', route);
      router.push(route as any);
    } catch (error) {
      console.error('❌ Error navegando:', error);
      console.log('⚠️ Ruta no implementada:', route);
    }
  };

  const handleMoodPress = (mood: string) => {
    try {
      setSelectedMood(selectedMood === mood ? null : mood);
    } catch (error) {
      console.error('Error al seleccionar mood:', error);
    }
  };

  return (
    <SafeAreaView style={responsiveStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ResponsiveContainer>
          {/* Header */}
          <FadeInView delay={0}>
            <View style={responsiveStyles.header}>
              <View style={responsiveStyles.headerText}>
                <Text style={responsiveStyles.greeting}>¡Hola{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋</Text>
                <Text style={responsiveStyles.subtitle}>¿Cómo te sientes hoy?</Text>
              </View>
              <ScaleInView delay={200}>
                <PulseView duration={3000}>
                  <View style={responsiveStyles.profileContainer}>
                    <ResponsiveImage
                      source={{ uri: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' }}
                      aspectRatio={1}
                      borderRadius={isMobile ? 24 : 28}
                    />
                  </View>
                </PulseView>
              </ScaleInView>
            </View>
          </FadeInView>

          {/* Mood Tracker */}
          <FadeInView delay={300}>
            <View style={responsiveStyles.moodSection}>
              <Text style={responsiveStyles.sectionTitle}>¿Cómo te sientes?</Text>
              <View style={responsiveStyles.moodContainer}>
                <StaggeredList staggerDelay={100} initialDelay={400}>
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
                          backgroundColor: selectedMood === mood.label ? mood.color + '30' : theme.colors.surface,
                          borderWidth: selectedMood === mood.label ? 2 : 1,
                          borderColor: selectedMood === mood.label ? mood.color : theme.colors.border,
                          marginRight: spacing.sm,
                          marginBottom: spacing.sm,
                        }
                      ]}
                    >
                      <Text style={{ fontSize: 20, marginRight: spacing.xs }}>{mood.emoji}</Text>
                      <Text style={{
                        fontSize: fontSize.sm,
                        fontFamily: 'Inter_500Medium',
                        color: selectedMood === mood.label ? mood.color : theme.colors.text,
                      }}>
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </StaggeredList>
              </View>
            </View>
          </FadeInView>

          {/* Progress Card */}
          <SlideInView delay={800} direction="up">
            <View style={responsiveStyles.progressCard}>
              <View style={responsiveStyles.progressHeader}>
                <View>
                  <Text style={responsiveStyles.progressTitle}>Tu Progreso</Text>
                  <Text style={responsiveStyles.progressSubtitle}>Nivel 3 • 750/1000 XP</Text>
                </View>
                <ScaleInView delay={1000}>
                  <View style={responsiveStyles.levelBadge}>
                    <TrendingUp size={isMobile ? 20 : 24} color="#6366F1" />
                  </View>
                </ScaleInView>
              </View>
              <ProgressBar progress={0.75} delay={1200} />
              <View style={responsiveStyles.statsContainer}>
                <StaggeredList staggerDelay={100} initialDelay={1400}>
                  <View style={responsiveStyles.stat}>
                    <Text style={responsiveStyles.statNumber}>3</Text>
                    <Text style={responsiveStyles.statLabel}>Tests</Text>
                  </View>
                  <View style={responsiveStyles.stat}>
                    <Text style={responsiveStyles.statNumber}>12</Text>
                    <Text style={responsiveStyles.statLabel}>Sesiones</Text>
                  </View>
                  <View style={responsiveStyles.stat}>
                    <Text style={responsiveStyles.statNumber}>7</Text>
                    <Text style={responsiveStyles.statLabel}>Días</Text>
                  </View>
                </StaggeredList>
              </View>
            </View>
          </SlideInView>

          {/* Quick Actions */}
          <FadeInView delay={1600}>
            <View style={responsiveStyles.actionsSection}>
              <Text style={responsiveStyles.sectionTitle}>Acciones Rápidas</Text>
              <ResponsiveGrid
                columns={{ mobile: 1, tablet: 2, desktop: 3 }}
                gap={spacing.md}
              >
                <StaggeredList staggerDelay={150} initialDelay={1800}>
                  {quickActions.map((action) => (
                    <TouchableOpacity
                      key={action.id}
                      onPress={() => handleActionPress(action.route)}
                      activeOpacity={0.7}
                    >
                      <View style={responsiveStyles.actionCard}>
                        <ScaleInView delay={2000 + action.id * 100}>
                          <View style={[responsiveStyles.actionIcon, { backgroundColor: action.color }]}>
                            <action.icon size={isMobile ? 24 : 28} color={action.iconColor} />
                          </View>
                        </ScaleInView>
                        <View style={responsiveStyles.actionContent}>
                          <Text style={responsiveStyles.actionTitle}>{action.title}</Text>
                          <Text style={responsiveStyles.actionSubtitle}>{action.subtitle}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </StaggeredList>
              </ResponsiveGrid>
            </View>
          </FadeInView>

          {/* Daily Inspiration */}
          <SlideInView delay={2400} direction="left">
            <View style={responsiveStyles.inspirationCard}>
              <ScaleInView delay={2600}>
                <View style={responsiveStyles.inspirationHeader}>
                  <Star size={20} color="#F59E0B" />
                  <Text style={responsiveStyles.inspirationTitle}>Inspiración del día</Text>
                </View>
              </ScaleInView>

              <FadeInView delay={2800}>
                <Text style={responsiveStyles.inspirationText}>
                  "El futuro pertenece a quienes creen en la belleza de sus sueños."
                </Text>
                <Text style={responsiveStyles.inspirationAuthor}>- Eleanor Roosevelt</Text>
              </FadeInView>
            </View>
          </SlideInView>
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}