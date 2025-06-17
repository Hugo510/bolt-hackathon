import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface BreathingCircleProps {
  size?: number;
  color?: string;
  text?: string;
  children?: React.ReactNode;
}

export default function BreathingCircle({
  size = 120,
  color = '#EC4899',
  text = 'Respira',
  children,
}: BreathingCircleProps) {
  const breathe = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Animación principal de respiración
    breathe.value = withRepeat(
      withTiming(1, { duration: 4000 }),
      -1,
      true
    );

    // Pulso sutil adicional
    pulse.value = withRepeat(
      withTiming(1.05, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(breathe.value, [0, 1], [1, 1.1]);
    const opacity = interpolate(breathe.value, [0, 1], [0.8, 1]);
    const shadowOpacity = interpolate(breathe.value, [0, 1], [0.1, 0.3]);

    return {
      transform: [{ scale: scale * pulse.value }],
      opacity,
      shadowOpacity,
    };
  });

  const innerCircleStyle = useAnimatedStyle(() => {
    const innerScale = interpolate(breathe.value, [0, 1], [0.9, 1]);
    return {
      transform: [{ scale: innerScale }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.outerCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color + '20',
            borderColor: color + '40',
            shadowColor: color,
          },
          animatedStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.innerCircle,
            {
              backgroundColor: color + '10',
            },
            innerCircleStyle,
          ]}
        >
          {children || <Text style={[styles.text, { color }]}>{text}</Text>}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  innerCircle: {
    width: '80%',
    height: '80%',
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});