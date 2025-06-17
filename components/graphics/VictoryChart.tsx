import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryTheme } from 'victory-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ChartDataPoint {
  x: string | number;
  y: number;
}

interface VictoryChartProps {
  data: ChartDataPoint[];
  title?: string;
  type?: 'line' | 'area';
  width?: number;
  height?: number;
  color?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function VictoryChartComponent({
  data,
  title,
  type = 'line',
  width = screenWidth - 40,
  height = 200,
  color,
}: VictoryChartProps) {
  const { theme } = useTheme();
  const chartColor = color || theme.colors.primary;

  const customTheme = {
    ...VictoryTheme.material,
    axis: {
      style: {
        axis: { stroke: theme.colors.border },
        axisLabel: { fontSize: 12, fill: theme.colors.textMuted },
        grid: { stroke: theme.colors.border, strokeOpacity: 0.3 },
        ticks: { stroke: theme.colors.border },
        tickLabels: { fontSize: 10, fill: theme.colors.textMuted },
      },
    },
  };

  const renderChart = () => {
    if (type === 'area') {
      return (
        <VictoryArea
          data={data}
          style={{
            data: { 
              fill: chartColor, 
              fillOpacity: 0.3,
              stroke: chartColor,
              strokeWidth: 2,
            },
          }}
          animate={{
            duration: 1000,
            onLoad: { duration: 500 },
          }}
        />
      );
    }

    return (
      <VictoryLine
        data={data}
        style={{
          data: { 
            stroke: chartColor,
            strokeWidth: 3,
          },
        }}
        animate={{
          duration: 1000,
          onLoad: { duration: 500 },
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
      )}
      
      <VictoryChart
        theme={customTheme}
        width={width}
        height={height}
        padding={{ left: 50, top: 20, right: 20, bottom: 50 }}
      >
        <VictoryAxis dependentAxis />
        <VictoryAxis />
        {renderChart()}
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 16,
  },
});