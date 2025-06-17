import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, AccessibilityRole } from 'react-native';
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

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  testID?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AccessibleButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  style,
  textStyle,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  testID,
}: AccessibleButtonProps) {
  const { theme, isHighContrast } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const focusScale = useSharedValue(1);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.8, { duration: 100 });
    })
    .onFinalize(() => {
      scale.value = withSequence(
        withSpring(1.02, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
      opacity.value = withTiming(1, { duration: 150 });
      
      if (!disabled && !loading) {
        runOnJS(onPress)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * focusScale.value },
    ],
    opacity: opacity.value,
  }));

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
      // Tamaños de touch target accesibles
      minHeight: theme.spacing.touchTarget,
      minWidth: theme.spacing.touchTarget,
    };

    const sizeStyles = {
      sm: { 
        paddingHorizontal: 20, 
        paddingVertical: 12, 
        minHeight: theme.spacing.minTouchTarget,
        minWidth: theme.spacing.minTouchTarget,
      },
      md: { 
        paddingHorizontal: 24, 
        paddingVertical: 16, 
        minHeight: theme.spacing.touchTarget,
        minWidth: theme.spacing.touchTarget,
      },
      lg: { 
        paddingHorizontal: 32, 
        paddingVertical: 20, 
        minHeight: 56,
        minWidth: 120,
      },
      xl: { 
        paddingHorizontal: 40, 
        paddingVertical: 24, 
        minHeight: 64,
        minWidth: 140,
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: isHighContrast 
          ? theme.colors.accessibility.highContrast.text 
          : theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.surface,
        borderWidth: 2,
        borderColor: isHighContrast 
          ? theme.colors.accessibility.highContrast.border 
          : theme.colors.border,
      },
      ghost: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      },
      gradient: {
        backgroundColor: 'transparent',
      },
      danger: {
        backgroundColor: theme.colors.error,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
      // Indicador de enfoque para accesibilidad
      borderWidth: variantStyles[variant].borderWidth || 0,
      borderColor: variantStyles[variant].borderColor || 'transparent',
    };
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontFamily: theme.typography.body.fontFamily,
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : size === 'xl' ? 20 : 16,
      fontWeight: '600' as const,
      marginLeft: icon ? 8 : 0,
      // Mejorar legibilidad
      letterSpacing: 0.5,
    };

    const variantTextStyles = {
      primary: { 
        color: isHighContrast 
          ? theme.colors.accessibility.highContrast.background 
          : '#ffffff' 
      },
      secondary: { 
        color: isHighContrast 
          ? theme.colors.accessibility.highContrast.text 
          : theme.colors.text 
      },
      ghost: { 
        color: isHighContrast 
          ? theme.colors.accessibility.highContrast.text 
          : theme.colors.primary 
      },
      gradient: { color: '#ffffff' },
      danger: { color: '#ffffff' },
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
    </>
  );

  const accessibilityProps = {
    accessible: true,
    accessibilityRole,
    accessibilityLabel: accessibilityLabel || title,
    accessibilityHint: accessibilityHint || (loading ? 'Cargando' : `Toca para ${title.toLowerCase()}`),
    accessibilityState: {
      disabled: disabled || loading,
      busy: loading,
    },
    testID,
  };

  if (variant === 'gradient') {
    return (
      <GestureDetector gesture={tap}>
        <AnimatedTouchable
          style={[animatedStyle, style]}
          disabled={disabled || loading}
          activeOpacity={1}
          {...accessibilityProps}
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
        {...accessibilityProps}
      >
        {buttonContent}
      </AnimatedTouchable>
    </GestureDetector>
  );
}