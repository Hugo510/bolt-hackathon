import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface AccessibleTextProps {
  children: React.ReactNode;
  variant?: 'display' | 'heading' | 'title' | 'body' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'muted' | 'error' | 'success' | 'warning';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  accessibilityLabel?: string;
  accessibilityRole?: 'text' | 'header';
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
}

export default function AccessibleText({
  children,
  variant = 'body',
  color = 'primary',
  weight = 'regular',
  align = 'left',
  style,
  accessibilityLabel,
  accessibilityRole = 'text',
  numberOfLines,
  adjustsFontSizeToFit = false,
  minimumFontScale = 0.8,
}: AccessibleTextProps) {
  const { theme, isHighContrast } = useTheme();

  const getVariantStyle = () => {
    const variants = {
      display: {
        fontSize: 32,
        lineHeight: 40,
        fontFamily: 'Inter_700Bold',
      },
      heading: {
        fontSize: 24,
        lineHeight: 32,
        fontFamily: 'Inter_700Bold',
      },
      title: {
        fontSize: 20,
        lineHeight: 28,
        fontFamily: 'Inter_600SemiBold',
      },
      body: {
        fontSize: 16,
        lineHeight: 24,
        fontFamily: 'Inter_400Regular',
      },
      caption: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Inter_400Regular',
      },
      label: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: 'Inter_500Medium',
      },
    };

    return variants[variant];
  };

  const getColorStyle = () => {
    if (isHighContrast) {
      return {
        color: color === 'primary' 
          ? theme.colors.accessibility.highContrast.text
          : theme.colors.accessibility.highContrast.text,
      };
    }

    const colors = {
      primary: theme.colors.text,
      secondary: theme.colors.textSecondary,
      muted: theme.colors.textMuted,
      error: theme.colors.error,
      success: theme.colors.success,
      warning: theme.colors.warning,
    };

    return { color: colors[color] };
  };

  const getWeightStyle = () => {
    const weights = {
      regular: { fontFamily: 'Inter_400Regular' },
      medium: { fontFamily: 'Inter_500Medium' },
      semibold: { fontFamily: 'Inter_600SemiBold' },
      bold: { fontFamily: 'Inter_700Bold' },
    };

    return weights[weight];
  };

  const textStyle = {
    ...getVariantStyle(),
    ...getColorStyle(),
    ...getWeightStyle(),
    textAlign: align,
    // Mejorar legibilidad
    letterSpacing: variant === 'display' || variant === 'heading' ? 0.5 : 0.25,
    ...style,
  };

  return (
    <Text
      style={textStyle}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
    >
      {children}
    </Text>
  );
}