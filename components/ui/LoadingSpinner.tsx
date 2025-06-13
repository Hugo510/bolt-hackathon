import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: number;
  variant?: 'dots' | 'circle' | 'pulse';
}

export default function LoadingSpinner({ 
  size = 40, 
  variant = 'circle' 
}: LoadingSpinnerProps) {
  const { theme } = useTheme();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (variant === 'circle') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
    } else if (variant === 'pulse') {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 800 }),
        -1,
        true
      );
    }
  }, [variant, rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  if (variant === 'dots') {
    return <DotsSpinner size={size} />;
  }

  if (variant === 'pulse') {
    return (
      <Animated.View style={[animatedStyle, { width: size, height: size }]}>
        <View
          style={{
            width: '100%',
            height: '100%',
            borderRadius: size / 2,
            backgroundColor: theme.colors.primary,
            opacity: 0.6,
          }}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, { width: size, height: size }]}>
      <View
        style={{
          width: '100%',
          height: '100%',
          borderRadius: size / 2,
          borderWidth: 3,
          borderColor: theme.colors.border,
          borderTopColor: theme.colors.primary,
        }}
      />
    </Animated.View>
  );
}

function DotsSpinner({ size }: { size: number }) {
  const { theme } = useTheme();
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animate = () => {
      dot1.value = withTiming(1, { duration: 400 }, () => {
        dot1.value = withTiming(0, { duration: 400 });
      });
      
      setTimeout(() => {
        dot2.value = withTiming(1, { duration: 400 }, () => {
          dot2.value = withTiming(0, { duration: 400 });
        });
      }, 200);
      
      setTimeout(() => {
        dot3.value = withTiming(1, { duration: 400 }, () => {
          dot3.value = withTiming(0, { duration: 400 });
        });
      }, 400);
    };

    const interval = setInterval(animate, 1200);
    animate();

    return () => clearInterval(interval);
  }, [dot1, dot2, dot3]);

  const createDotStyle = (dotValue: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => ({
      opacity: interpolate(dotValue.value, [0, 1], [0.3, 1]),
      transform: [{ scale: interpolate(dotValue.value, [0, 1], [0.8, 1.2]) }],
    }));

  const dotSize = size / 4;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Animated.View
        style={[
          createDotStyle(dot1),
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: theme.colors.primary,
          },
        ]}
      />
      <Animated.View
        style={[
          createDotStyle(dot2),
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: theme.colors.primary,
          },
        ]}
      />
      <Animated.View
        style={[
          createDotStyle(dot3),
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: theme.colors.primary,
          },
        ]}
      />
    </View>
  );
}