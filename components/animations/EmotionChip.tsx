import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface EmotionChipProps {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function EmotionChip({
  emoji,
  label,
  selected,
  onPress,
  color = '#6366F1',
}: EmotionChipProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    glow.value = withTiming(selected ? 1 : 0, { duration: 300 });
  }, [selected]);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1.05, { damping: 15, stiffness: 300 }, () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      });
      onPress();
    });

  const animatedStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(glow.value, [0, 1], [0, 0.3]);
    
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: glowOpacity,
      elevation: glow.value * 8,
    };
  });

  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: selected ? color + '20' : '#FFFFFF',
    borderColor: selected ? color : '#E5E7EB',
  }));

  return (
    <GestureDetector gesture={tap}>
      <AnimatedTouchable
        style={[
          styles.container,
          animatedStyle,
          chipStyle,
          {
            shadowColor: color,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
          },
        ]}
        activeOpacity={1}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.label, { color: selected ? color : '#6B7280' }]}>
          {label}
        </Text>
      </AnimatedTouchable>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 2,
  },
  emoji: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});