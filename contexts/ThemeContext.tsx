import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

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

interface ThemeContextType {
  theme: {
    colors: Colors;
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
  };
  isDark: boolean;
  toggleTheme: () => void;
}

const lightColors: Colors = {
  primary: '#6366f1',
  secondary: '#06b6d4',
  accent: '#f59e0b',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  shadow: '#000000',
  gradient: ['#6366f1', '#8b5cf6'],
};

const darkColors: Colors = {
  primary: '#8b5cf6',
  secondary: '#06b6d4',
  accent: '#fbbf24',
  background: '#111827',
  surface: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  border: '#374151',
  error: '#f87171',
  success: '#34d399',
  warning: '#fbbf24',
  shadow: '#000000',
  gradient: ['#8b5cf6', '#06b6d4'],
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<Theme>('system');

  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';

  const theme = {
    colors: isDark ? darkColors : lightColors,
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
  };

  const toggleTheme = () => {
    setThemeMode(current => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
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