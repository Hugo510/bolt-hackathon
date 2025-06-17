import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, Type, Contrast, Volume2, Vibrate } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import AccessibleButton from './AccessibleButton';
import AccessibleText from './AccessibleText';

interface AccessibilitySettingsProps {
  onClose?: () => void;
}

export default function AccessibilitySettings({ onClose }: AccessibilitySettingsProps) {
  const { theme, isDark, toggleTheme, isHighContrast, toggleHighContrast } = useTheme();

  const settings = [
    {
      id: 'high-contrast',
      title: 'Alto Contraste',
      description: 'Mejora la visibilidad con colores de alto contraste',
      icon: Contrast,
      value: isHighContrast,
      onToggle: toggleHighContrast,
    },
    {
      id: 'dark-mode',
      title: 'Modo Oscuro',
      description: 'Reduce la fatiga visual en entornos con poca luz',
      icon: Eye,
      value: isDark,
      onToggle: toggleTheme,
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    content: {
      flex: 1,
      padding: 24,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginBottom: 12,
      minHeight: theme.spacing.touchTarget,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    settingContent: {
      flex: 1,
      marginRight: 16,
    },
    settingTitle: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    footer: {
      padding: 24,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    infoBox: {
      backgroundColor: theme.colors.primary + '10',
      borderRadius: theme.borderRadius.md,
      padding: 16,
      marginBottom: 24,
    },
    infoText: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.primary,
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AccessibleText variant="heading" weight="bold">
          Configuración de Accesibilidad
        </AccessibleText>
        <AccessibleText variant="body" color="secondary">
          Personaliza la aplicación para una mejor experiencia
        </AccessibleText>
      </View>

      <View style={styles.content}>
        <View style={styles.infoBox}>
          <AccessibleText variant="caption" style={styles.infoText}>
            💡 Estas configuraciones mejoran la accesibilidad y usabilidad de la aplicación según tus necesidades.
          </AccessibleText>
        </View>

        {settings.map((setting) => (
          <TouchableOpacity
            key={setting.id}
            style={styles.settingItem}
            onPress={setting.onToggle}
            accessible={true}
            accessibilityRole="switch"
            accessibilityLabel={setting.title}
            accessibilityHint={setting.description}
            accessibilityState={{ checked: setting.value }}
          >
            <View style={styles.settingIcon}>
              <setting.icon size={20} color={theme.colors.primary} />
            </View>
            
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
            
            <Switch
              value={setting.value}
              onValueChange={setting.onToggle}
              trackColor={{ 
                false: theme.colors.border, 
                true: theme.colors.primary + '40' 
              }}
              thumbColor={setting.value ? theme.colors.primary : theme.colors.surface}
              accessible={false} // El TouchableOpacity padre maneja la accesibilidad
            />
          </TouchableOpacity>
        ))}

        <View style={styles.infoBox}>
          <AccessibleText variant="caption" style={styles.infoText}>
            ℹ️ Los botones tienen un tamaño mínimo de 44x44 puntos para facilitar la interacción. El contraste de colores cumple con las pautas WCAG AA.
          </AccessibleText>
        </View>
      </View>

      {onClose && (
        <View style={styles.footer}>
          <AccessibleButton
            title="Cerrar"
            onPress={onClose}
            variant="primary"
            size="lg"
            accessibilityHint="Cierra la configuración de accesibilidad"
          />
        </View>
      )}
    </SafeAreaView>
  );
}