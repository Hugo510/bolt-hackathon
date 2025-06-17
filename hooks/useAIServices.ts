import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

// Tipos para las diferentes integraciones de AI
export interface ElevenLabsConfig {
  apiKey: string;
  voiceId?: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
}

export interface TavusConfig {
  apiKey: string;
  replicaId?: string;
  background?: string;
  resolution?: '720p' | '1080p';
}

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    tokens?: number;
    cost?: number;
  };
}

// Hook principal para servicios de AI
export function useAIServices() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Función genérica para llamadas a APIs de AI
  const callAIService = useCallback(async <T>(
    serviceCall: () => Promise<T>
  ): Promise<AIResponse<T>> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await serviceCall();
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Error en el servicio de AI';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    clearError,
    callAIService,
  };
}

// Hook específico para ElevenLabs (Text-to-Speech)
export function useElevenLabs(config?: ElevenLabsConfig) {
  const { callAIService, isLoading, error, clearError } = useAIServices();

  const generateSpeech = useCallback(async (
    text: string,
    options?: Partial<ElevenLabsConfig>
  ): Promise<AIResponse<{ audioUrl: string; audioBlob?: Blob }>> => {
    const apiKey = options?.apiKey || config?.apiKey || process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: 'ElevenLabs API key no configurada' };
    }

    return callAIService(async () => {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + (options?.voiceId || config?.voiceId || 'rachel'), {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: options?.model || config?.model || 'eleven_multilingual_v2',
          voice_settings: {
            stability: options?.stability || config?.stability || 0.5,
            similarity_boost: options?.similarityBoost || config?.similarityBoost || 0.5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      if (Platform.OS === 'web') {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        return { audioUrl, audioBlob };
      } else {
        // Para móvil, guardar el archivo temporalmente
        const audioBuffer = await response.arrayBuffer();
        // Aquí se implementaría la lógica para guardar en el sistema de archivos móvil
        return { audioUrl: 'temp://audio.mp3' };
      }
    });
  }, [config, callAIService]);

  const getVoices = useCallback(async (): Promise<AIResponse<any[]>> => {
    const apiKey = config?.apiKey || process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: 'ElevenLabs API key no configurada' };
    }

    return callAIService(async () => {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json();
      return data.voices;
    });
  }, [config, callAIService]);

  return {
    generateSpeech,
    getVoices,
    isLoading,
    error,
    clearError,
  };
}

// Hook específico para Tavus (Video Generation)
export function useTavus(config?: TavusConfig) {
  const { callAIService, isLoading, error, clearError } = useAIServices();

  const generateVideo = useCallback(async (
    script: string,
    options?: Partial<TavusConfig>
  ): Promise<AIResponse<{ videoId: string; videoUrl?: string }>> => {
    const apiKey = options?.apiKey || config?.apiKey || process.env.EXPO_PUBLIC_TAVUS_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: 'Tavus API key no configurada' };
    }

    return callAIService(async () => {
      const response = await fetch('https://tavusapi.com/v2/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          replica_id: options?.replicaId || config?.replicaId,
          script,
          background: options?.background || config?.background || 'office',
          resolution: options?.resolution || config?.resolution || '720p',
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        videoId: data.video_id,
        videoUrl: data.download_url,
      };
    });
  }, [config, callAIService]);

  const getVideoStatus = useCallback(async (
    videoId: string
  ): Promise<AIResponse<{ status: string; videoUrl?: string }>> => {
    const apiKey = config?.apiKey || process.env.EXPO_PUBLIC_TAVUS_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: 'Tavus API key no configurada' };
    }

    return callAIService(async () => {
      const response = await fetch(`https://tavusapi.com/v2/videos/${videoId}`, {
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: data.status,
        videoUrl: data.download_url,
      };
    });
  }, [config, callAIService]);

  const getReplicas = useCallback(async (): Promise<AIResponse<any[]>> => {
    const apiKey = config?.apiKey || process.env.EXPO_PUBLIC_TAVUS_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: 'Tavus API key no configurada' };
    }

    return callAIService(async () => {
      const response = await fetch('https://tavusapi.com/v2/replicas', {
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const data = await response.json();
      return data.replicas;
    });
  }, [config, callAIService]);

  return {
    generateVideo,
    getVideoStatus,
    getReplicas,
    isLoading,
    error,
    clearError,
  };
}

// Hook para OpenAI/ChatGPT
export function useOpenAI(config?: OpenAIConfig) {
  const { callAIService, isLoading, error, clearError } = useAIServices();

  const generateText = useCallback(async (
    prompt: string,
    options?: Partial<OpenAIConfig>
  ): Promise<AIResponse<{ text: string; usage: any }>> => {
    const apiKey = options?.apiKey || config?.apiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: 'OpenAI API key no configurada' };
    }

    return callAIService(async () => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || config?.model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: options?.temperature || config?.temperature || 0.7,
          max_tokens: options?.maxTokens || config?.maxTokens || 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        text: data.choices[0].message.content,
        usage: data.usage,
      };
    });
  }, [config, callAIService]);

  const generateEmbedding = useCallback(async (
    text: string
  ): Promise<AIResponse<{ embedding: number[] }>> => {
    const apiKey = config?.apiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: 'OpenAI API key no configurada' };
    }

    return callAIService(async () => {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        embedding: data.data[0].embedding,
      };
    });
  }, [config, callAIService]);

  return {
    generateText,
    generateEmbedding,
    isLoading,
    error,
    clearError,
  };
}