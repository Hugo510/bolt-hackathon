import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Dimensions } from 'react-native';
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
import AnimatedButton from '@/components/ui/AnimatedButton';
import NeumorphicCard from '@/components/ui/NeumorphicCard';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { theme } = useTheme();
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Fondo con gradiente */}
      <LinearGradient
        colors={[
          theme.colors.primary + '10',
          theme.colors.background,
          theme.colors.secondary + '05',
        ]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <AnimatedButton
            title=""
            onPress={() => router.back()}
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={24} color={theme.colors.text} />}
            style={styles.backButton}
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Bienvenido de vuelta
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Inicia sesión para continuar
          </Text>
        </View>

        {/* Formulario */}
        <Animated.View style={[styles.formContainer, animatedStyle]}>
          <NeumorphicCard style={styles.formCard}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
              <View style={[styles.inputWrapper, { borderColor: errors.email ? theme.colors.error : theme.colors.border }]}>
                <Mail size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@email.com"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Contraseña</Text>
              <View style={[styles.inputWrapper, { borderColor: errors.password ? theme.colors.error : theme.colors.border }]}>
                <Lock size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!showPassword}
                />
                <AnimatedButton
                  title=""
                  onPress={() => setShowPassword(!showPassword)}
                  variant="ghost"
                  size="sm"
                  icon={showPassword ? <EyeOff size={20} color={theme.colors.textMuted} /> : <Eye size={20} color={theme.colors.textMuted} />}
                  style={styles.eyeButton}
                />
              </View>
              {errors.password && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.password}</Text>}
            </View>

            <AnimatedButton
              title={loading ? 'Iniciando...' : 'Iniciar Sesión'}
              onPress={handleLogin}
              variant="gradient"
              size="lg"
              disabled={loading}
              style={styles.loginButton}
            />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                ¿No tienes cuenta?{' '}
              </Text>
              <AnimatedButton
                title="Regístrate"
                onPress={() => router.push('/(auth)/register')}
                variant="ghost"
                size="sm"
                textStyle={{ color: theme.colors.primary, fontSize: 16 }}
              />
            </View>
          </NeumorphicCard>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  formContainer: {
    flex: 1,
    padding: 24,
  },
  formCard: {
    padding: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  eyeButton: {
    padding: 0,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
});