import React from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface SpringButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
  disabled?: boolean;
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function SpringButton({
  children,
  onPress,
  style,
  disabled = false,
  springConfig = { damping: 15, stiffness: 300, mass: 1 },
}: SpringButtonProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.95, springConfig);
    })
    .onFinalize(() => {
      if (!disabled) {
        scale.value = withSequence(
          withSpring(1.05, springConfig),
          withSpring(1, springConfig)
        );
        
        rotation.value = withSequence(
          withSpring(5, springConfig),
          withSpring(-5, springConfig),
          withSpring(0, springConfig, (finished) => {
            if (finished) {
              runOnJS(onPress)();
            }
          })
        );
      } else {
        scale.value = withSpring(1, springConfig);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: disabled ? 0.5 : 1,
  }));

  return (
    <GestureDetector gesture={tap}>
      <AnimatedTouchable
        style={[animatedStyle, style]}
        disabled={disabled}
        activeOpacity={1}
      >
        {children}
      </AnimatedTouchable>
    </GestureDetector>
  );
}