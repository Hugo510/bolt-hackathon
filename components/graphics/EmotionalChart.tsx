import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, Line, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface EmotionalDataPoint {
  emotion: string;
  value: number;
  color: string;
  date: string;
}

interface EmotionalChartProps {
  data: EmotionalDataPoint[];
  width?: number;
  height?: number;
  animated?: boolean;
  showGrid?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export default function EmotionalChart({
  data,
  width = screenWidth - 40,
  height = 200,
  animated = true,
  showGrid = true,
}: EmotionalChartProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progress.value = withDelay(300, withTiming(1, { duration: 1500 }));
    } else {
      progress.value = 1;
    }
  }, [animated]);

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Crear path para la línea del gráfico
  const createPath = () => {
    if (data.length === 0) return '';

    const stepX = chartWidth / (data.length - 1);
    let path = '';

    data.forEach((point, index) => {
      const x = padding + index * stepX;
      const y = padding + chartHeight - (point.value / 10) * chartHeight;
      
      if (index === 0) {
        path += `M${x},${y}`;
      } else {
        path += ` L${x},${y}`;
      }
    });

    return path;
  };

  const animatedPathProps = useAnimatedProps(() => {
    const pathLength = data.length * 50; // Aproximación de la longitud del path
    const strokeDasharray = pathLength;
    const strokeDashoffset = interpolate(progress.value, [0, 1], [pathLength, 0]);

    return {
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const renderGridLines = () => {
    if (!showGrid) return null;

    const lines = [];
    const stepY = chartHeight / 5;

    // Líneas horizontales
    for (let i = 0; i <= 5; i++) {
      const y = padding + i * stepY;
      lines.push(
        <Line
          key={`h-${i}`}
          x1={padding}
          y1={y}
          x2={padding + chartWidth}
          y2={y}
          stroke={theme.colors.border}
          strokeWidth="1"
          opacity="0.3"
        />
      );
    }

    // Líneas verticales
    const stepX = chartWidth / (data.length - 1);
    for (let i = 0; i < data.length; i++) {
      const x = padding + i * stepX;
      lines.push(
        <Line
          key={`v-${i}`}
          x1={x}
          y1={padding}
          x2={x}
          y2={padding + chartHeight}
          stroke={theme.colors.border}
          strokeWidth="1"
          opacity="0.3"
        />
      );
    }

    return lines;
  };

  const renderDataPoints = () => {
    const stepX = chartWidth / (data.length - 1);

    return data.map((point, index) => {
      const x = padding + index * stepX;
      const y = padding + chartHeight - (point.value / 10) * chartHeight;

      return (
        <AnimatedCircle
          key={index}
          cx={x}
          cy={y}
          r="6"
          fill={point.color}
          stroke="#FFFFFF"
          strokeWidth="2"
          animatedProps={useAnimatedProps(() => ({
            opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]),
            r: interpolate(progress.value, [0, 1], [0, 6]),
          }))}
        />
      );
    });
  };

  const renderLabels = () => {
    const stepX = chartWidth / (data.length - 1);

    return data.map((point, index) => {
      const x = padding + index * stepX;
      
      return (
        <SvgText
          key={index}
          x={x}
          y={height - 10}
          textAnchor="middle"
          fontSize="12"
          fill={theme.colors.textMuted}
        >
          {point.emotion.slice(0, 3)}
        </SvgText>
      );
    });
  };

  const renderYAxisLabels = () => {
    const labels = [];
    const stepY = chartHeight / 5;

    for (let i = 0; i <= 5; i++) {
      const y = padding + chartHeight - i * stepY;
      const value = (i * 2).toString();
      
      labels.push(
        <SvgText
          key={i}
          x={padding - 10}
          y={y + 4}
          textAnchor="end"
          fontSize="12"
          fill={theme.colors.textMuted}
        >
          {value}
        </SvgText>
      );
    }

    return labels;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Tendencia Emocional
      </Text>
      
      <Svg width={width} height={height}>
        {renderGridLines()}
        {renderYAxisLabels()}
        {renderLabels()}
        
        <AnimatedPath
          d={createPath()}
          stroke={theme.colors.primary}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={animatedPathProps}
        />
        
        {renderDataPoints()}
      </Svg>
      
      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
          Escala: 0-10 (Intensidad emocional)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 16,
  },
  legend: {
    marginTop: 8,
    alignItems: 'center',
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});