import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface BoltBadgeProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  size?: 'small' | 'medium' | 'large';
}

export default function BoltBadge({ 
  position = 'bottom-right',
  size = 'medium'
}: BoltBadgeProps) {
  const { theme, isDark } = useTheme();
  
  const handlePress = () => {
    Linking.openURL('https://bolt.new');
  };
  
  const getPositionStyle = () => {
    switch (position) {
      case 'bottom-left':
        return { bottom: 16, left: 16 };
      case 'top-left':
        return { top: 16, left: 16 };
      case 'top-right':
        return { top: 16, right: 16 };
      case 'bottom-right':
      default:
        return { bottom: 16, right: 16 };
    }
  };
  
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { 
          paddingHorizontal: 8, 
          paddingVertical: 4, 
          borderRadius: 12,
          fontSize: 10
        };
      case 'large':
        return { 
          paddingHorizontal: 16, 
          paddingVertical: 8, 
          borderRadius: 20,
          fontSize: 14
        };
      case 'medium':
      default:
        return { 
          paddingHorizontal: 12, 
          paddingVertical: 6, 
          borderRadius: 16,
          fontSize: 12
        };
    }
  };
  
  const sizeStyle = getSizeStyle();
  
  return (
    <TouchableOpacity
      style={[
        styles.badge,
        getPositionStyle(),
        {
          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
          borderColor: theme.colors.primary,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
          borderRadius: sizeStyle.borderRadius,
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.text, 
        { 
          color: theme.colors.primary,
          fontSize: sizeStyle.fontSize
        }
      ]}>
        Built with <Text style={styles.bold}>Bolt.new</Text> ⚡
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontFamily: 'Inter_400Regular',
  },
  bold: {
    fontFamily: 'Inter_600SemiBold',
  }
});