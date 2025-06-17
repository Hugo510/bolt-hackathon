import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useResponsive, useResponsiveSpacing } from '@/hooks/useResponsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    largeDesktop?: number;
  };
  gap?: number;
  style?: ViewStyle;
}

export default function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3, largeDesktop: 4 },
  gap,
  style,
}: ResponsiveGridProps) {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();
  const spacing = useResponsiveSpacing();

  const getColumns = () => {
    if (isLargeDesktop && columns.largeDesktop) return columns.largeDesktop;
    if (isDesktop && columns.desktop) return columns.desktop;
    if (isTablet && columns.tablet) return columns.tablet;
    return columns.mobile || 1;
  };

  const columnCount = getColumns();
  const gridGap = gap ?? spacing.md;

  const gridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -gridGap / 2,
    ...style,
  };

  const itemStyle: ViewStyle = {
    width: `${100 / columnCount}%`,
    paddingHorizontal: gridGap / 2,
    marginBottom: gridGap,
  };

  return (
    <View style={gridStyle}>
      {React.Children.map(children, (child, index) => (
        <View key={index} style={itemStyle}>
          {child}
        </View>
      ))}
    </View>
  );
}