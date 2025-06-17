import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface ScaleInViewProps {
  children: React.ReactNode;
  delay?: number;
  style?: any;
  bounce?: boolean;
}

export default function ScaleInView({
  children,
  delay = 0,
  style,
  bounce = true,
}: ScaleInViewProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (bounce) {
      scale.value = withDelay(
        delay,
        withSequence(
          withSpring(1.1, { damping: 10, stiffness: 100 }),
          withSpring(1, { damping: 15, stiffness: 150 })
        )
      );
    } else {
      scale.value = withDelay(
        delay,
        withSpring(1, { damping: 12, stiffness: 100 })
      );
    }
    
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400 })
    );
  }, [delay, bounce]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}