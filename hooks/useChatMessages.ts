import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  message_type: 'user' | 'ai';
  emotion_detected?: string;
  ai_response_metadata?: {
    model?: string;
    confidence?: number;
    processing_time?: number;
    emotion_analysis?: {
      primary: string;
      intensity: number;
      suggestions: string[];
    };
  };
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  session_name?: string;
  started_at: string;
  ended_at?: string;
  message_count: number;
  emotions_detected: string[];
  summary?: string;
}

export const useChatMessages = (sessionId?: string) => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['chat-messages', user?.id, sessionId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!user) return [];

      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.auth_user_id)
        .order('created_at', { ascending: true });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateChatMessage = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async (messageData: {
      content: string;
      message_type: 'user' | 'ai';
      emotion_detected?: string;
      session_id?: string;
      ai_response_metadata?: ChatMessage['ai_response_metadata'];
    }) => {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          ...messageData,
          user_id: user.auth_user_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
  });
};

export const useChatSessions = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['chat-sessions', user?.id],
    queryFn: async (): Promise<ChatSession[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.auth_user_id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateChatSession = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async (sessionData: {
      session_name?: string;
    }) => {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.auth_user_id,
          session_name: sessionData.session_name || `Sesión ${new Date().toLocaleDateString()}`,
          started_at: new Date().toISOString(),
          message_count: 0,
          emotions_detected: [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
};

export const useUpdateChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      updates,
    }: {
      sessionId: string;
      updates: Partial<ChatSession>;
    }) => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
};

export const useEmotionalInsightsFromChat = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['emotional-insights-chat', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('chat_messages')
        .select('emotion_detected, created_at, ai_response_metadata')
        .eq('user_id', user.auth_user_id)
        .eq('message_type', 'user')
        .not('emotion_detected', 'is', null)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const messages = data || [];
      
      // Analizar patrones emocionales
      const emotionCounts = messages.reduce((acc, msg) => {
        if (msg.emotion_detected) {
          acc[msg.emotion_detected] = (acc[msg.emotion_detected] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const totalMessages = messages.length;
      const emotionTrends = messages.slice(0, 14).map(msg => ({
        date: msg.created_at,
        emotion: msg.emotion_detected,
        intensity: msg.ai_response_metadata?.emotion_analysis?.intensity || 5,
      }));

      return {
        totalChatSessions: totalMessages,
        topEmotions: Object.entries(emotionCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([emotion, count]) => ({ emotion, count })),
        emotionTrends,
        averageIntensity: emotionTrends.length > 0 
          ? emotionTrends.reduce((sum, trend) => sum + trend.intensity, 0) / emotionTrends.length 
          : 0,
      };
    },
    enabled: !!user,
  });
};