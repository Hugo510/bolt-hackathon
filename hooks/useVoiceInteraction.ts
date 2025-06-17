import { useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useElevenLabs } from './useAIServices';

export interface VoiceSettings {
  voiceId?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
  language?: string;
}

export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

// Hook para interacciones de voz (Text-to-Speech y Speech-to-Text)
export function useVoiceInteraction(settings?: VoiceSettings) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { generateSpeech, isLoading: isSynthesizing, error } = useElevenLabs();

  // Text-to-Speech
  const speak = useCallback(async (text: string, options?: VoiceSettings) => {
    if (Platform.OS === 'web') {
      // Usar Web Speech API como fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options?.speed || settings?.speed || 1;
        utterance.pitch = options?.pitch || settings?.pitch || 1;
        utterance.volume = options?.volume || settings?.volume || 1;
        utterance.lang = options?.language || settings?.language || 'es-ES';
        
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        speechSynthesis.speak(utterance);
        return;
      }
    }

    // Usar ElevenLabs para mejor calidad
    const result = await generateSpeech(text, {
      voiceId: options?.voiceId || settings?.voiceId,
    });

    if (result.success && result.data) {
      setAudioUrl(result.data.audioUrl);
      
      if (Platform.OS === 'web' && result.data.audioBlob) {
        const audio = new Audio(result.data.audioUrl);
        audioRef.current = audio;
        
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        
        await audio.play();
      }
    }
  }, [generateSpeech, settings]);

  const stopSpeaking = useCallback(() => {
    if (Platform.OS === 'web') {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    setIsPlaying(false);
  }, []);

  // Speech-to-Text (solo web por ahora)
  const startListening = useCallback((
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void
  ) => {
    if (Platform.OS !== 'web' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      onError?.('Speech recognition no disponible');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = settings?.language || 'es-ES';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      onResult({
        text: result.transcript,
        confidence: result.confidence || 0,
        isFinal: result.isFinal,
      });
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      onError?.(event.error);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    
    return () => {
      recognition.stop();
      setIsRecording(false);
    };
  }, [settings]);

  const stopListening = useCallback(() => {
    setIsRecording(false);
    // La función de cleanup se maneja en startListening
  }, []);

  return {
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    isPlaying,
    isRecording,
    isSynthesizing,
    audioUrl,
    error,
  };
}