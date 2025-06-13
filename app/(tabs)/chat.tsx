import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User, Heart, BarChart3, Plus } from 'lucide-react-native';
import { useEmotionalLogs, useEmotionalInsights } from '@/hooks/useEmotionalLogs';
import { useUserProgressStore } from '@/stores/userProgressStore';
import EmotionalLogForm from '@/components/forms/EmotionalLogForm';
import dayjs from 'dayjs';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  emotion?: string;
}

const emotionalResponses = {
  stress: [
    "Entiendo que te sientes estresado/a. Es normal sentir presión cuando pensamos en nuestro futuro profesional.",
    "El estrés puede ser abrumador, pero recuerda que cada paso que das te acerca más a tus objetivos.",
    "Respira profundo. El estrés es temporal, pero tus capacidades y potencial son permanentes."
  ],
  confused: [
    "Es completamente normal sentirse confundido/a sobre el futuro. La incertidumbre es parte del crecimiento.",
    "No tener todas las respuestas ahora está bien. Cada experiencia te ayuda a descubrir más sobre ti.",
    "La confusión a menudo precede a la claridad. Estás en el camino correcto al buscar orientación."
  ],
  motivated: [
    "¡Me encanta escuchar tu motivación! Esa energía positiva te llevará lejos.",
    "Tu entusiasmo es contagioso. Canaliza esa motivación hacia acciones concretas.",
    "Con esa actitud positiva, estoy seguro/a de que alcanzarás tus metas profesionales."
  ],
  anxious: [
    "La ansiedad por el futuro es muy común. Recuerda que no tienes que tenerlo todo resuelto ahora.",
    "Toma las cosas paso a paso. Cada pequeño progreso cuenta hacia tu objetivo mayor.",
    "Tu ansiedad muestra que te importa tu futuro, y eso es algo positivo. Úsala como motivación."
  ],
  default: [
    "Gracias por compartir conmigo. Estoy aquí para apoyarte en tu journey profesional.",
    "Cada conversación es una oportunidad de crecimiento. ¿Cómo puedo ayudarte mejor?",
    "Tu bienestar emocional es importante para tu desarrollo profesional. Sigamos hablando."
  ]
};

const detectEmotion = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('estres') || lowerText.includes('presión') || lowerText.includes('agobio')) {
    return 'stress';
  }
  if (lowerText.includes('confund') || lowerText.includes('perdid') || lowerText.includes('no sé')) {
    return 'confused';
  }
  if (lowerText.includes('motivad') || lowerText.includes('emocionad') || lowerText.includes('bien') || lowerText.includes('genial')) {
    return 'motivated';
  }
  if (lowerText.includes('ansied') || lowerText.includes('nervios') || lowerText.includes('preocup') || lowerText.includes('miedo')) {
    return 'anxious';
  }
  
  return 'default';
};

const getEmotionalResponse = (emotion: string): string => {
  const responses = emotionalResponses[emotion as keyof typeof emotionalResponses] || emotionalResponses.default;
  return responses[Math.floor(Math.random() * responses.length)];
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy tu asistente de apoyo emocional. Estoy aquí para ayudarte con cualquier inquietud sobre tu futuro profesional. ¿Cómo te sientes hoy?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { data: emotionalLogs } = useEmotionalLogs(5);
  const { data: insights } = useEmotionalInsights();
  const { incrementCommentsMade } = useUserProgressStore();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    incrementCommentsMade();

    // Simulate AI response with emotion detection
    setTimeout(() => {
      const emotion = detectEmotion(inputText);
      const response = getEmotionalResponse(emotion);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
        emotion,
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 1000);

    setInputText('');
  };

  const MessageBubble = ({ message }: { message: Message }) => (
    <View style={[
      styles.messageBubble,
      message.isUser ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={styles.messageHeader}>
        {message.isUser ? (
          <User size={16} color="#4f46e5" />
        ) : (
          <Bot size={16} color="#10b981" />
        )}
        <Text style={styles.messageTime}>
          {dayjs(message.timestamp).format('HH:mm')}
        </Text>
      </View>
      <Text style={[
        styles.messageText,
        message.isUser ? styles.userMessageText : styles.aiMessageText
      ]}>
        {message.content}
      </Text>
      {message.emotion && message.emotion !== 'default' && (
        <View style={styles.emotionTag}>
          <Text style={styles.emotionText}>
            {message.emotion === 'stress' ? '😰 Estrés detectado' :
             message.emotion === 'confused' ? '🤔 Confusión detectada' :
             message.emotion === 'motivated' ? '🚀 Motivación detectada' :
             message.emotion === 'anxious' ? '😟 Ansiedad detectada' : ''}
          </Text>
        </View>
      )}
    </View>
  );

  const InsightsCard = () => {
    if (!insights) return null;

    return (
      <View style={styles.insightsCard}>
        <View style={styles.insightsHeader}>
          <BarChart3 size={20} color="#4f46e5" />
          <Text style={styles.insightsTitle}>Resumen Emocional (30 días)</Text>
        </View>
        <View style={styles.insightsGrid}>
          <View style={styles.insightItem}>
            <Text style={styles.insightValue}>{insights.totalSessions}</Text>
            <Text style={styles.insightLabel}>Sesiones</Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightValue}>{insights.averageIntensity}</Text>
            <Text style={styles.insightLabel}>Intensidad Promedio</Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightValue}>{insights.moodImprovementRate}%</Text>
            <Text style={styles.insightLabel}>Mejora de Ánimo</Text>
          </View>
        </View>
        {insights.topEmotions.length > 0 && (
          <View style={styles.topEmotions}>
            <Text style={styles.topEmotionsTitle}>Emociones más frecuentes:</Text>
            {insights.topEmotions.map((emotion, index) => (
              <Text key={index} style={styles.topEmotionItem}>
                • {emotion.emotion} ({emotion.count} veces)
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Bot size={24} color="#10b981" />
          <View style={styles.headerText}>
            <Text style={styles.title}>Apoyo Emocional</Text>
            <Text style={styles.subtitle}>Asistente de IA especializada</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.logButton}
            onPress={() => setShowLogForm(true)}
          >
            <Plus size={20} color="#4f46e5" />
          </TouchableOpacity>
          <View style={styles.statusIndicator}>
            <View style={styles.onlineStatus} />
            <Text style={styles.statusText}>En línea</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          <InsightsCard />
          
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribe tu mensaje..."
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={20} color={inputText.trim() ? 'white' : '#9ca3af'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          💡 Este es un chatbot de apoyo emocional. Para emergencias, contacta servicios profesionales.
        </Text>
      </View>

      <Modal
        visible={showLogForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLogForm(false)}>
              <Text style={styles.modalCloseButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Registro Emocional</Text>
            <View style={styles.modalSpacer} />
          </View>
          <EmotionalLogForm onSuccess={() => setShowLogForm(false)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#10b981',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  insightsCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e40af',
    marginLeft: 8,
  },
  insightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  insightItem: {
    alignItems: 'center',
  },
  insightValue: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e40af',
  },
  insightLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#1e40af',
    textAlign: 'center',
  },
  topEmotions: {
    borderTopWidth: 1,
    borderTopColor: '#bfdbfe',
    paddingTop: 12,
  },
  topEmotionsTitle: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#1e40af',
    marginBottom: 4,
  },
  topEmotionItem: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#1e40af',
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4f46e5',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#9ca3af',
    marginLeft: 8,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#374151',
  },
  emotionTag: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  emotionText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#92400e',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  disclaimer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#fbbf24',
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#92400e',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCloseButton: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#6b7280',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1f2937',
  },
  modalSpacer: {
    width: 60,
  },
});