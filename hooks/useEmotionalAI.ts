import { useCallback } from 'react';
import { useOpenAI } from './useAIServices';

export interface EmotionAnalysis {
  primaryEmotion: string;
  secondaryEmotions: string[];
  intensity: number; // 1-10
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1
  suggestions: string[];
  triggers?: string[];
}

export interface ChatResponse {
  message: string;
  emotion: string;
  supportLevel: 'low' | 'medium' | 'high' | 'crisis';
  followUpQuestions: string[];
  resources?: string[];
}

// Hook especializado para análisis emocional con AI
export function useEmotionalAI() {
  const { generateText, isLoading, error, clearError } = useOpenAI();

  const analyzeEmotion = useCallback(async (
    text: string
  ): Promise<EmotionAnalysis | null> => {
    const prompt = `
Analiza el siguiente texto y proporciona un análisis emocional detallado en formato JSON:

Texto: "${text}"

Responde SOLO con un JSON válido con esta estructura:
{
  "primaryEmotion": "emoción principal detectada",
  "secondaryEmotions": ["emoción1", "emoción2"],
  "intensity": número del 1-10,
  "sentiment": "positive/negative/neutral",
  "confidence": número del 0-1,
  "suggestions": ["sugerencia1", "sugerencia2"],
  "triggers": ["posible trigger1", "posible trigger2"]
}

Emociones posibles: felicidad, tristeza, ansiedad, estrés, enojo, miedo, confusión, motivación, frustración, calma, esperanza, soledad, gratitud, preocupación.
`;

    const result = await generateText(prompt);
    
    if (!result.success || !result.data) {
      return null;
    }

    try {
      const analysis = JSON.parse(result.data.text);
      return analysis as EmotionAnalysis;
    } catch (error) {
      console.error('Error parsing emotion analysis:', error);
      return null;
    }
  }, [generateText]);

  const generateSupportResponse = useCallback(async (
    userMessage: string,
    emotionContext?: EmotionAnalysis
  ): Promise<ChatResponse | null> => {
    const emotionInfo = emotionContext 
      ? `Contexto emocional: ${emotionContext.primaryEmotion} (intensidad: ${emotionContext.intensity}/10)`
      : '';

    const prompt = `
Eres un asistente de apoyo emocional especializado en orientación vocacional para jóvenes. 
Responde de manera empática y profesional al siguiente mensaje:

Mensaje del usuario: "${userMessage}"
${emotionInfo}

Proporciona una respuesta en formato JSON:
{
  "message": "respuesta empática y útil (máximo 200 palabras)",
  "emotion": "emoción detectada en el usuario",
  "supportLevel": "low/medium/high/crisis",
  "followUpQuestions": ["pregunta1", "pregunta2"],
  "resources": ["recurso1", "recurso2"]
}

Directrices:
- Sé empático pero profesional
- Ofrece apoyo práctico
- Si detectas crisis, sugiere ayuda profesional
- Enfócate en orientación vocacional cuando sea relevante
- Usa un tono cálido y comprensivo
`;

    const result = await generateText(prompt);
    
    if (!result.success || !result.data) {
      return null;
    }

    try {
      const response = JSON.parse(result.data.text);
      return response as ChatResponse;
    } catch (error) {
      console.error('Error parsing chat response:', error);
      return null;
    }
  }, [generateText]);

  const generateCareerSuggestions = useCallback(async (
    interests: string[],
    personality: string,
    emotionalProfile: EmotionAnalysis
  ): Promise<string[] | null> => {
    const prompt = `
Basándote en el siguiente perfil, sugiere 5 carreras específicas que podrían ser adecuadas:

Intereses: ${interests.join(', ')}
Personalidad: ${personality}
Perfil emocional: ${emotionalProfile.primaryEmotion} (intensidad: ${emotionalProfile.intensity})

Responde SOLO con un array JSON de strings:
["Carrera 1", "Carrera 2", "Carrera 3", "Carrera 4", "Carrera 5"]

Considera:
- Compatibilidad con el perfil emocional
- Alineación con intereses
- Tipo de personalidad
- Oportunidades de crecimiento
`;

    const result = await generateText(prompt);
    
    if (!result.success || !result.data) {
      return null;
    }

    try {
      const suggestions = JSON.parse(result.data.text);
      return Array.isArray(suggestions) ? suggestions : null;
    } catch (error) {
      console.error('Error parsing career suggestions:', error);
      return null;
    }
  }, [generateText]);

  return {
    analyzeEmotion,
    generateSupportResponse,
    generateCareerSuggestions,
    isLoading,
    error,
    clearError,
  };
}