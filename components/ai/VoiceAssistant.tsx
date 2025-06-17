import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react-native';
import { useVoiceInteraction } from '@/hooks/useVoiceInteraction';
import { useEmotionalAI } from '@/hooks/useEmotionalAI';
import { useTheme } from '@/contexts/ThemeContext';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PulseView from '@/components/animations/PulseView';

interface VoiceAssistantProps {
  onTranscript?: (text: string) => void;
  onResponse?: (response: string) => void;
  autoSpeak?: boolean;
}

export default function VoiceAssistant({
  onTranscript,
  onResponse,
  autoSpeak = true,
}: VoiceAssistantProps) {
  const { theme } = useTheme();
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    isPlaying,
    isRecording,
    isSynthesizing,
    error: voiceError,
  } = useVoiceInteraction({
    language: 'es-ES',
    speed: 0.9,
    pitch: 1.0,
  });

  const {
    generateSupportResponse,
    analyzeEmotion,
    isLoading: isAILoading,
    error: aiError,
  } = useEmotionalAI();

  const handleStartListening = useCallback(() => {
    const cleanup = startListening(
      (result) => {
        setTranscript(result.text);
        if (result.isFinal) {
          onTranscript?.(result.text);
          handleProcessTranscript(result.text);
        }
      },
      (error) => {
        console.error('Speech recognition error:', error);
      }
    );

    return cleanup;
  }, [startListening, onTranscript]);

  const handleProcessTranscript = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);

    try {
      // Analizar emoción del texto
      const emotion = await analyzeEmotion(text);
      
      // Generar respuesta de apoyo
      const response = await generateSupportResponse(text, emotion || undefined);
      
      if (response) {
        onResponse?.(response.message);
        
        if (autoSpeak) {
          await speak(response.message);
        }
      }
    } catch (error) {
      console.error('Error processing transcript:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [analyzeEmotion, generateSupportResponse, onResponse, autoSpeak, speak]);

  const handleToggleListening = useCallback(() => {
    if (isRecording) {
      stopListening();
    } else {
      handleStartListening();
    }
  }, [isRecording, stopListening, handleStartListening]);

  const handleToggleSpeaking = useCallback(() => {
    if (isPlaying) {
      stopSpeaking();
    } else if (transcript) {
      speak(transcript);
    }
  }, [isPlaying, stopSpeaking, transcript, speak]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      margin: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
    },
    status: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      marginBottom: 16,
    },
    micButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isRecording ? theme.colors.error : theme.colors.primary,
    },
    speakerButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isPlaying ? theme.colors.warning : theme.colors.secondary,
    },
    transcript: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 16,
      minHeight: 80,
    },
    transcriptText: {
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.text,
      lineHeight: 24,
    },
    placeholderText: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textMuted,
      fontStyle: 'italic',
    },
    errorText: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.error,
      marginTop: 8,
    },
    processingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    processingText: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.primary,
      marginLeft: 8,
    },
  });

  const getStatusText = () => {
    if (isProcessing || isAILoading) return 'Procesando...';
    if (isSynthesizing) return 'Generando audio...';
    if (isRecording) return 'Escuchando...';
    if (isPlaying) return 'Reproduciendo...';
    return 'Listo';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Asistente de Voz</Text>
        <Text style={styles.status}>{getStatusText()}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.micButton}
          onPress={handleToggleListening}
          disabled={isProcessing || isAILoading}
        >
          {isRecording ? (
            <PulseView duration={1000}>
              <MicOff size={24} color="white" />
            </PulseView>
          ) : (
            <Mic size={24} color="white" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.speakerButton}
          onPress={handleToggleSpeaking}
          disabled={!transcript || isProcessing}
        >
          {isPlaying ? (
            <VolumeX size={20} color="white" />
          ) : (
            <Volume2 size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.transcript}>
        {transcript ? (
          <Text style={styles.transcriptText}>{transcript}</Text>
        ) : (
          <Text style={styles.placeholderText}>
            Toca el micrófono para comenzar a hablar...
          </Text>
        )}
      </View>

      {(isProcessing || isAILoading) && (
        <View style={styles.processingIndicator}>
          <PulseView duration={1000}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.primary,
            }} />
          </PulseView>
          <Text style={styles.processingText}>Analizando respuesta...</Text>
        </View>
      )}

      {(voiceError || aiError) && (
        <Text style={styles.errorText}>
          Error: {voiceError || aiError}
        </Text>
      )}
    </View>
  );
}