import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Calendar, Filter, TrendingUp, ArrowUp, ArrowDown, Sparkles, Brain, MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive, useResponsiveSpacing, useResponsiveFontSize } from '@/hooks/useResponsive';
import { useEmotionalLogs, useEmotionalInsights } from '@/hooks/useEmotionalLogs';
import { useChatMessages } from '@/hooks/useChatMessages';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';
import FadeInView from '@/components/animations/FadeInView';
import ScaleInView from '@/components/animations/ScaleInView';
import StaggeredList from '@/components/animations/StaggeredList';
import SlideInView from '@/components/animations/SlideInView';
import EmotionalChart from '@/components/graphics/EmotionalChart';
import MoodFace from '@/components/graphics/MoodFace';
import AnimatedButton from '@/components/ui/AnimatedButton';
import EmotionChip from '@/components/ui/EmotionChip';

type TimeRange = 'week' | 'month' | 'quarter';
type EmotionCategory = 'all' | 'positive' | 'negative' | 'neutral';

export default function EmotionalJourneyScreen() {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fontSize = useResponsiveFontSize();
  
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [emotionCategory, setEmotionCategory] = useState<EmotionCategory>('all');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  
  const { data: emotionalLogs, isLoading: logsLoading } = useEmotionalLogs();
  const { data: emotionalInsights, isLoading: insightsLoading } = useEmotionalInsights(timeRange);
  const { data: chatMessages } = useChatMessages();
  
  const isLoading = logsLoading || insightsLoading;

  // Prepare data for chart
  const getChartData = () => {
    if (!emotionalInsights) return [];
    
    let filteredTrends = [...emotionalInsights.recentTrend];
    
    // Filter by emotion category
    if (emotionCategory !== 'all') {
      const positiveEmotions = ['felicidad', 'motivación', 'tranquilidad', 'gratitud', 'esperanza'];
      const negativeEmotions = ['ansiedad', 'tristeza', 'miedo', 'frustración', 'enojo', 'preocupación'];
      const neutralEmotions = ['curiosidad', 'sorpresa', 'confusión', 'calma'];
      
      const categoryMap = {
        'positive': positiveEmotions,
        'negative': negativeEmotions,
        'neutral': neutralEmotions
      };
      
      filteredTrends = filteredTrends.filter(trend => 
        categoryMap[emotionCategory].includes(trend.emotion.toLowerCase())
      );
    }
    
    // Filter by selected emotion
    if (selectedEmotion) {
      filteredTrends = filteredTrends.filter(trend => 
        trend.emotion.toLowerCase() === selectedEmotion.toLowerCase()
      );
    }
    
    return filteredTrends.map(trend => ({
      emotion: trend.emotion,
      value: trend.intensity,
      color: getEmotionColor(trend.emotion),
      date: new Date(trend.date).toLocaleDateString()
    }));
  };
  
  const getEmotionColor = (emotion: string) => {
    const emotionColors: Record<string, string> = {
      'felicidad': '#10B981', // green
      'motivación': '#6366F1', // indigo
      'tranquilidad': '#3B82F6', // blue
      'ansiedad': '#F59E0B', // amber
      'tristeza': '#6B7280', // gray
      'miedo': '#EF4444', // red
      'frustración': '#EC4899', // pink
      'gratitud': '#8B5CF6', // purple
      'curiosidad': '#0EA5E9', // sky
      'esperanza': '#14B8A6', // teal
      'preocupación': '#F97316', // orange
      'calma': '#0D9488', // teal
      'confusión': '#A855F7', // purple
      'enojo': '#DC2626', // red
    };
    
    return emotionColors[emotion.toLowerCase()] || '#6B7280';
  };
  
  const getMoodTrend = () => {
    if (!emotionalInsights || !emotionalInsights.patterns || emotionalInsights.patterns.length === 0) {
      return 'stable';
    }
    
    const trendCounts = emotionalInsights.patterns.reduce((acc, pattern) => {
      acc[pattern.trend] = (acc[pattern.trend] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const maxTrend = Object.entries(trendCounts).sort((a, b) => b[1] - a[1])[0][0];
    return maxTrend;
  };
  
  const getEmotionMood = (emotion: string) => {
    const positiveEmotions = ['felicidad', 'motivación', 'tranquilidad', 'gratitud', 'esperanza'];
    const negativeEmotions = ['ansiedad', 'tristeza', 'miedo', 'frustración', 'enojo', 'preocupación'];
    
    if (positiveEmotions.includes(emotion.toLowerCase())) return 'happy';
    if (negativeEmotions.includes(emotion.toLowerCase())) return 'sad';
    return 'neutral';
  };
  
  const getOverallMood = () => {
    if (!emotionalInsights || !emotionalInsights.topEmotions || emotionalInsights.topEmotions.length === 0) {
      return 'neutral';
    }
    
    const topEmotion = emotionalInsights.topEmotions[0].emotion;
    return getEmotionMood(topEmotion);
  };
  
  const getTrendIcon = () => {
    const trend = getMoodTrend();
    if (trend === 'improving') return <ArrowUp size={20} color={theme.colors.success} />;
    if (trend === 'declining') return <ArrowDown size={20} color={theme.colors.error} />;
    return <TrendingUp size={20} color={theme.colors.primary} />;
  };
  
  const getTrendText = () => {
    const trend = getMoodTrend();
    if (trend === 'improving') return 'Mejorando';
    if (trend === 'declining') return 'Necesita atención';
    return 'Estable';
  };
  
  const getTrendColor = () => {
    const trend = getMoodTrend();
    if (trend === 'improving') return theme.colors.success;
    if (trend === 'declining') return theme.colors.error;
    return theme.colors.primary;
  };
  
  const getEmotionsList = () => {
    if (!emotionalInsights || !emotionalInsights.topEmotions) return [];
    
    return emotionalInsights.topEmotions.map(emotion => ({
      name: emotion.emotion,
      count: emotion.count,
      color: getEmotionColor(emotion.emotion)
    }));
  };
  
  const getRecommendations = () => {
    if (!emotionalInsights || !emotionalInsights.recommendations) {
      return [
        'Registra tus emociones diariamente para obtener recomendaciones personalizadas',
        'Completa tests vocacionales para entender mejor tus intereses',
        'Conecta con mentores para recibir orientación profesional'
      ];
    }
    
    return emotionalInsights.recommendations.length > 0 
      ? emotionalInsights.recommendations 
      : [
          'Continúa registrando tus emociones para obtener insights más precisos',
          'Explora diferentes carreras para ampliar tus opciones',
          'Practica técnicas de manejo emocional regularmente'
        ];
  };
  
  const getEmotionalPatterns = () => {
    if (!emotionalInsights || !emotionalInsights.patterns) return [];
    return emotionalInsights.patterns;
  };
  
  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'week': return 'Última semana';
      case 'month': return 'Último mes';
      case 'quarter': return 'Último trimestre';
      default: return 'Último mes';
    }
  };
  
  const styles = StyleSheet.create({
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
    filtersContainer: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      marginBottom: spacing.lg,
      gap: spacing.md,
    },
    filterGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    filterLabel: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.textSecondary,
      marginRight: spacing.xs,
      alignSelf: 'center',
    },
    filterButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterButtonText: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_500Medium',
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    summaryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    summaryTitle: {
      fontSize: fontSize.lg,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
    },
    summaryTrend: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '10',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
    },
    summaryTrendText: {
      fontSize: fontSize.xs,
      fontFamily: 'Inter_500Medium',
      marginLeft: spacing.xs,
    },
    summaryStats: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    statItem: {
      flex: 1,
      alignItems: isMobile ? 'flex-start' : 'center',
      marginBottom: isMobile ? spacing.md : 0,
    },
    statValue: {
      fontSize: fontSize.xl,
      fontFamily: 'Inter_700Bold',
      color: theme.colors.text,
      marginBottom: spacing.xs,
    },
    statLabel: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
    },
    moodFacesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    moodFaceItem: {
      alignItems: 'center',
    },
    moodLabel: {
      fontSize: fontSize.xs,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      marginTop: spacing.xs,
    },
    chartCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    chartTitle: {
      fontSize: fontSize.lg,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      marginBottom: spacing.md,
    },
    emotionsListCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    emotionsListTitle: {
      fontSize: fontSize.lg,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      marginBottom: spacing.md,
    },
    emotionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    emotionName: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_500Medium',
      color: theme.colors.text,
    },
    emotionCount: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.textSecondary,
    },
    emotionDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: spacing.sm,
    },
    emotionRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    patternsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    patternsTitle: {
      fontSize: fontSize.lg,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      marginBottom: spacing.md,
    },
    patternItem: {
      marginBottom: spacing.md,
      padding: spacing.md,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderLeftWidth: 4,
    },
    patternHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    patternEmotion: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
    },
    patternStats: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    patternStat: {
      fontSize: fontSize.xs,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
    },
    patternTriggers: {
      marginTop: spacing.xs,
    },
    patternTriggerTitle: {
      fontSize: fontSize.xs,
      fontFamily: 'Inter_500Medium',
      color: theme.colors.textSecondary,
      marginBottom: spacing.xs,
    },
    patternTriggersList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    patternTrigger: {
      fontSize: fontSize.xs,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    recommendationsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    recommendationsTitle: {
      fontSize: fontSize.lg,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      marginBottom: spacing.md,
    },
    recommendationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    recommendationBullet: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
      marginTop: 8,
      marginRight: spacing.sm,
    },
    recommendationText: {
      flex: 1,
      fontSize: fontSize.md,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.text,
      lineHeight: fontSize.md * 1.5,
    },
    actionsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    actionsTitle: {
      fontSize: fontSize.lg,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      marginBottom: spacing.md,
    },
    actionsRow: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: spacing.md,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    loadingText: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_500Medium',
      color: theme.colors.textSecondary,
      marginTop: spacing.md,
    },
    noDataContainer: {
      padding: spacing.xl,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: spacing.xl,
    },
    noDataText: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_500Medium',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    emotionChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando tu viaje emocional...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ResponsiveContainer>
          {/* Header */}
          <FadeInView delay={0}>
            <View style={styles.header}>
              <Text style={styles.title}>Tu Viaje Emocional</Text>
              <Text style={styles.subtitle}>
                Visualiza y comprende tus emociones a lo largo de tu exploración vocacional
              </Text>
            </View>
          </FadeInView>

          {/* Filters */}
          <FadeInView delay={200}>
            <View style={styles.filtersContainer}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Periodo:</Text>
                {(['week', 'month', 'quarter'] as TimeRange[]).map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.filterButton,
                      {
                        backgroundColor: timeRange === period ? theme.colors.primary + '20' : theme.colors.surface,
                        borderColor: timeRange === period ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => setTimeRange(period)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        {
                          color: timeRange === period ? theme.colors.primary : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Trimestre'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Emociones:</Text>
                {(['all', 'positive', 'negative', 'neutral'] as EmotionCategory[]).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterButton,
                      {
                        backgroundColor: emotionCategory === category ? theme.colors.primary + '20' : theme.colors.surface,
                        borderColor: emotionCategory === category ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => setEmotionCategory(category)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        {
                          color: emotionCategory === category ? theme.colors.primary : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {category === 'all' ? 'Todas' : category === 'positive' ? 'Positivas' : category === 'negative' ? 'Negativas' : 'Neutras'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </FadeInView>

          {/* Summary Card */}
          <ScaleInView delay={400}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Resumen Emocional</Text>
                <View style={[styles.summaryTrend, { backgroundColor: getTrendColor() + '20' }]}>
                  {getTrendIcon()}
                  <Text style={[styles.summaryTrendText, { color: getTrendColor() }]}>
                    {getTrendText()}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryStats}>
                <StaggeredList staggerDelay={100} initialDelay={600}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{emotionalInsights?.totalLogs || 0}</Text>
                    <Text style={styles.statLabel}>Registros</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{emotionalInsights?.averageIntensity || 0}/10</Text>
                    <Text style={styles.statLabel}>Intensidad Media</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{emotionalInsights?.moodImprovementRate || 0}%</Text>
                    <Text style={styles.statLabel}>Mejora de Ánimo</Text>
                  </View>
                </StaggeredList>
              </View>

              <View style={styles.moodFacesContainer}>
                <StaggeredList staggerDelay={150} initialDelay={800}>
                  <View style={styles.moodFaceItem}>
                    <MoodFace mood={getOverallMood()} size={60} animated />
                    <Text style={styles.moodLabel}>Estado General</Text>
                  </View>
                  <View style={styles.moodFaceItem}>
                    <MoodFace 
                      mood={getMoodTrend() === 'improving' ? 'happy' : getMoodTrend() === 'declining' ? 'worried' : 'neutral'} 
                      size={60} 
                      animated 
                    />
                    <Text style={styles.moodLabel}>Tendencia</Text>
                  </View>
                  <View style={styles.moodFaceItem}>
                    <MoodFace 
                      mood={emotionalInsights?.moodImprovementRate && emotionalInsights.moodImprovementRate > 50 ? 'excited' : 'neutral'} 
                      size={60} 
                      animated 
                    />
                    <Text style={styles.moodLabel}>Progreso</Text>
                  </View>
                </StaggeredList>
              </View>
            </View>
          </ScaleInView>

          {/* Emotions Filter */}
          <FadeInView delay={1000}>
            <View style={styles.emotionChipsContainer}>
              {emotionalInsights?.topEmotions?.map((emotion, index) => (
                <EmotionChip
                  key={index}
                  emoji={getEmotionMood(emotion.emotion) === 'happy' ? '😊' : 
                         getEmotionMood(emotion.emotion) === 'sad' ? '😔' : '🤔'}
                  label={emotion.emotion}
                  selected={selectedEmotion === emotion.emotion}
                  onPress={() => setSelectedEmotion(selectedEmotion === emotion.emotion ? null : emotion.emotion)}
                  backgroundColor={getEmotionColor(emotion.emotion) + '20'}
                  textColor={getEmotionColor(emotion.emotion)}
                />
              ))}
            </View>
          </FadeInView>

          {/* Chart Card */}
          <SlideInView delay={1200} direction="up">
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Tendencia Emocional - {getTimeRangeText()}</Text>
              
              {getChartData().length > 0 ? (
                <EmotionalChart 
                  data={getChartData()} 
                  animated 
                  height={250}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Heart size={40} color={theme.colors.textMuted} />
                  <Text style={styles.noDataText}>
                    No hay suficientes datos para mostrar la tendencia emocional.
                    Registra tus emociones regularmente para ver tu progreso.
                  </Text>
                </View>
              )}
            </View>
          </SlideInView>

          {/* Top Emotions List */}
          <FadeInView delay={1400}>
            <View style={styles.emotionsListCard}>
              <Text style={styles.emotionsListTitle}>Emociones Más Frecuentes</Text>
              
              {getEmotionsList().length > 0 ? (
                <StaggeredList staggerDelay={100} initialDelay={1600}>
                  {getEmotionsList().map((emotion, index) => (
                    <View key={index} style={styles.emotionItem}>
                      <View style={styles.emotionRow}>
                        <View style={[styles.emotionDot, { backgroundColor: emotion.color }]} />
                        <Text style={styles.emotionName}>{emotion.name}</Text>
                      </View>
                      <Text style={styles.emotionCount}>{emotion.count} veces</Text>
                    </View>
                  ))}
                </StaggeredList>
              ) : (
                <Text style={[styles.noDataText, { textAlign: 'left', marginTop: 0 }]}>
                  Aún no hay suficientes datos para mostrar emociones frecuentes.
                </Text>
              )}
            </View>
          </FadeInView>

          {/* Emotional Patterns */}
          <SlideInView delay={1800} direction="up">
            <View style={styles.patternsCard}>
              <Text style={styles.patternsTitle}>Patrones Emocionales</Text>
              
              {getEmotionalPatterns().length > 0 ? (
                <StaggeredList staggerDelay={150} initialDelay={2000}>
                  {getEmotionalPatterns().map((pattern, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.patternItem, 
                        { 
                          borderLeftColor: getEmotionColor(pattern.emotion),
                          backgroundColor: getEmotionColor(pattern.emotion) + '05',
                        }
                      ]}
                    >
                      <View style={styles.patternHeader}>
                        <Text style={styles.patternEmotion}>{pattern.emotion}</Text>
                        <View style={styles.patternStats}>
                          <Text style={styles.patternStat}>
                            {pattern.frequency} veces
                          </Text>
                          <Text style={styles.patternStat}>
                            Intensidad: {pattern.averageIntensity.toFixed(1)}/10
                          </Text>
                        </View>
                      </View>
                      
                      {pattern.commonTriggers.length > 0 && (
                        <View style={styles.patternTriggers}>
                          <Text style={styles.patternTriggerTitle}>Desencadenantes comunes:</Text>
                          <View style={styles.patternTriggersList}>
                            {pattern.commonTriggers.map((trigger, i) => (
                              <Text key={i} style={styles.patternTrigger}>
                                {trigger}
                              </Text>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
                </StaggeredList>
              ) : (
                <Text style={[styles.noDataText, { textAlign: 'left', marginTop: 0 }]}>
                  Registra más emociones para descubrir patrones emocionales.
                </Text>
              )}
            </View>
          </SlideInView>

          {/* Recommendations */}
          <FadeInView delay={2200}>
            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>Recomendaciones Personalizadas</Text>
              
              <StaggeredList staggerDelay={150} initialDelay={2400}>
                {getRecommendations().map((recommendation, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <View style={styles.recommendationBullet} />
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </StaggeredList>
            </View>
          </FadeInView>

          {/* Action Buttons */}
          <SlideInView delay={2600} direction="up">
            <View style={styles.actionsCard}>
              <Text style={styles.actionsTitle}>Acciones Recomendadas</Text>
              
              <View style={styles.actionsRow}>
                <StaggeredList staggerDelay={100} initialDelay={2800}>
                  <AnimatedButton
                    title="Registrar Emoción"
                    onPress={() => {/* Navigate to emotion log form */}}
                    variant="primary"
                    size="md"
                    icon={<Heart size={20} color="#FFFFFF" />}
                  />
                  
                  <AnimatedButton
                    title="Chat de Apoyo"
                    onPress={() => {/* Navigate to support chat */}}
                    variant="secondary"
                    size="md"
                    icon={<MessageCircle size={20} color={theme.colors.text} />}
                  />
                  
                  <AnimatedButton
                    title="Test Vocacional"
                    onPress={() => {/* Navigate to vocational test */}}
                    variant="ghost"
                    size="md"
                    icon={<Brain size={20} color={theme.colors.primary} />}
                  />
                </StaggeredList>
              </View>
            </View>
          </SlideInView>
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}