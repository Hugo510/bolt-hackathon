import React from 'react';
import { ScrollView, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

interface ParallaxScrollViewProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  headerHeight?: number;
  showGradientOverlay?: boolean;
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function ParallaxScrollView({
  children,
  headerContent,
  headerHeight = HEADER_HEIGHT,
  showGradientOverlay = true,
}: ParallaxScrollViewProps) {
  const { theme } = useTheme();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, headerHeight],
      [0, -headerHeight / 2],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [-headerHeight, 0],
      [1.5, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, headerHeight / 2],
      [0, 0.7],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header parallax */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: headerHeight,
            zIndex: 1,
          },
          headerAnimatedStyle,
        ]}
      >
        {headerContent}
        
        {showGradientOverlay && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
              overlayAnimatedStyle,
            ]}
          >
            <LinearGradient
              colors={['transparent', theme.colors.background]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        )}
      </Animated.View>

      {/* Scrollable content */}
      <AnimatedScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight,
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={{
          backgroundColor: theme.colors.background,
          minHeight: SCREEN_HEIGHT - headerHeight,
          borderTopLeftRadius: theme.borderRadius.xl,
          borderTopRightRadius: theme.borderRadius.xl,
          marginTop: -theme.borderRadius.xl,
        }}>
          {children}
        </View>
      </AnimatedScrollView>
    </View>
  );
}