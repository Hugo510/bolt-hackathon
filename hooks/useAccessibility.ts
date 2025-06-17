import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

interface AccessibilityState {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  isInvertColorsEnabled: boolean;
  prefersCrossFadeTransitions: boolean;
}

export function useAccessibility() {
  const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isReduceTransparencyEnabled: false,
    isBoldTextEnabled: false,
    isGrayscaleEnabled: false,
    isInvertColorsEnabled: false,
    prefersCrossFadeTransitions: false,
  });

  useEffect(() => {
    // Verificar estado inicial
    const checkAccessibilitySettings = async () => {
      try {
        const [
          screenReader,
          reduceMotion,
          reduceTransparency,
          boldText,
          grayscale,
          invertColors,
        ] = await Promise.all([
          AccessibilityInfo.isScreenReaderEnabled(),
          AccessibilityInfo.isReduceMotionEnabled(),
          AccessibilityInfo.isReduceTransparencyEnabled(),
          AccessibilityInfo.isBoldTextEnabled(),
          AccessibilityInfo.isGrayscaleEnabled(),
          AccessibilityInfo.isInvertColorsEnabled(),
        ]);

        setAccessibilityState({
          isScreenReaderEnabled: screenReader,
          isReduceMotionEnabled: reduceMotion,
          isReduceTransparencyEnabled: reduceTransparency,
          isBoldTextEnabled: boldText,
          isGrayscaleEnabled: grayscale,
          isInvertColorsEnabled: invertColors,
          prefersCrossFadeTransitions: reduceMotion, // Usar transiciones más suaves si reduce motion está activo
        });
      } catch (error) {
        console.warn('Error checking accessibility settings:', error);
      }
    };

    checkAccessibilitySettings();

    // Listeners para cambios en configuración de accesibilidad
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled) => {
        setAccessibilityState(prev => ({ ...prev, isScreenReaderEnabled: isEnabled }));
      }
    );

    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled) => {
        setAccessibilityState(prev => ({ 
          ...prev, 
          isReduceMotionEnabled: isEnabled,
          prefersCrossFadeTransitions: isEnabled,
        }));
      }
    );

    const boldTextListener = AccessibilityInfo.addEventListener(
      'boldTextChanged',
      (isEnabled) => {
        setAccessibilityState(prev => ({ ...prev, isBoldTextEnabled: isEnabled }));
      }
    );

    return () => {
      screenReaderListener?.remove();
      reduceMotionListener?.remove();
      boldTextListener?.remove();
    };
  }, []);

  return {
    ...accessibilityState,
    // Funciones de utilidad
    shouldReduceAnimations: accessibilityState.isReduceMotionEnabled,
    shouldUseBoldText: accessibilityState.isBoldTextEnabled,
    shouldUseHighContrast: accessibilityState.isInvertColorsEnabled || accessibilityState.isGrayscaleEnabled,
    isUsingAssistiveTechnology: accessibilityState.isScreenReaderEnabled,
  };
}

// Hook para anunciar cambios a lectores de pantalla
export function useScreenReaderAnnouncement() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    AccessibilityInfo.announceForAccessibility(message);
  };

  return { announce };
}

// Hook para verificar si un elemento está enfocado
export function useFocusManagement() {
  const setAccessibilityFocus = (reactTag: number) => {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  };

  return { setAccessibilityFocus };
}