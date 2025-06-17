import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  withSequence,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  style,
  textStyle,
  loading = false,
}: AnimatedButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const shimmer = useSharedValue(0);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.8, { duration: 100 });
    })
    .onFinalize(() => {
      scale.value = withSequence(
        withSpring(1.02, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
      opacity.value = withTiming(1, { duration: 150 });
      
      if (!disabled && !loading) {
        rotation.value = withTiming(360, { duration: 200 }, () => {
          rotation.value = 0;
          runOnJS(onPress)();
        });
        
        // Shimmer effect
        shimmer.value = withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 })
        );
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => {
    const shimmerOpacity = interpolate(shimmer.value, [0, 1], [0, 0.3]);
    
    return {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#FFFFFF',
      opacity: shimmerOpacity,
      borderRadius: theme.borderRadius.md,
    };
  });

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      overflow: 'hidden' as const,
    };

    const sizeStyles = {
      sm: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
      md: { paddingHorizontal: 24, paddingVertical: 12, minHeight: 48 },
      lg: { paddingHorizontal: 32, paddingVertical: 16, minHeight: 56 },
    };

    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.surface,
        borderWidth: 2,
        borderColor: theme.colors.border,
      },
      ghost: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      },
      gradient: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontFamily: theme.typography.body.fontFamily,
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
      fontWeight: '600' as const,
      marginLeft: icon ? 8 : 0,
    };

    const variantTextStyles = {
      primary: { color: '#ffffff' },
      secondary: { color: theme.colors.text },
      ghost: { color: theme.colors.primary },
      gradient: { color: '#ffffff' },
    };

    return {
      ...baseTextStyle,
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  const buttonContent = (
    <>
      {icon}
      <Text style={getTextStyle()}>{loading ? 'Cargando...' : title}</Text>
      <Animated.View style={shimmerStyle} />
    </>
  );

  if (variant === 'gradient') {
    return (
      <GestureDetector gesture={tap}>
        <AnimatedTouchable
          style={[animatedStyle, style]}
          disabled={disabled || loading}
          activeOpacity={1}
        >
          <LinearGradient
            colors={theme.colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={getButtonStyle()}
          >
            {buttonContent}
          </LinearGradient>
        </AnimatedTouchable>
      </GestureDetector>
    );
  }

  return (
    <GestureDetector gesture={tap}>
      <AnimatedTouchable
        style={[animatedStyle, getButtonStyle(), style]}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        {buttonContent}
      </AnimatedTouchable>
    </GestureDetector>
  );
}