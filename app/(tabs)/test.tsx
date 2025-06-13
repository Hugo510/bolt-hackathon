import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brain, ChevronRight, RotateCcw } from 'lucide-react-native';

interface Question {
  id: number;
  question: string;
  options: string[];
  category: 'logical' | 'creative' | 'social' | 'practical';
}

const questions: Question[] = [
  {
    id: 1,
    question: "¿Qué actividad te resulta más atractiva?",
    options: [
      "Resolver problemas matemáticos complejos",
      "Crear contenido artístico o visual",
      "Ayudar a personas con sus problemas",
      "Construir o reparar objetos"
    ],
    category: 'logical'
  },
  {
    id: 2,
    question: "En tu tiempo libre prefieres:",
    options: [
      "Leer sobre ciencia y tecnología",
      "Escuchar música o dibujar",
      "Participar en actividades grupales",
      "Hacer proyectos DIY (hazlo tú mismo)"
    ],
    category: 'creative'
  },
  {
    id: 3,
    question: "¿Cuál de estas habilidades consideras tu fortaleza?",
    options: [
      "Análisis y pensamiento crítico",
      "Creatividad e imaginación",
      "Comunicación y empatía",
      "Habilidades manuales y técnicas"
    ],
    category: 'social'
  },
  {
    id: 4,
    question: "¿En qué tipo de ambiente te sientes más cómodo trabajando?",
    options: [
      "Laboratorio o oficina con datos",
      "Estudio creativo o espacio artístico",
      "Interactuando con personas",
      "Taller o campo de trabajo"
    ],
    category: 'practical'
  },
  {
    id: 5,
    question: "¿Qué te motiva más en un trabajo?",
    options: [
      "Resolver desafíos intelectuales",
      "Expresar ideas originales",
      "Impactar positivamente en otros",
      "Ver resultados tangibles"
    ],
    category: 'logical'
  }
];

const careerSuggestions = {
  logical: {
    careers: ["Ingeniería de Software", "Medicina", "Investigación Científica", "Análisis de Datos"],
    description: "Tu perfil muestra fortalezas en el pensamiento lógico y analítico."
  },
  creative: {
    careers: ["Diseño Gráfico", "Arquitectura", "Marketing Creativo", "Producción Audiovisual"],
    description: "Tienes un perfil creativo con gran capacidad de innovación."
  },
  social: {
    careers: ["Psicología", "Trabajo Social", "Recursos Humanos", "Educación"],
    description: "Tu perfil se orienta hacia el trabajo con personas y el impacto social."
  },
  practical: {
    careers: ["Ingeniería Civil", "Técnico Especializado", "Gestión de Proyectos", "Emprendimiento"],
    description: "Tienes habilidades prácticas y orientación hacia resultados concretos."
  }
};

export default function VocationalTestScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults(newAnswers);
    }
  };

  const calculateResults = (finalAnswers: number[]) => {
    const scores = {
      logical: 0,
      creative: 0,
      social: 0,
      practical: 0
    };

    finalAnswers.forEach((answer, index) => {
      switch (answer) {
        case 0:
          scores.logical++;
          break;
        case 1:
          scores.creative++;
          break;
        case 2:
          scores.social++;
          break;
        case 3:
          scores.practical++;
          break;
      }
    });

    const dominantType = Object.entries(scores).reduce((a, b) => 
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
    )[0] as keyof typeof scores;

    setResults({
      dominantType,
      scores,
      suggestion: careerSuggestions[dominantType]
    });
    setShowResults(true);
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setResults(null);
  };

  if (showResults && results) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Brain size={32} color="#4f46e5" />
              <Text style={styles.resultsTitle}>¡Resultados de tu Test!</Text>
            </View>

            <View style={styles.profileCard}>
              <Text style={styles.profileTitle}>Tu Perfil Vocacional</Text>
              <Text style={styles.profileDescription}>
                {results.suggestion.description}
              </Text>
            </View>

            <View style={styles.scoresContainer}>
              <Text style={styles.scoresTitle}>Puntuaciones por Área</Text>
              {Object.entries(results.scores).map(([type, score]) => (
                <View key={type} style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>
                    {type === 'logical' ? 'Lógico-Analítico' :
                     type === 'creative' ? 'Creativo-Artístico' :
                     type === 'social' ? 'Social-Humanístico' :
                     'Práctico-Técnico'}
                  </Text>
                  <View style={styles.scoreBar}>
                    <View 
                      style={[
                        styles.scoreProgress, 
                        { 
                          width: `${(score as number / questions.length) * 100}%`,
                          backgroundColor: type === results.dominantType ? '#4f46e5' : '#d1d5db'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.scoreNumber}>{score}/{questions.length}</Text>
                </View>
              ))}
            </View>

            <View style={styles.careersContainer}>
              <Text style={styles.careersTitle}>Carreras Recomendadas</Text>
              {results.suggestion.careers.map((career: string, index: number) => (
                <View key={index} style={styles.careerItem}>
                  <ChevronRight size={16} color="#4f46e5" />
                  <Text style={styles.careerText}>{career}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={resetTest}>
              <RotateCcw size={20} color="#white" />
              <Text style={styles.resetButtonText}>Realizar Test Nuevamente</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Test Vocacional</Text>
        <Text style={styles.progress}>
          Pregunta {currentQuestion + 1} de {questions.length}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
          ]} 
        />
      </View>

      <ScrollView style={styles.questionContainer}>
        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>
            Pregunta {currentQuestion + 1}
          </Text>
          <Text style={styles.questionText}>
            {questions[currentQuestion].question}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {questions[currentQuestion].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleAnswer(index)}
            >
              <Text style={styles.optionText}>{option}</Text>
              <ChevronRight size={20} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#1f2937',
    marginBottom: 4,
  },
  progress: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
  },
  questionContainer: {
    flex: 1,
    padding: 24,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#4f46e5',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1f2937',
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#374151',
    flex: 1,
    marginRight: 12,
  },
  resultsContainer: {
    flex: 1,
    padding: 24,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resultsTitle: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#1f2937',
    marginTop: 12,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  profileTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e40af',
    marginBottom: 8,
  },
  profileDescription: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1e40af',
    lineHeight: 24,
  },
  scoresContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoresTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1f2937',
    marginBottom: 16,
  },
  scoreItem: {
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#374151',
    marginBottom: 8,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  scoreNumber: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    textAlign: 'right',
  },
  careersContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  careersTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1f2937',
    marginBottom: 16,
  },
  careerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  careerText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#374151',
    marginLeft: 8,
  },
  resetButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
    marginLeft: 8,
  },
});