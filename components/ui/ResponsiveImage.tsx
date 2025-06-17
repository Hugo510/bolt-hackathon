import React, { useState } from 'react';
import { Image, View, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveImageProps {
  source: { uri: string };
  aspectRatio?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  borderRadius?: number;
  placeholder?: React.ReactNode;
}

export default function ResponsiveImage({
  source,
  aspectRatio = 16 / 9,
  style,
  imageStyle,
  resizeMode = 'cover',
  borderRadius = 0,
  placeholder,
}: ResponsiveImageProps) {
  const { width: screenWidth, isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const containerStyle: ViewStyle = {
    width: '100%',
    aspectRatio,
    borderRadius,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    ...style,
  };

  const finalImageStyle: ImageStyle = {
    width: '100%',
    height: '100%',
    ...imageStyle,
  };

  if (error && placeholder) {
    return <View style={containerStyle}>{placeholder}</View>;
  }

  return (
    <View style={containerStyle}>
      {loading && placeholder && (
        <View style={StyleSheet.absoluteFill}>{placeholder}</View>
      )}
      <Image
        source={source}
        style={finalImageStyle}
        resizeMode={resizeMode}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </View>
  );
}