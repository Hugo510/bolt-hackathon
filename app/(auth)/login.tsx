import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive, useResponsiveSpacing, useResponsiveFontSize } from '@/hooks/useResponsive';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';
import AnimatedButton from '@/components/ui/AnimatedButton';
import NeumorphicCard from '@/components/ui/NeumorphicCard';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { theme, isDark } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fontSize = useResponsiveFontSize();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useState(() => {
    translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 800 });
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      Alert.alert('Error', 'Email o contraseña incorrectos');
    } else {
      router.replace('/(tabs)');
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
      minHeight: isMobile ? 'auto' : 400,
    },
    formCard: {
      padding: isMobile ? spacing.lg : spacing.xl,
      margin: spacing.md,
    },
    inputContainer: {
      marginBottom: spacing.lg,
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
    loginButton: {
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
            <View style={responsiveStyles.header}>
              <AnimatedButton
                title=""
                onPress={() => router.back()}
                variant="ghost"
                size="sm"
                icon={<ArrowLeft size={24} color={theme.colors.text} />}
                style={responsiveStyles.backButton}
              />
              <Text style={responsiveStyles.title}>Iniciar Sesión</Text>
              <Text style={responsiveStyles.subtitle}>
                Ingresa a tu cuenta para continuar
              </Text>
            </View>

            {/* Formulario */}
            <Animated.View style={[responsiveStyles.formContainer, animatedStyle]}>
              <NeumorphicCard style={responsiveStyles.formCard}>
                <View style={responsiveStyles.inputContainer}>
                  <Text style={responsiveStyles.label}>Email</Text>
                  <View style={[
                    responsiveStyles.inputWrapper, 
                    { borderColor: errors.email ? theme.colors.error : theme.colors.border }
                  ]}>
                    <Mail size={20} color={theme.colors.textMuted} style={responsiveStyles.inputIcon} />
                    <TextInput
                      style={responsiveStyles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="tu@email.com"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                  {errors.email && <Text style={responsiveStyles.errorText}>{errors.email}</Text>}
                </View>

                <View style={responsiveStyles.inputContainer}>
                  <Text style={responsiveStyles.label}>Contraseña</Text>
                  <View style={[
                    responsiveStyles.inputWrapper, 
                    { borderColor: errors.password ? theme.colors.error : theme.colors.border }
                  ]}>
                    <Lock size={20} color={theme.colors.textMuted} style={responsiveStyles.inputIcon} />
                    <TextInput
                      style={responsiveStyles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                    />
                    <AnimatedButton
                      title=""
                      onPress={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                      icon={showPassword ? <EyeOff size={20} color={theme.colors.textMuted} /> : <Eye size={20} color={theme.colors.textMuted} />}
                      style={responsiveStyles.eyeButton}
                    />
                  </View>
                  {errors.password && <Text style={responsiveStyles.errorText}>{errors.password}</Text>}
                </View>

                <AnimatedButton
                  title={loading ? 'Iniciando...' : 'Iniciar Sesión'}
                  onPress={handleLogin}
                  variant="gradient"
                  size="lg"
                  disabled={loading}
                  style={responsiveStyles.loginButton}
                />

                <View style={responsiveStyles.footer}>
                  <Text style={responsiveStyles.footerText}>¿No tienes cuenta?</Text>
                  <AnimatedButton
                    title="Regístrate"
                    onPress={() => router.push('/(auth)/register')}
                    variant="ghost"
                    size="sm"
                    textStyle={{ color: theme.colors.primary, fontSize: fontSize.md }}
                  />
                </View>
              </NeumorphicCard>
            </Animated.View>
          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}