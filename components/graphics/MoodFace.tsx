import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface MoodFaceProps {
  mood: 'happy' | 'sad' | 'neutral' | 'excited' | 'worried';
  size?: number;
  color?: string;
  animated?: boolean;
}

export default function MoodFace({
  mood,
  size = 80,
  color = '#FFD700',
  animated = true,
}: MoodFaceProps) {
  const scale = useSharedValue(0);
  const eyeBlink = useSharedValue(1);
  const mouthCurve = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );

      // Parpadeo ocasional
      const blinkInterval = setInterval(() => {
        eyeBlink.value = withSequence(
          withTiming(0.1, { duration: 100 }),
          withTiming(1, { duration: 100 })
        );
      }, 3000);

      return () => clearInterval(blinkInterval);
    } else {
      scale.value = 1;
    }
  }, [animated]);

  const animatedFaceProps = useAnimatedProps(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedEyeProps = useAnimatedProps(() => ({
    ry: interpolate(eyeBlink.value, [0, 1], [1, 8]),
  }));

  const getMouthPath = () => {
    const centerX = size / 2;
    const centerY = size / 2;
    const mouthY = centerY + size * 0.15;
    const mouthWidth = size * 0.3;

    switch (mood) {
      case 'happy':
        return `M${centerX - mouthWidth},${mouthY} Q${centerX},${mouthY + 15} ${centerX + mouthWidth},${mouthY}`;
      case 'sad':
        return `M${centerX - mouthWidth},${mouthY + 10} Q${centerX},${mouthY - 5} ${centerX + mouthWidth},${mouthY + 10}`;
      case 'excited':
        return `M${centerX - mouthWidth},${mouthY - 5} Q${centerX},${mouthY + 20} ${centerX + mouthWidth},${mouthY - 5}`;
      case 'worried':
        return `M${centerX - mouthWidth * 0.7},${mouthY} L${centerX + mouthWidth * 0.7},${mouthY}`;
      default: // neutral
        return `M${centerX - mouthWidth * 0.5},${mouthY} L${centerX + mouthWidth * 0.5},${mouthY}`;
    }
  };

  const getEyeShape = () => {
    const leftEyeX = size * 0.35;
    const rightEyeX = size * 0.65;
    const eyeY = size * 0.4;

    if (mood === 'worried') {
      return (
        <G>
          <AnimatedCircle cx={leftEyeX} cy={eyeY} rx="6" animatedProps={animatedEyeProps} fill="#333" />
          <AnimatedCircle cx={rightEyeX} cy={eyeY} rx="6" animatedProps={animatedEyeProps} fill="#333" />
          <Path d={`M${leftEyeX - 8},${eyeY - 8} L${leftEyeX + 8},${eyeY - 12}`} stroke="#333" strokeWidth="2" />
          <Path d={`M${rightEyeX - 8},${eyeY - 12} L${rightEyeX + 8},${eyeY - 8}`} stroke="#333" strokeWidth="2" />
        </G>
      );
    }

    return (
      <G>
        <AnimatedCircle cx={leftEyeX} cy={eyeY} rx="6" animatedProps={animatedEyeProps} fill="#333" />
        <AnimatedCircle cx={rightEyeX} cy={eyeY} rx="6" animatedProps={animatedEyeProps} fill="#333" />
      </G>
    );
  };

  const getCheeks = () => {
    if (mood === 'happy' || mood === 'excited') {
      return (
        <G>
          <Circle cx={size * 0.2} cy={size * 0.55} r="8" fill="#FFB6C1" opacity="0.6" />
          <Circle cx={size * 0.8} cy={size * 0.55} r="8" fill="#FFB6C1" opacity="0.6" />
        </G>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <AnimatedG animatedProps={animatedFaceProps}>
          {/* Face */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.45}
            fill={color}
            stroke="#FFA500"
            strokeWidth="2"
          />
          
          {/* Eyes */}
          {getEyeShape()}
          
          {/* Mouth */}
          <AnimatedPath
            d={getMouthPath()}
            stroke="#333"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Cheeks */}
          {getCheeks()}
        </AnimatedG>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});