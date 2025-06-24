import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart, TrendingUp, ArrowUp, ArrowDown, Calendar } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsiveSpacing, useResponsiveFontSize } from '@/hooks/useResponsive';
import MoodFace from '@/components/graphics/MoodFace';

interface EmotionalInsightCardProps {
  title: string;
  totalLogs: number;
  averageIntensity: number;
  moodImprovementRate: number;
  topEmotion: string;
  trend: 'improving' | 'stable' | 'declining';
  timeRange: string;
  onPress?: () => void;
}

export default function EmotionalInsightCard({
  title,
  totalLogs,
  averageIntensity,
  moodImprovementRate,
  topEmotion,
  trend,
  timeRange,
  onPress,
}: EmotionalInsightCardProps) {
  const { theme } = useTheme();
  const spacing = useResponsiveSpacing();
  const fontSize = useResponsiveFontSize();

  const getEmotionMood = (emotion: string) => {
    const positiveEmotions = ['felicidad', 'motivación', 'tranquilidad', 'gratitud', 'esperanza'];
    const negativeEmotions = ['ansiedad', 'tristeza', 'miedo', 'frustración', 'enojo', 'preocupación'];
    
    if (positiveEmotions.includes(emotion.toLowerCase())) return 'happy';
    if (negativeEmotions.includes(emotion.toLowerCase())) return 'sad';
    return 'neutral';
  };

  const getTrendIcon = () => {
    if (trend === 'improving') return <ArrowUp size={16} color={theme.colors.success} />;
    if (trend === 'declining') return <ArrowDown size={16} color={theme.colors.error} />;
    return <TrendingUp size={16} color={theme.colors.primary} />;
  };

  const getTrendText = () => {
    if (trend === 'improving') return 'Mejorando';
    if (trend === 'declining') return 'Necesita atención';
    return 'Estable';
  };

  const getTrendColor = () => {
    if (trend === 'improving') return theme.colors.success;
    if (trend === 'declining') return theme.colors.error;
    return theme.colors.primary;
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.md,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      marginRight: spacing.sm,
    },
    title: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
    },
    timeRange: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
    },
    timeRangeText: {
      fontSize: fontSize.xs,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statsContainer: {
      flex: 1,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    statLabel: {
      fontSize: fontSize.xs,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
    },
    statValue: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
    },
    moodContainer: {
      alignItems: 'center',
      marginLeft: spacing.md,
    },
    moodLabel: {
      fontSize: fontSize.xs,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      marginTop: spacing.xs,
    },
    trendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: getTrendColor() + '10',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginTop: spacing.sm,
    },
    trendText: {
      fontSize: fontSize.xs,
      fontFamily: 'Inter_500Medium',
      color: getTrendColor(),
      marginLeft: 4,
    },
  });

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Heart size={20} color={theme.colors.primary} style={styles.icon} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.timeRange}>
          <Calendar size={12} color={theme.colors.textSecondary} />
          <Text style={styles.timeRangeText}>{timeRange}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Registros:</Text>
            <Text style={styles.statValue}>{totalLogs}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Intensidad media:</Text>
            <Text style={styles.statValue}>{averageIntensity}/10</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Mejora de ánimo:</Text>
            <Text style={styles.statValue}>{moodImprovementRate}%</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Emoción principal:</Text>
            <Text style={styles.statValue}>{topEmotion}</Text>
          </View>
          
          <View style={styles.trendContainer}>
            {getTrendIcon()}
            <Text style={styles.trendText}>{getTrendText()}</Text>
          </View>
        </View>
        
        <View style={styles.moodContainer}>
          <MoodFace 
            mood={getEmotionMood(topEmotion)} 
            size={60} 
            animated={false} 
          />
          <Text style={styles.moodLabel}>Estado</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}