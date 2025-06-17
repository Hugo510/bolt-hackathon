import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brain, ArrowRight, Clock, Users, Star } from 'lucide-react-native';
import { useState } from 'react';
import FadeInView from '@/components/animations/FadeInView';
import ScaleInView from '@/components/animations/ScaleInView';
import StaggeredList from '@/components/animations/StaggeredList';
import ProgressBar from '@/components/animations/ProgressBar';
import AnimatedButton from '@/components/animations/AnimatedButton';
import EmotionChip from '@/components/animations/EmotionChip';

export default function TestScreen() {
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const tests = [
    {
      id: 1,
      title: 'Test de Personalidad',
      description: 'Descubre tu tipo de personalidad y carreras afines',
      duration: '15 min',
      questions: 60,
      color: '#E0E7FF',
      iconColor: '#6366F1',
      completed: false,
      progress: 0,
    },
    {
      id: 2,
      title: 'Test de Intereses',
      description: 'Identifica tus áreas de interés profesional',
      duration: '10 min',
      questions: 40,
      color: '#DBEAFE',
      iconColor: '#3B82F6',
      completed: true,
      progress: 1,
    },
    {
      id: 3,
      title: 'Test de Habilidades',
      description: 'Evalúa tus fortalezas y competencias',
      duration: '20 min',
      questions: 80,
      color: '#D1FAE5',
      iconColor: '#10B981',
      completed: false,
      progress: 0.3,
    },
  ];

  const emotions = [
    { emoji: '😊', label: 'Motivado', color: '#10B981' },
    { emoji: '🤔', label: 'Curioso', color: '#8B5CF6' },
    { emoji: '😌', label: 'Tranquilo', color: '#3B82F6' },
    { emoji: '😟', label: 'Ansioso', color: '#F59E0B' },
    { emoji: '😴', label: 'Cansado', color: '#6B7280' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <FadeInView delay={0}>
          <View style={styles.header}>
            <Text style={styles.title}>Tests Vocacionales</Text>
            <Text style={styles.subtitle}>Descubre tu camino profesional ideal</Text>
          </View>
        </FadeInView>

        {/* Mood Check */}
        <FadeInView delay={200}>
          <View style={styles.moodSection}>
            <Text style={styles.sectionTitle}>¿Cómo te sientes antes de empezar?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emotionsContainer}>
              {emotions.map((emotion, index) => (
                <EmotionChip
                  key={index}
                  emoji={emotion.emoji}
                  label={emotion.label}
                  selected={selectedEmotion === emotion.label}
                  onPress={() => setSelectedEmotion(selectedEmotion === emotion.label ? null : emotion.label)}
                  color={emotion.color}
                />
              ))}
            </ScrollView>
          </View>
        </FadeInView>

        {/* Progress Overview */}
        <ScaleInView delay={400}>
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Tu Progreso</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressStats}>
                <StaggeredList staggerDelay={100} initialDelay={600}>
                  <View style={styles.progressStat}>
                    <Text style={styles.progressNumber}>1</Text>
                    <Text style={styles.progressLabel}>Completado</Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Text style={styles.progressNumber}>2</Text>
                    <Text style={styles.progressLabel}>Pendientes</Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Text style={styles.progressNumber}>85%</Text>
                    <Text style={styles.progressLabel}>Compatibilidad</Text>
                  </View>
                </StaggeredList>
              </View>
            </View>
          </View>
        </ScaleInView>

        {/* Available Tests */}
        <FadeInView delay={600}>
          <View style={styles.testsSection}>
            <Text style={styles.sectionTitle}>Tests Disponibles</Text>
            <StaggeredList staggerDelay={150} initialDelay={800}>
              {tests.map((test) => (
                <AnimatedButton
                  key={test.id}
                  onPress={() => setSelectedTest(selectedTest === test.id ? null : test.id)}
                  variant="ghost"
                >
                  <View style={[
                    styles.testCard,
                    selectedTest === test.id && styles.testCardSelected
                  ]}>
                    <View style={styles.testHeader}>
                      <ScaleInView delay={0}>
                        <View style={[styles.testIcon, { backgroundColor: test.color }]}>
                          <Brain size={24} color={test.iconColor} />
                        </View>
                      </ScaleInView>
                      <View style={styles.testInfo}>
                        <View style={styles.testTitleRow}>
                          <Text style={styles.testTitle}>{test.title}</Text>
                          {test.completed && (
                            <ScaleInView delay={100}>
                              <View style={styles.completedBadge}>
                                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                              </View>
                            </ScaleInView>
                          )}
                        </View>
                        <Text style={styles.testDescription}>{test.description}</Text>
                      </View>
                    </View>
                    
                    {test.progress > 0 && (
                      <View style={styles.testProgressContainer}>
                        <ProgressBar progress={test.progress} delay={200} />
                        <Text style={styles.testProgressText}>
                          {Math.round(test.progress * 100)}% completado
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.testMeta}>
                      <View style={styles.testMetaItem}>
                        <Clock size={16} color="#6B7280" />
                        <Text style={styles.testMetaText}>{test.duration}</Text>
                      </View>
                      <View style={styles.testMetaItem}>
                        <Users size={16} color="#6B7280" />
                        <Text style={styles.testMetaText}>{test.questions} preguntas</Text>
                      </View>
                    </View>

                    {selectedTest === test.id && (
                      <FadeInView delay={0}>
                        <View style={styles.startButton}>
                          <Text style={styles.startButtonText}>
                            {test.completed ? 'Ver Resultados' : test.progress > 0 ? 'Continuar Test' : 'Comenzar Test'}
                          </Text>
                          <ArrowRight size={20} color="#FFFFFF" />
                        </View>
                      </FadeInView>
                    )}
                  </View>
                </AnimatedButton>
              ))}
            </StaggeredList>
          </View>
        </FadeInView>

        {/* Tips Section */}
        <FadeInView delay={1000}>
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>Consejos para el Test</Text>
            <StaggeredList staggerDelay={100} initialDelay={1200}>
              <View style={styles.tipCard}>
                <Text style={styles.tipTitle}>💡 Responde con honestidad</Text>
                <Text style={styles.tipText}>
                  No hay respuestas correctas o incorrectas. Sé auténtico contigo mismo.
                </Text>
              </View>
              <View style={styles.tipCard}>
                <Text style={styles.tipTitle}>⏰ Tómate tu tiempo</Text>
                <Text style={styles.tipText}>
                  Reflexiona sobre cada pregunta, pero no te obsesiones con la respuesta perfecta.
                </Text>
              </View>
            </StaggeredList>
          </View>
        </FadeInView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
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
  emotionsContainer: {
    flexDirection: 'row',
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  testsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  testCardSelected: {
    borderColor: '#6366F1',
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  testInfo: {
    flex: 1,
  },
  testTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  testTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  completedBadge: {
    marginLeft: 8,
  },
  testDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  testProgressContainer: {
    marginBottom: 16,
  },
  testProgressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6366F1',
    marginTop: 8,
    textAlign: 'right',
  },
  testMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  testMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testMetaText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 6,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0C4A6E',
    lineHeight: 20,
  },
});