import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brain, ArrowRight, Clock, Users, Star } from 'lucide-react-native';
import { useState } from 'react';

export default function TestScreen() {
  const [selectedTest, setSelectedTest] = useState<number | null>(null);

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
    },
  ];

  const emotions = [
    { emoji: '😊', label: 'Motivado', selected: false },
    { emoji: '🤔', label: 'Curioso', selected: true },
    { emoji: '😌', label: 'Tranquilo', selected: false },
    { emoji: '😟', label: 'Ansioso', selected: false },
    { emoji: '😴', label: 'Cansado', selected: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tests Vocacionales</Text>
          <Text style={styles.subtitle}>Descubre tu camino profesional ideal</Text>
        </View>

        {/* Mood Check */}
        <View style={styles.moodSection}>
          <Text style={styles.sectionTitle}>¿Cómo te sientes antes de empezar?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emotionsContainer}>
            {emotions.map((emotion, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.emotionChip,
                  emotion.selected && styles.emotionChipSelected
                ]}
              >
                <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                <Text style={[
                  styles.emotionLabel,
                  emotion.selected && styles.emotionLabelSelected
                ]}>
                  {emotion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Progress Overview */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Tu Progreso</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressStats}>
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
            </View>
          </View>
        </View>

        {/* Available Tests */}
        <View style={styles.testsSection}>
          <Text style={styles.sectionTitle}>Tests Disponibles</Text>
          {tests.map((test) => (
            <TouchableOpacity
              key={test.id}
              style={[
                styles.testCard,
                selectedTest === test.id && styles.testCardSelected
              ]}
              onPress={() => setSelectedTest(test.id)}
            >
              <View style={styles.testHeader}>
                <View style={[styles.testIcon, { backgroundColor: test.color }]}>
                  <Brain size={24} color={test.iconColor} />
                </View>
                <View style={styles.testInfo}>
                  <View style={styles.testTitleRow}>
                    <Text style={styles.testTitle}>{test.title}</Text>
                    {test.completed && (
                      <View style={styles.completedBadge}>
                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.testDescription}>{test.description}</Text>
                </View>
              </View>
              
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
                <TouchableOpacity style={styles.startButton}>
                  <Text style={styles.startButtonText}>
                    {test.completed ? 'Ver Resultados' : 'Comenzar Test'}
                  </Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Consejos para el Test</Text>
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
        </View>
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
  emotionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emotionChipSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#E0E7FF',
  },
  emotionEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  emotionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  emotionLabelSelected: {
    color: '#6366F1',
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