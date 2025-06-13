import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface NeumorphicCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'inset' | 'flat';
  padding?: number;
}

export default function NeumorphicCard({
  children,
  style,
  variant = 'elevated',
  padding = 20,
}: NeumorphicCardProps) {
  const { theme, isDark } = useTheme();

  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: theme.borderRadius.lg,
      padding,
    };

    if (isDark) {
      // En modo oscuro, usar un estilo más sutil
      return {
        ...baseStyle,
        backgroundColor: theme.colors.surface,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      };
    }

    // Neumorfismo para modo claro
    const variantStyles = {
      elevated: {
        backgroundColor: theme.colors.background,
        shadowColor: '#d1d5db',
        shadowOffset: { width: -4, height: -4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 8,
      },
      inset: {
        backgroundColor: theme.colors.surface,
        shadowColor: '#ffffff',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: -4,
      },
      flat: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  if (variant === 'elevated' && !isDark) {
    return (
      <View style={[getCardStyle(), style]}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: theme.borderRadius.lg,
            shadowColor: '#9ca3af',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        />
        {children}
      </View>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
}