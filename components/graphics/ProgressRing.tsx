import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  colors?: string[];
  showPercentage?: boolean;
  animated?: boolean;
  children?: React.ReactNode;
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  colors,
  showPercentage = true,
  animated = true,
  children,
}: ProgressRingProps) {
  const { theme } = useTheme();
  const progressValue = useSharedValue(0);
  const scaleValue = useSharedValue(0.8);

  const defaultColors = colors || [theme.colors.primary, theme.colors.secondary];
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (animated) {
      progressValue.value = withDelay(
        200,
        withTiming(progress, { duration: 1500 })
      );
      scaleValue.value = withTiming(1, { duration: 800 });
    } else {
      progressValue.value = progress;
      scaleValue.value = 1;
    }
  }, [progress, animated]);

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progressValue.value * circumference);
    
    return {
      strokeDasharray,
      strokeDashoffset,
      stroke: interpolateColor(
        progressValue.value,
        [0, 0.5, 1],
        [defaultColors[0], theme.colors.warning, defaultColors[1]]
      ),
    };
  });

  const animatedContainerStyle = useAnimatedProps(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const percentage = Math.round(progress * 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
            opacity={0.3}
          />
          
          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            animatedProps={animatedCircleProps}
          />
        </G>
      </Svg>
      
      <View style={styles.content}>
        {children || (showPercentage && (
          <Text style={[styles.percentage, { color: theme.colors.text }]}>
            {percentage}%
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
  },
});