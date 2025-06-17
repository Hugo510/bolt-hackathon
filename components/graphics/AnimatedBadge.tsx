import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  withRepeat,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface AnimatedBadgeProps {
  type: 'star' | 'trophy' | 'medal' | 'crown';
  size?: number;
  color?: string;
  animated?: boolean;
  glowing?: boolean;
  title?: string;
}

export default function AnimatedBadge({
  type,
  size = 60,
  color,
  animated = true,
  glowing = false,
  title,
}: AnimatedBadgeProps) {
  const { theme } = useTheme();
  const badgeColor = color || theme.colors.primary;
  
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0);
  const sparkle = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      
      rotation.value = withSequence(
        withTiming(10, { duration: 200 }),
        withTiming(-10, { duration: 400 }),
        withTiming(0, { duration: 200 })
      );
    } else {
      scale.value = 1;
    }

    if (glowing) {
      glow.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    }

    sparkle.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      false
    );
  }, [animated, glowing]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0.3, 0.8]),
    transform: [{ scale: interpolate(glow.value, [0, 1], [1, 1.1]) }],
  }));

  const sparkleProps = useAnimatedProps(() => ({
    opacity: interpolate(sparkle.value, [0, 0.5, 1], [0, 1, 0]),
    transform: `rotate(${sparkle.value * 360})`,
  }));

  const renderBadgeShape = () => {
    const center = size / 2;
    
    switch (type) {
      case 'star':
        return (
          <AnimatedPath
            d={`M${center},${size * 0.1} L${size * 0.6},${size * 0.35} L${size * 0.9},${size * 0.35} L${size * 0.7},${size * 0.6} L${size * 0.8},${size * 0.9} L${center},${size * 0.75} L${size * 0.2},${size * 0.9} L${size * 0.3},${size * 0.6} L${size * 0.1},${size * 0.35} L${size * 0.4},${size * 0.35} Z`}
            fill={badgeColor}
            stroke="#FFD700"
            strokeWidth="2"
          />
        );
      
      case 'trophy':
        return (
          <G>
            <AnimatedPath
              d={`M${size * 0.3},${size * 0.2} L${size * 0.7},${size * 0.2} L${size * 0.65},${size * 0.5} L${size * 0.35},${size * 0.5} Z`}
              fill={badgeColor}
            />
            <AnimatedPath
              d={`M${size * 0.4},${size * 0.5} L${size * 0.6},${size * 0.5} L${size * 0.6},${size * 0.7} L${size * 0.4},${size * 0.7} Z`}
              fill="#8B5CF6"
            />
            <AnimatedPath
              d={`M${size * 0.35},${size * 0.7} L${size * 0.65},${size * 0.7} L${size * 0.65},${size * 0.8} L${size * 0.35},${size * 0.8} Z`}
              fill="#6366F1"
            />
          </G>
        );
      
      case 'medal':
        return (
          <G>
            <AnimatedCircle
              cx={center}
              cy={center}
              r={size * 0.3}
              fill={badgeColor}
              stroke="#FFD700"
              strokeWidth="3"
            />
            <AnimatedPath
              d={`M${center - 5},${size * 0.2} L${center + 5},${size * 0.2} L${center + 3},${size * 0.4} L${center - 3},${size * 0.4} Z`}
              fill="#FF6B6B"
            />
          </G>
        );
      
      case 'crown':
        return (
          <AnimatedPath
            d={`M${size * 0.2},${size * 0.6} L${size * 0.3},${size * 0.3} L${center},${size * 0.4} L${size * 0.7},${size * 0.3} L${size * 0.8},${size * 0.6} L${size * 0.8},${size * 0.7} L${size * 0.2},${size * 0.7} Z`}
            fill={badgeColor}
            stroke="#FFD700"
            strokeWidth="2"
          />
        );
      
      default:
        return null;
    }
  };

  const renderSparkles = () => (
    <AnimatedG animatedProps={sparkleProps}>
      <Circle cx={size * 0.15} cy={size * 0.15} r="2" fill="#FFD700" />
      <Circle cx={size * 0.85} cy={size * 0.15} r="1.5" fill="#FFF" />
      <Circle cx={size * 0.85} cy={size * 0.85} r="2" fill="#FFD700" />
      <Circle cx={size * 0.15} cy={size * 0.85} r="1.5" fill="#FFF" />
    </AnimatedG>
  );

  return (
    <View style={styles.container}>
      {glowing && (
        <Animated.View style={[styles.glow, glowStyle, { width: size, height: size }]}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={size * 0.4}
              fill={badgeColor}
              opacity="0.3"
            />
          </Svg>
        </Animated.View>
      )}
      
      <Animated.View style={animatedStyle}>
        <Svg width={size} height={size}>
          {renderBadgeShape()}
          {animated && renderSparkles()}
        </Svg>
      </Animated.View>
      
      {title && (
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 1000,
  },
  title: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
});