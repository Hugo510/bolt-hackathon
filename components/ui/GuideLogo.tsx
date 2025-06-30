import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface GuideLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: any;
}

export default function GuideLogo({ 
  size = 'medium', 
  showText = true,
  style 
}: GuideLogoProps) {
  const { theme } = useTheme();
  
  const getSize = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'large':
        return 120;
      case 'medium':
      default:
        return 80;
    }
  };
  
  const logoSize = getSize();
  
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('@/assets/images/1.png')}
        style={{ width: logoSize, height: logoSize }}
        resizeMode="contain"
      />
      
      {showText && (
        <Text style={[
          styles.tagline, 
          { 
            color: theme.colors.text,
            fontSize: size === 'small' ? 12 : size === 'large' ? 18 : 14
          }
        ]}>
          Orientación vocacional para ti.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  tagline: {
    fontFamily: 'Inter_500Medium',
    marginTop: 8,
    textAlign: 'center',
  }
});