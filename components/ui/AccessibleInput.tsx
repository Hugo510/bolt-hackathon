import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface AccessibleInputProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: React.ReactNode;
  containerStyle?: any;
  inputStyle?: any;
}

export default function AccessibleInput({
  label,
  error,
  hint,
  required = false,
  icon,
  containerStyle,
  inputStyle,
  ...textInputProps
}: AccessibleInputProps) {
  const { theme, isHighContrast } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    labelContainer: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    label: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: isHighContrast 
        ? theme.colors.accessibility.highContrast.text 
        : theme.colors.text,
    },
    required: {
      color: theme.colors.error,
      marginLeft: 4,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: isHighContrast ? 3 : 2,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: 16,
      minHeight: theme.spacing.touchTarget,
      backgroundColor: isHighContrast 
        ? theme.colors.accessibility.highContrast.background 
        : theme.colors.surface,
      borderColor: error 
        ? theme.colors.error 
        : isFocused 
          ? (isHighContrast ? theme.colors.accessibility.focus : theme.colors.primary)
          : (isHighContrast ? theme.colors.accessibility.highContrast.border : theme.colors.border),
    },
    icon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      color: isHighContrast 
        ? theme.colors.accessibility.highContrast.text 
        : theme.colors.text,
      paddingVertical: 12,
      // Mejorar legibilidad
      letterSpacing: 0.25,
    },
    hint: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: isHighContrast 
        ? theme.colors.accessibility.highContrast.text 
        : theme.colors.textMuted,
      marginTop: 4,
    },
    error: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.error,
      marginTop: 4,
    },
  });

  const inputId = `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}>*</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[styles.input, inputStyle]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessible={true}
          accessibilityLabel={label}
          accessibilityHint={hint}
          accessibilityRequired={required}
          accessibilityInvalid={!!error}
          accessibilityDescribedBy={[errorId, hintId].filter(Boolean).join(' ')}
          placeholderTextColor={isHighContrast 
            ? theme.colors.accessibility.highContrast.text + '80'
            : theme.colors.textMuted
          }
          {...textInputProps}
        />
      </View>
      
      {hint && !error && (
        <Text 
          style={styles.hint}
          accessible={true}
          accessibilityRole="text"
          nativeID={hintId}
        >
          {hint}
        </Text>
      )}
      
      {error && (
        <Text 
          style={styles.error}
          accessible={true}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          nativeID={errorId}
        >
          {error}
        </Text>
      )}
    </View>
  );
}