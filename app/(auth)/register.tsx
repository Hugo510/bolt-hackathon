import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive, useResponsiveSpacing, useResponsiveFontSize } from '@/hooks/useResponsive';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';
import AnimatedButton from '@/components/ui/AnimatedButton';
import NeumorphicCard from '@/components/ui/NeumorphicCard';
import FadeInView from '@/components/animations/FadeInView';
import SlideInView from '@/components/animations/SlideInView';
import StaggeredList from '@/components/animations/StaggeredList';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { theme, isDark } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fontSize = useResponsiveFontSize();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }
    
    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      Alert.alert('Error', error.message || 'Error al crear la cuenta');
    } else {
      Alert.alert(
        'Cuenta creada',
        'Tu cuenta ha sido creada exitosamente.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    }
    setLoading(false);
  };

  // Estilos responsivos dinámicos
  const responsiveStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: spacing.xl,
    },
    header: {
      padding: spacing.md,
      paddingTop: spacing.sm,
    },
    backButton: {
      alignSelf: 'flex-start',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: isMobile ? fontSize.xxxl : fontSize.display,
      fontFamily: 'Inter_700Bold',
      marginBottom: spacing.xs,
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
    },
    formContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    formCard: {
      padding: isMobile ? spacing.lg : spacing.xl,
      margin: spacing.md,
    },
    inputContainer: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_600SemiBold',
      marginBottom: spacing.sm,
      color: theme.colors.text,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderRadius: 16,
      paddingHorizontal: spacing.md,
      height: isMobile ? 56 : 64,
      backgroundColor: theme.colors.surface,
    },
    inputIcon: {
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: fontSize.md,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.text,
    },
    eyeButton: {
      padding: spacing.xs,
      marginLeft: spacing.sm,
    },
    errorText: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_400Regular',
      marginTop: spacing.xs,
      color: theme.colors.error,
    },
    registerButton: {
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },
    footer: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.xs,
    },
    footerText: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
    },
  });

  const inputFields = [
    {
      label: 'Nombre Completo',
      value: fullName,
      onChangeText: setFullName,
      placeholder: 'Tu nombre completo',
      icon: User,
      error: errors.fullName,
      autoComplete: 'name' as const,
    },
    {
      label: 'Email',
      value: email,
      onChangeText: setEmail,
      placeholder: 'tu@email.com',
      icon: Mail,
      error: errors.email,
      keyboardType: 'email-address' as const,
      autoCapitalize: 'none' as const,
      autoComplete: 'email' as const,
    },
    {
      label: 'Contraseña',
      value: password,
      onChangeText: setPassword,
      placeholder: '••••••••',
      icon: Lock,
      error: errors.password,
      secureTextEntry: !showPassword,
      showPassword,
      togglePassword: () => setShowPassword(!showPassword),
      autoComplete: 'new-password' as const,
    },
    {
      label: 'Confirmar Contraseña',
      value: confirmPassword,
      onChangeText: setConfirmPassword,
      placeholder: '••••••••',
      icon: Lock,
      error: errors.confirmPassword,
      secureTextEntry: !showConfirmPassword,
      showPassword: showConfirmPassword,
      togglePassword: () => setShowConfirmPassword(!showConfirmPassword),
      autoComplete: 'new-password' as const,
    },
  ];

  return (
    <View style={responsiveStyles.container}>
      {/* Fondo con gradiente */}
      <LinearGradient
        colors={isDark 
          ? [theme.colors.background, theme.colors.surface, theme.colors.background]
          : [theme.colors.primary + '10', theme.colors.background, theme.colors.secondary + '05']
        }
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={responsiveStyles.safeArea}>
        <ScrollView 
          contentContainerStyle={responsiveStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ResponsiveContainer maxWidth={{ mobile: '100%', tablet: 500, desktop: 600 }}>
            {/* Header */}
            <SlideInView delay={0} direction="down">
              <View style={responsiveStyles.header}>
                <AnimatedButton
                  title=""
                  onPress={() => router.back()}
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeft size={24} color={theme.colors.text} />}
                  style={responsiveStyles.backButton}
                />
                <FadeInView delay={200}>
                  <Text style={responsiveStyles.title}>Crear Cuenta</Text>
                  <Text style={responsiveStyles.subtitle}>
                    Únete a nuestra comunidad
                  </Text>
                </FadeInView>
              </View>
            </SlideInView>

            {/* Formulario */}
            <SlideInView delay={400} direction="up">
              <View style={responsiveStyles.formContainer}>
                <NeumorphicCard style={responsiveStyles.formCard}>
                  <StaggeredList staggerDelay={100} initialDelay={600}>
                    {inputFields.map((field, index) => (
                      <View key={index} style={responsiveStyles.inputContainer}>
                        <Text style={responsiveStyles.label}>{field.label}</Text>
                        <View style={[
                          responsiveStyles.inputWrapper, 
                          { borderColor: field.error ? theme.colors.error : theme.colors.border }
                        ]}>
                          <field.icon size={20} color={theme.colors.textMuted} style={responsiveStyles.inputIcon} />
                          <TextInput
                            style={responsiveStyles.input}
                            value={field.value}
                            onChangeText={field.onChangeText}
                            placeholder={field.placeholder}
                            placeholderTextColor={theme.colors.textMuted}
                            keyboardType={field.keyboardType}
                            autoCapitalize={field.autoCapitalize}
                            autoComplete={field.autoComplete}
                            secureTextEntry={field.secureTextEntry}
                          />
                          {field.togglePassword && (
                            <AnimatedButton
                              title=""
                              onPress={field.togglePassword}
                              variant="ghost"
                              size="sm"
                              icon={field.showPassword ? <EyeOff size={20} color={theme.colors.textMuted} /> : <Eye size={20} color={theme.colors.textMuted} />}
                              style={responsiveStyles.eyeButton}
                            />
                          )}
                        </View>
                        {field.error && <Text style={responsiveStyles.errorText}>{field.error}</Text>}
                      </View>
                    ))}
                  </StaggeredList>

                  <FadeInView delay={1200}>
                    <AnimatedButton
                      title={loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                      onPress={handleRegister}
                      variant="gradient"
                      size="lg"
                      disabled={loading}
                      style={responsiveStyles.registerButton}
                    />
                  </FadeInView>

                  <FadeInView delay={1300}>
                    <View style={responsiveStyles.footer}>
                      <Text style={responsiveStyles.footerText}>¿Ya tienes cuenta?</Text>
                      <AnimatedButton
                        title="Inicia sesión"
                        onPress={() => router.push('/(auth)/login')}
                        variant="ghost"
                        size="sm"
                        textStyle={{ color: theme.colors.primary, fontSize: fontSize.md }}
                      />
                    </View>
                  </FadeInView>
                </NeumorphicCard>
              </View>
            </SlideInView>
          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}