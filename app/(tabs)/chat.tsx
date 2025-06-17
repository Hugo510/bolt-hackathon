import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, Heart, Smile, Frown, Meh, Plus } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';
import FadeInView from '@/components/animations/FadeInView';
import ScaleInView from '@/components/animations/ScaleInView';
import StaggeredList from '@/components/animations/StaggeredList';
import EmotionChip from '@/components/animations/EmotionChip';
import BreathingCircle from '@/components/animations/BreathingCircle';
import TypingText from '@/components/animations/TypingText';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  emotion?: string;
  isTyping?: boolean;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy tu asistente de apoyo emocional. Estoy aquí para escucharte y ayudarte. ¿Cómo te sientes hoy?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const moods = [
    { emoji: '😊', label: 'Feliz', color: '#10B981' },
    { emoji: '😌', label: 'Tranquilo', color: '#3B82F6' },
    { emoji: '🤔', label: 'Pensativo', color: '#8B5CF6' },
    { emoji: '😟', label: 'Preocupado', color: '#F59E0B' },
    { emoji: '😢', label: 'Triste', color: '#EF4444' },
  ];

  const quickResponses = [
    'Me siento ansioso por mi futuro',
    'No sé qué carrera elegir',
    'Tengo miedo de equivocarme',
    'Me siento perdido',
  ];

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
      emotion: selectedMood || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedMood(null);

    // Add typing indicator
    const typingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages(prev => [...prev, typingMessage]);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Entiendo cómo te sientes. Es completamente normal tener estas emociones cuando pensamos en nuestro futuro.',
        'Gracias por compartir esto conmigo. ¿Podrías contarme un poco más sobre lo que te preocupa específicamente?',
        'Es valioso que reconozcas estos sentimientos. ¿Qué crees que te ayudaría a sentirte mejor en este momento?',
        'Tus emociones son válidas. Recuerda que no tienes que tener todo resuelto ahora mismo.',
      ];

      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => prev.filter(m => !m.isTyping).concat([aiMessage]));
    }, 2000);
  };

  const selectQuickResponse = (response: string) => {
    sendMessage(response);
  };

  const MessageBubble = ({ message, index }: { message: Message; index: number }) => (
    <FadeInView delay={index * 100}>
      <View
        style={[
          styles.messageContainer,
          message.isUser ? styles.userMessageContainer : styles.aiMessageContainer
        ]}
      >
        {!message.isUser && (
          <ScaleInView delay={index * 100 + 50}>
            <View style={styles.aiAvatar}>
              <Bot size={16} color="#6366F1" />
            </View>
          </ScaleInView>
        )}
        <View
          style={[
            styles.messageBubble,
            message.isUser ? styles.userMessage : styles.aiMessage
          ]}
        >
          {message.isTyping ? (
            <TypingText
              text="Escribiendo..."
              speed={100}
              style={[styles.messageText, styles.aiMessageText]}
            />
          ) : (
            <Text style={[
              styles.messageText,
              message.isUser ? styles.userMessageText : styles.aiMessageText
            ]}>
              {message.text}
            </Text>
          )}
          {message.emotion && (
            <ScaleInView delay={200}>
              <View style={styles.emotionTag}>
                <Text style={styles.emotionTagText}>
                  {moods.find(m => m.label === message.emotion)?.emoji} {message.emotion}
                </Text>
              </View>
            </ScaleInView>
          )}
        </View>
      </View>
    </FadeInView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <FadeInView delay={0}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <ScaleInView delay={100}>
                <View style={styles.botIcon}>
                  <Bot size={24} color="#6366F1" />
                </View>
              </ScaleInView>
              <View>
                <Text style={styles.headerTitle}>Apoyo Emocional</Text>
                <Text style={styles.headerSubtitle}>Asistente IA • En línea</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.breathingButton}
              onPress={() => setShowBreathing(!showBreathing)}
            >
              <Heart size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </FadeInView>

        {/* Breathing Exercise */}
        {showBreathing && (
          <FadeInView delay={0}>
            <View style={styles.breathingSection}>
              <BreathingCircle text="Respira" />
              <Text style={styles.breathingText}>Inhala... Exhala... Relájate</Text>
            </View>
          </FadeInView>
        )}

        {/* Mood Selector */}
        <FadeInView delay={200}>
          <View style={styles.moodSection}>
            <Text style={styles.moodTitle}>¿Cómo te sientes?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodContainer}>
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

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}

          {/* Quick Responses */}
          {messages.length === 1 && (
            <FadeInView delay={800}>
              <View style={styles.quickResponsesContainer}>
                <Text style={styles.quickResponsesTitle}>Respuestas rápidas:</Text>
                <StaggeredList staggerDelay={100} initialDelay={1000}>
                  {quickResponses.map((response, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickResponseButton}
                      onPress={() => selectQuickResponse(response)}
                    >
                      <Text style={styles.quickResponseText}>{response}</Text>
                    </TouchableOpacity>
                  ))}
                </StaggeredList>
              </View>
            </FadeInView>
          )}
        </ScrollView>

        {/* Input */}
        <FadeInView delay={400}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Escribe tu mensaje..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
                ]}
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim()}
              >
                <Send size={20} color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"} />
              </TouchableOpacity>
            </View>
          </View>
        </FadeInView>

        {/* Disclaimer */}
        <FadeInView delay={600}>
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              💡 Este es un chatbot de apoyo emocional. Para emergencias, contacta servicios profesionales.
            </Text>
          </View>
        </FadeInView>
      </KeyboardAvoidingView>
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  breathingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  breathingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 12,
  },
  moodSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  moodTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  moodContainer: {
    flexDirection: 'row',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userMessage: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#1F2937',
  },
  emotionTag: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  emotionTagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#92400E',
  },
  quickResponsesContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  quickResponsesTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 12,
  },
  quickResponseButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickResponseText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#6366F1',
  },
  sendButtonInactive: {
    backgroundColor: '#F3F4F6',
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    textAlign: 'center',
  },
});