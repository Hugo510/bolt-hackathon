import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  shadow: string;
  gradient: string[];
}

interface AccessibilityColors {
  highContrast: {
    text: string;
    background: string;
    border: string;
  };
  focus: string;
  selection: string;
}

interface ThemeContextType {
  theme: {
    colors: Colors & { accessibility: AccessibilityColors };
    borderRadius: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    typography: {
      body: {
        fontFamily: string;
      };
    };
    spacing: {
      touchTarget: number;
      minTouchTarget: number;
    };
    accessibility: {
      minContrastRatio: number;
      focusIndicatorWidth: number;
    };
  };
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  isHighContrast: boolean;
  toggleHighContrast: () => Promise<void>;
}

const lightColors: Colors = {
  primary: '#4338ca', // Mejorado contraste
  secondary: '#0891b2', // Mejorado contraste
  accent: '#d97706', // Mejorado contraste
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a', // Alto contraste
  textSecondary: '#475569', // Mejorado contraste
  textMuted: '#64748b', // Mejorado contraste
  border: '#e2e8f0',
  error: '#dc2626', // Alto contraste
  success: '#059669', // Alto contraste
  warning: '#d97706', // Alto contraste
  shadow: '#000000',
  gradient: ['#4338ca', '#7c3aed'],
};

const darkColors: Colors = {
  primary: '#6366f1', // Mejorado para modo oscuro
  secondary: '#06b6d4',
  accent: '#fbbf24',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc', // Alto contraste
  textSecondary: '#cbd5e1', // Mejorado contraste
  textMuted: '#94a3b8', // Mejorado contraste
  border: '#334155',
  error: '#f87171', // Mejorado para modo oscuro
  success: '#34d399',
  warning: '#fbbf24',
  shadow: '#000000',
  gradient: ['#6366f1', '#06b6d4'],
};

const highContrastLight: Colors = {
  ...lightColors,
  primary: '#000080', // Azul muy oscuro
  text: '#000000', // Negro puro
  textSecondary: '#333333', // Gris muy oscuro
  background: '#ffffff', // Blanco puro
  surface: '#ffffff',
  border: '#000000',
  error: '#cc0000', // Rojo muy oscuro
  success: '#006600', // Verde muy oscuro
};

const highContrastDark: Colors = {
  ...darkColors,
  primary: '#66b3ff', // Azul muy claro
  text: '#ffffff', // Blanco puro
  textSecondary: '#cccccc', // Gris muy claro
  background: '#000000', // Negro puro
  surface: '#000000',
  border: '#ffffff',
  error: '#ff6666', // Rojo muy claro
  success: '#66ff66', // Verde muy claro
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<Theme>('light');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar tema guardado al iniciar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        const savedHighContrast = await AsyncStorage.getItem('highContrast');

        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          setThemeMode(savedTheme as Theme);
        }
        if (savedHighContrast) {
          setIsHighContrast(JSON.parse(savedHighContrast));
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';

  const getColors = (): Colors => {
    if (isHighContrast) {
      return isDark ? highContrastDark : highContrastLight;
    }
    return isDark ? darkColors : lightColors;
  };

  const colors = getColors();

  const theme = {
    colors: {
      ...colors,
      accessibility: {
        highContrast: {
          text: isHighContrast ? (isDark ? '#ffffff' : '#000000') : colors.text,
          background: isHighContrast ? (isDark ? '#000000' : '#ffffff') : colors.background,
          border: isHighContrast ? (isDark ? '#ffffff' : '#000000') : colors.border,
        },
        focus: '#0066cc', // Color de enfoque accesible
        selection: isDark ? '#4338ca' : '#6366f1',
      },
    },
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
    },
    typography: {
      body: {
        fontFamily: 'Inter_400Regular',
      },
    },
    spacing: {
      touchTarget: 48, // Tamaño mínimo recomendado por WCAG
      minTouchTarget: 44, // Tamaño mínimo absoluto
    },
    accessibility: {
      minContrastRatio: 4.5, // WCAG AA
      focusIndicatorWidth: 3,
    },
  };

  const toggleTheme = async () => {
    console.log('🔴 toggleTheme INICIADO');
    console.log('🔴 themeMode actual:', themeMode);
    console.log('🔴 isDark actual:', isDark);

    try {
      const newTheme: Theme = themeMode === 'dark' ? 'light' : 'dark';
      console.log('🔴 Calculando nuevo tema:', newTheme);

      console.log('🔴 Ejecutando setThemeMode...');
      setThemeMode(newTheme);

      console.log('🔴 Guardando en AsyncStorage...');
      await AsyncStorage.setItem('theme', newTheme);

      console.log('🔴 ✅ Tema cambiado exitosamente a:', newTheme);
    } catch (error) {
      console.error('🔴 ❌ Error en toggleTheme:', error);
      // Revertir el cambio si hay error
      setThemeMode(themeMode);
    }
  };

  const toggleHighContrast = async () => {
    try {
      const newHighContrast = !isHighContrast;
      setIsHighContrast(newHighContrast);
      await AsyncStorage.setItem('highContrast', JSON.stringify(newHighContrast));
    } catch (error) {
      console.error('Error saving high contrast:', error);
      setIsHighContrast(isHighContrast);
    }
  };

  // No renderizar hasta que el tema se haya cargado
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark,
      toggleTheme,
      isHighContrast,
      toggleHighContrast
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}