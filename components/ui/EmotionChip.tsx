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
  backgroundColor?: string;
  textColor?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function EmotionChip({
  emoji,
  label,
  selected,
  onPress,
  backgroundColor = '#FFFFFF',
  textColor = '#6B7280',
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
    const elevation = interpolate(glow.value, [0, 1], [2, 8]);
    
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: glowOpacity,
      elevation,
    };
  });

  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: selected ? backgroundColor : '#FFFFFF',
    borderColor: selected ? textColor : '#E5E7EB',
    borderWidth: selected ? 2 : 1,
  }));

  return (
    <GestureDetector gesture={tap}>
      <AnimatedTouchable
        style={[
          styles.container,
          animatedStyle,
          chipStyle,
          {
            shadowColor: textColor,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
          },
        ]}
        activeOpacity={1}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.label, { color: selected ? textColor : '#6B7280' }]}>
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
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 100,
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
});