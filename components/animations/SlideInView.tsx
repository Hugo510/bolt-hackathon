import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SlideInViewProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  style?: any;
  onAnimationComplete?: () => void;
}

export default function SlideInView({
  children,
  delay = 0,
  direction = 'left',
  distance,
  style,
  onAnimationComplete,
}: SlideInViewProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  const getInitialOffset = () => {
    const defaultDistance = distance || (direction === 'left' || direction === 'right' ? SCREEN_WIDTH : SCREEN_HEIGHT);
    
    switch (direction) {
      case 'left':
        return { x: -defaultDistance, y: 0 };
      case 'right':
        return { x: defaultDistance, y: 0 };
      case 'up':
        return { x: 0, y: -defaultDistance };
      case 'down':
        return { x: 0, y: defaultDistance };
      default:
        return { x: 0, y: 0 };
    }
  };

  useEffect(() => {
    const { x, y } = getInitialOffset();
    translateX.value = x;
    translateY.value = y;

    translateX.value = withDelay(
      delay,
      withSpring(0, {
        damping: 20,
        stiffness: 100,
      }, (finished) => {
        if (finished && onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      })
    );

    translateY.value = withDelay(
      delay,
      withSpring(0, {
        damping: 20,
        stiffness: 100,
      })
    );

    opacity.value = withDelay(
      delay,
      withSpring(1, {
        damping: 15,
        stiffness: 100,
      })
    );
  }, [delay, direction, distance]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}