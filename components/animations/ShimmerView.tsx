import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ShimmerViewProps {
  children: React.ReactNode;
  style?: any;
  shimmerColors?: string[];
  duration?: number;
}

export default function ShimmerView({
  children,
  style,
  shimmerColors = ['#f0f0f0', '#e0e0e0', '#f0f0f0'],
  duration = 1500,
}: ShimmerViewProps) {
  const shimmerTranslate = useSharedValue(-1);

  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(1, { duration }),
      -1,
      false
    );
  }, [duration]);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerTranslate.value,
      [-1, 1],
      [-300, 300]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <Animated.View style={[style, { overflow: 'hidden' }]}>
      {children}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.5,
          },
          shimmerStyle,
        ]}
      >
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flex: 1,
            width: 300,
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}