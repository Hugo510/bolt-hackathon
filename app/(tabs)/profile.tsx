import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsive, useResponsiveSpacing, useResponsiveFontSize } from '@/hooks/useResponsive';
import { User } from 'lucide-react-native';
import AnimatedButton from '@/components/ui/AnimatedButton';
import BoltBadge from '@/components/ui/BoltBadge';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const { isMobile } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fontSize = useResponsiveFontSize();

  const handleSignOut = async () => {
    await signOut();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    icon: {
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: fontSize.xxl,
      fontFamily: 'Inter_700Bold',
      color: theme.colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    email: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.primary,
      marginBottom: spacing.xl,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <User size={isMobile ? 64 : 80} color={theme.colors.accent} />
        </View>
        <Text style={styles.title}>Mi Perfil</Text>
        <Text style={styles.subtitle}>
          Gestiona tu cuenta y preferencias personales.
        </Text>
        {user?.email && (
          <Text style={styles.email}>{user.email}</Text>
        )}
        <AnimatedButton
          title="Cerrar Sesión"
          onPress={handleSignOut}
          variant="secondary"
          size="md"
        />
      </View>
      
      {/* Built with Bolt.new badge */}
      <BoltBadge position="bottom-left" size="small" />
    </SafeAreaView>
  );
}