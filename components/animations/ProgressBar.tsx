import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  delay?: number;
  animated?: boolean;
}

export default function ProgressBar({
  progress,
  height = 8,
  backgroundColor = '#F3F4F6',
  fillColor = '#6366F1',
  delay = 0,
  animated = true,
}: ProgressBarProps) {
  const width = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      width.value = withDelay(
        delay,
        withSpring(progress, { 
          damping: 15, 
          stiffness: 100,
          mass: 1,
        })
      );

      // Shimmer effect
      shimmer.value = withDelay(
        delay + 500,
        withTiming(1, { duration: 1000 })
      );
    } else {
      width.value = progress;
    }
  }, [progress, delay, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  const shimmerStyle = useAnimatedStyle(() => {
    const shimmerColor = interpolateColor(
      shimmer.value,
      [0, 0.5, 1],
      [fillColor, '#FFFFFF', fillColor]
    );
    
    return {
      backgroundColor: shimmerColor,
    };
  });

  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      <Animated.View
        style={[
          styles.fill,
          { height },
          animatedStyle,
          animated ? shimmerStyle : { backgroundColor: fillColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
});