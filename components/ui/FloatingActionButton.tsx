import React from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  size?: number;
  bottom?: number;
  right?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function FloatingActionButton({
  onPress,
  icon,
  size = 56,
  bottom = 24,
  right = 24,
}: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    rotation.value = withTiming(360, { duration: 300 }, () => {
      rotation.value = 0;
      runOnJS(onPress)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <AnimatedTouchable
      style={[
        animatedStyle,
        {
          position: 'absolute',
          bottom,
          right,
          width: size,
          height: size,
          borderRadius: size / 2,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 12,
        },
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <LinearGradient
        colors={theme.colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: size / 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {icon}
      </LinearGradient>
    </AnimatedTouchable>
  );
}