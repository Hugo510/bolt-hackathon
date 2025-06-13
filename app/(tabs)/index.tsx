import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/useUser';
import { useUserProgressStore } from '@/stores/userProgressStore';
import { useTheme } from '@/contexts/ThemeContext';
import { Brain, Users, MessageCircle, BookOpen, Award, LogOut, TrendingUp, Zap, Target, Calendar } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import AnimatedButton from '@/components/ui/AnimatedButton';
import NeumorphicCard from '@/components/ui/NeumorphicCard';
import ParallaxScrollView from '@/components/ui/ParallaxScrollView';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

dayjs.locale('es');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const QuickActionCard = ({ 
  icon, 
  title, 
  description, 
  onPress, 
  color,
  index 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  color: string;
  index: number;
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(
      index * 100,
      withSpring(1, { damping: 15, stiffness: 100 })
    );
    opacity.value = withDelay(
      index * 100,
      withTiming(1, { duration: 600 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <NeumorphicCard style={[styles.actionCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
        <AnimatedButton
          title=""
          onPress={onPress}
          variant="ghost"
          style={styles.actionCardButton}
        >
          <View style={styles.actionCardContent}>
            <View style={[styles.actionIconContainer, { backgroundColor: color + '20' }]}>
              {icon}
            </View>
            <View style={styles.actionCardText}>
              <Text style={[styles.actionCardTitle, { color: theme.colors.text }]}>{title}</Text>
              <Text style={[styles.actionCardDescription, { color: theme.colors.textSecondary }]}>{description}</Text>
            </View>
          </View>
        </AnimatedButton>
      </NeumorphicCard>
    </Animated.View>
  );
};

const ProgressCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color,
  index 
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  index: number;
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(0);
  const progress = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(
      index * 150,
      withSpring(1, { damping: 15, stiffness: 100 })
    );
    progress.value = withDelay(
      index * 150 + 300,
      withTiming(1, { duration: 800 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [0, 1]) }],
    opacity: progress.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <NeumorphicCard style={styles.progressCard}>
        <Animated.View style={[styles.progressIcon, { backgroundColor: color + '20' }, progressStyle]}>
          {icon}
        </Animated.View>
        <Text style={[styles.progressValue, { color: theme.colors.text }]}>{value}</Text>
        <Text style={[styles.progressTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.progressSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
      </NeumorphicCard>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { data: user } = useUser();
  const progress = useUserProgressStore();
  const { theme, isDark, toggleTheme } = useTheme();

  const headerOpacity = useSharedValue(1);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)');
  };

  const quickActions = [
    {
      icon: <Brain size={24} color="#6366f1" />,
      title: 'Test Vocacional',
      description: 'Descubre tu carrera ideal',
      onPress: () => router.push('/(tabs)/test'),
      color: '#6366f1',
    },
    {
      icon: <Users size={24} color="#06b6d4" />,
      title: 'Mentores',
      description: 'Conecta con profesionales',
      onPress: () => router.push('/(tabs)/mentors'),
      color: '#06b6d4',
    },
    {
      icon: <MessageCircle size={24} color="#10b981" />,
      title: 'Apoyo Emocional',
      description: 'Chat con IA especializada',
      onPress: () => router.push('/(tabs)/chat'),
      color: '#10b981',
    },
    {
      icon: <BookOpen size={24} color="#f59e0b" />,
      title: 'Recursos',
      description: 'Cursos y material educativo',
      onPress: () => router.push('/(tabs)/resources'),
      color: '#f59e0b',
    },
  ];

  const progressStats = [
    {
      title: 'Nivel',
      value: progress.currentLevel,
      subtitle: `${progress.experiencePoints} XP`,
      icon: <TrendingUp size={20} color="#6366f1" />,
      color: '#6366f1',
    },
    {
      title: 'Tests',
      value: progress.testsCompleted,
      subtitle: 'Completados',
      icon: <Brain size={20} color="#10b981" />,
      color: '#10b981',
    },
    {
      title: 'Sesiones',
      value: progress.sessionsAttended,
      subtitle: 'Mentorías',
      icon: <Users size={20} color="#06b6d4" />,
      color: '#06b6d4',
    },
    {
      title: 'Racha',
      value: progress.streakDays,
      subtitle: 'Días',
      icon: <Award size={20} color="#f59e0b" />,
      color: '#f59e0b',
    },
  ];

  const HeaderContent = () => (
    <LinearGradient
      colors={theme.colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Image
                source={{ 
                  uri: user?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' 
                }}
                style={styles.avatarImage}
              />
            </View>
            <View>
              <Text style={styles.greeting}>
                ¡Hola, {dayjs().format('dddd')}!
              </Text>
              <Text style={styles.userName}>
                {user?.full_name || 'Usuario'}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <AnimatedButton
              title=""
              onPress={toggleTheme}
              variant="ghost"
              size="sm"
              icon={isDark ? <Zap size={20} color="white" /> : <Target size={20} color="white" />}
              style={styles.headerButton}
            />
            <AnimatedButton
              title=""
              onPress={handleSignOut}
              variant="ghost"
              size="sm"
              icon={<LogOut size={20} color="white" />}
              style={styles.headerButton}
            />
          </View>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Tu futuro profesional te espera</Text>
          <Text style={styles.heroSubtitle}>
            Explora carreras, conecta con mentores y construye el camino hacia tus sueños
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ParallaxScrollView
        headerContent={<HeaderContent />}
        headerHeight={300}
        showGradientOverlay={true}
      >
        {/* Progress Stats */}
        <View style={styles.progressSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tu Progreso</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.progressContainer}
          >
            {progressStats.map((stat, index) => (
              <ProgressCard key={index} {...stat} index={index} />
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Acciones Rápidas</Text>
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} index={index} />
          ))}
        </View>

        {/* Daily Tip */}
        <NeumorphicCard style={[styles.tipCard, { backgroundColor: theme.colors.accent + '20' }]}>
          <Text style={[styles.tipTitle, { color: theme.colors.text }]}>💡 Consejo del día</Text>
          <Text style={[styles.tipContent, { color: theme.colors.textSecondary }]}>
            Dedica 15 minutos diarios a explorar una carrera que te interese. 
            La consistencia es clave para descubrir tu verdadera vocación.
          </Text>
        </NeumorphicCard>

        {/* Level Progress */}
        <NeumorphicCard style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <Award size={20} color={theme.colors.primary} />
            <Text style={[styles.levelTitle, { color: theme.colors.text }]}>
              Progreso al Nivel {progress.currentLevel + 1}
            </Text>
          </View>
          <View style={[styles.levelProgressBar, { backgroundColor: theme.colors.border }]}>
            <Animated.View 
              style={[
                styles.levelProgressFill, 
                { 
                  width: `${(progress.experiencePoints % 1000) / 10}%`,
                  backgroundColor: theme.colors.primary,
                }
              ]} 
            />
          </View>
          <Text style={[styles.levelProgressText, { color: theme.colors.textSecondary }]}>
            {progress.experiencePoints % 1000} / 1000 XP
          </Text>
        </NeumorphicCard>

        <View style={{ height: 100 }} />
      </ParallaxScrollView>

      <FloatingActionButton
        onPress={() => router.push('/(tabs)/chat')}
        icon={<MessageCircle size={24} color="white" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    flex: 1,
  },
  headerSafeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'capitalize',
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  progressSection: {
    marginBottom: 32,
    paddingTop: 24,
  },
  progressContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  progressCard: {
    alignItems: 'center',
    minWidth: 120,
    padding: 20,
  },
  progressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  progressTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 2,
  },
  progressSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    marginBottom: 20,
  },
  actionCard: {
    marginBottom: 16,
    padding: 0,
  },
  actionCardButton: {
    padding: 20,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionCardText: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  actionCardDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  tipCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
  },
  tipTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 12,
  },
  tipContent: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  levelCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
  levelProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  levelProgressText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});