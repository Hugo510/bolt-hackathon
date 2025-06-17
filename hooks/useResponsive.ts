import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  largeDesktop: number;
}

interface ResponsiveValues {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  scale: number;
  fontScale: number;
}

const breakpoints: ResponsiveBreakpoints = {
  mobile: 480,
  tablet: 1024,
  desktop: 1440,
  largeDesktop: 1920,
};

export function useResponsive(): ResponsiveValues {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height, scale, fontScale } = Dimensions.get('window');
    return { width, height, scale, fontScale };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height,
        scale: window.scale,
        fontScale: window.fontScale,
      });
    });

    return () => subscription?.remove();
  }, []);

  const { width, height, scale, fontScale } = dimensions;

  return {
    isMobile: width <= breakpoints.mobile,
    isTablet: width > breakpoints.mobile && width <= breakpoints.tablet,
    isDesktop: width > breakpoints.tablet && width <= breakpoints.desktop,
    isLargeDesktop: width > breakpoints.desktop,
    width,
    height,
    orientation: width > height ? 'landscape' : 'portrait',
    scale,
    fontScale,
  };
}

export function useResponsiveValue<T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
  largeDesktop?: T;
}): T {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();

  if (isLargeDesktop && values.largeDesktop !== undefined) {
    return values.largeDesktop;
  }
  if (isDesktop && values.desktop !== undefined) {
    return values.desktop;
  }
  if (isTablet && values.tablet !== undefined) {
    return values.tablet;
  }
  return values.mobile;
}

export function useResponsiveSpacing() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const spacing = {
    xs: isMobile ? 4 : isTablet ? 6 : 8,
    sm: isMobile ? 8 : isTablet ? 12 : 16,
    md: isMobile ? 16 : isTablet ? 20 : 24,
    lg: isMobile ? 24 : isTablet ? 32 : 40,
    xl: isMobile ? 32 : isTablet ? 48 : 64,
    xxl: isMobile ? 48 : isTablet ? 64 : 80,
  };

  return spacing;
}

export function useResponsiveFontSize() {
  const { isMobile, isTablet, fontScale } = useResponsive();

  const baseSizes = {
    xs: isMobile ? 12 : isTablet ? 13 : 14,
    sm: isMobile ? 14 : isTablet ? 15 : 16,
    md: isMobile ? 16 : isTablet ? 17 : 18,
    lg: isMobile ? 18 : isTablet ? 20 : 22,
    xl: isMobile ? 20 : isTablet ? 24 : 28,
    xxl: isMobile ? 24 : isTablet ? 28 : 32,
    xxxl: isMobile ? 28 : isTablet ? 32 : 36,
    display: isMobile ? 32 : isTablet ? 40 : 48,
  };

  // Aplicar factor de escala del sistema
  const scaledSizes = Object.fromEntries(
    Object.entries(baseSizes).map(([key, value]) => [
      key,
      Math.round(value * Math.min(fontScale, 1.3)), // Limitar escala máxima
    ])
  );

  return scaledSizes;
}