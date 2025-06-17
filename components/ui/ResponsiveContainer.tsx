import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useResponsive, useResponsiveSpacing } from '@/hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  maxWidth?: {
    mobile?: number | string;
    tablet?: number | string;
    desktop?: number | string;
    largeDesktop?: number | string;
  };
  padding?: boolean;
  centered?: boolean;
}

export default function ResponsiveContainer({
  children,
  style,
  maxWidth,
  padding = true,
  centered = true,
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop, isLargeDesktop, width } = useResponsive();
  const spacing = useResponsiveSpacing();

  const getMaxWidth = () => {
    if (!maxWidth) {
      // Valores por defecto responsivos
      if (isMobile) return '100%';
      if (isTablet) return 768;
      if (isDesktop) return 1024;
      return 1200;
    }

    if (isLargeDesktop && maxWidth.largeDesktop) return maxWidth.largeDesktop;
    if (isDesktop && maxWidth.desktop) return maxWidth.desktop;
    if (isTablet && maxWidth.tablet) return maxWidth.tablet;
    return maxWidth.mobile || '100%';
  };

  const containerStyle: ViewStyle = {
    width: '100%',
    maxWidth: getMaxWidth(),
    ...(centered && { alignSelf: 'center' }),
    ...(padding && {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    }),
    ...style,
  };

  return <View style={containerStyle}>{children}</View>;
}