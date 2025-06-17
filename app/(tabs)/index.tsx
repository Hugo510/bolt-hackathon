import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brain, Users, MessageCircle, BookOpen, Star, TrendingUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import FadeInView from '@/components/animations/FadeInView';
import ScaleInView from '@/components/animations/ScaleInView';
import StaggeredList from '@/components/animations/StaggeredList';
import ProgressBar from '@/components/animations/ProgressBar';
import AnimatedButton from '@/components/animations/AnimatedButton';
import EmotionChip from '@/components/animations/EmotionChip';
import TypingText from '@/components/animations/TypingText';
import { useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showTyping, setShowTyping] = useState(false);

  const quickActions = [
    {
      id: 1,
      title: 'Test Vocacional',
      subtitle: 'Descubre tu carrera ideal',
      icon: Brain,
      color: '#E0E7FF',
      iconColor: '#6366F1',
      route: '/test',
    },
    {
      id: 2,
      title: 'Hablar con Mentor',
      subtitle: 'Conecta con profesionales',
      icon: Users,
      color: '#DBEAFE',
      iconColor: '#3B82F6',
      route: '/mentors',
    },
    {
      id: 3,
      title: 'Apoyo Emocional',
      subtitle: 'Chat con IA especializada',
      icon: MessageCircle,
      color: '#D1FAE5',
      iconColor: '#10B981',
      route: '/chat',
    },
  ];

  const moods = [
    { emoji: '😊', label: 'Feliz', color: '#10B981' },
    { emoji: '😌', label: 'Tranquilo', color: '#3B82F6' },
    { emoji: '🤔', label: 'Pensativo', color: '#8B5CF6' },
    { emoji: '😟', label: 'Preocupado', color: '#F59E0B' },
    { emoji: '😴', label: 'Cansado', color: '#6B7280' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <FadeInView delay={0}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>¡Hola, María! 👋</Text>
              <Text style={styles.subtitle}>¿Cómo te sientes hoy?</Text>
            </View>
            <ScaleInView delay={200}>
              <View style={styles.profileContainer}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' }}
                  style={styles.profileImage}
                />
              </View>
            </ScaleInView>
          </View>
        </FadeInView>

        {/* Mood Tracker */}
        <FadeInView delay={300}>
          <View style={styles.moodSection}>
            <Text style={styles.sectionTitle}>¿Cómo te sientes?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {moods.map((mood, index) => (
                <EmotionChip
                  key={index}
                  emoji={mood.emoji}
                  label={mood.label}
                  selected={selectedMood === mood.label}
                  onPress={() => setSelectedMood(selectedMood === mood.label ? null : mood.label)}
                  color={mood.color}
                />
              ))}
            </ScrollView>
          </View>
        </FadeInView>

        {/* Progress Card */}
        <ScaleInView delay={500}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Tu Progreso</Text>
                <Text style={styles.progressSubtitle}>Nivel 3 • 750/1000 XP</Text>
              </View>
              <View style={styles.levelBadge}>
                <TrendingUp size={20} color="#6366F1" />
              </View>
            </View>
            <ProgressBar progress={0.75} delay={800} />
            <View style={styles.statsContainer}>
              <StaggeredList staggerDelay={100} initialDelay={1000}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>3</Text>
                  <Text style={styles.statLabel}>Tests</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Sesiones</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>7</Text>
                  <Text style={styles.statLabel}>Días</Text>
                </View>
              </StaggeredList>
            </View>
          </View>
        </ScaleInView>

        {/* Quick Actions */}
        <FadeInView delay={700}>
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            <StaggeredList staggerDelay={150} initialDelay={900}>
              {quickActions.map((action) => (
                <AnimatedButton
                  key={action.id}
                  onPress={() => router.push(action.route as any)}
                  variant="ghost"
                >
                  <View style={styles.actionCard}>
                    <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                      <action.icon size={24} color={action.iconColor} />
                    </View>
                    <View style={styles.actionContent}>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                    </View>
                  </View>
                </AnimatedButton>
              ))}
            </StaggeredList>
          </View>
        </FadeInView>

        {/* Daily Inspiration */}
        <ScaleInView delay={1200}>
          <View style={styles.inspirationCard}>
            <View style={styles.inspirationHeader}>
              <Star size={20} color="#F59E0B" />
              <Text style={styles.inspirationTitle}>Inspiración del día</Text>
            </View>
            {showTyping ? (
              <TypingText
                text="El futuro pertenece a quienes creen en la belleza de sus sueños."
                speed={30}
                style={styles.inspirationText}
                onComplete={() => {
                  setTimeout(() => setShowTyping(false), 2000);
                }}
              />
            ) : (
              <TouchableOpacity onPress={() => setShowTyping(true)}>
                <Text style={styles.inspirationText}>
                  "El futuro pertenece a quienes creen en la belleza de sus sueños."
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.inspirationAuthor}>- Eleanor Roosevelt</Text>
          </View>
        </ScaleInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  profileContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  moodSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  progressSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  inspirationCard: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  inspirationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inspirationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
    marginLeft: 8,
  },
  inspirationText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 24,
    marginBottom: 8,
  },
  inspirationAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#92400E',
    textAlign: 'right',
  },
});