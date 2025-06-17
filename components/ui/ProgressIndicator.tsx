import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolateColor,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserProgressStore } from '@/stores/userProgressStore';

interface ProgressIndicatorProps {
  showLevel?: boolean;
  showPoints?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressIndicator({
  showLevel = true,
  showPoints = true,
  animated = true,
  size = 'md',
}: ProgressIndicatorProps) {
  const { theme } = useTheme();
  const {
    currentLevel,
    experiencePoints,
    getProgressToNextLevel,
    getPointsToNextLevel,
  } = useUserProgressStore();

  const progress = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  const progressValue = getProgressToNextLevel();
  const pointsToNext = getPointsToNextLevel();

  useEffect(() => {
    if (animated) {
      progress.value = withDelay(
        300,
        withSpring(progressValue, { damping: 15, stiffness: 100 })
      );
      
      scale.value = withSequence(
        withSpring(1.1, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      
      opacity.value = withTiming(1, { duration: 600 });
    } else {
      progress.value = progressValue;
      scale.value = 1;
      opacity.value = 1;
    }
  }, [progressValue, animated]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [theme.colors.warning, theme.colors.primary, theme.colors.success]
    ),
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: { padding: 12 },
          progressBar: { height: 4 },
          levelText: { fontSize: 14 },
          pointsText: { fontSize: 12 },
        };
      case 'lg':
        return {
          container: { padding: 20 },
          progressBar: { height: 8 },
          levelText: { fontSize: 20 },
          pointsText: { fontSize: 16 },
        };
      default:
        return {
          container: { padding: 16 },
          progressBar: { height: 6 },
          levelText: { fontSize: 16 },
          pointsText: { fontSize: 14 },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      ...sizeStyles.container,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    levelText: {
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      ...sizeStyles.levelText,
    },
    pointsText: {
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      ...sizeStyles.pointsText,
    },
    progressContainer: {
      backgroundColor: theme.colors.border,
      borderRadius: sizeStyles.progressBar.height / 2,
      overflow: 'hidden',
      ...sizeStyles.progressBar,
    },
    progressBar: {
      borderRadius: sizeStyles.progressBar.height / 2,
      ...sizeStyles.progressBar,
    },
    footer: {
      marginTop: 8,
      alignItems: 'center',
    },
    nextLevelText: {
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textMuted,
      fontSize: 12,
    },
  });

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {(showLevel || showPoints) && (
        <View style={styles.header}>
          {showLevel && (
            <Text style={styles.levelText}>Nivel {currentLevel}</Text>
          )}
          {showPoints && (
            <Text style={styles.pointsText}>{experiencePoints} XP</Text>
          )}
        </View>
      )}
      
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, progressBarStyle]} />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.nextLevelText}>
          {pointsToNext} XP para el siguiente nivel
        </Text>
      </View>
    </Animated.View>
  );
}