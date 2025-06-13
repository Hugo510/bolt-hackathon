import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';

export interface EmotionalLog {
  id: string;
  user_id: string;
  emotion_primary: string;
  emotion_secondary?: string;
  intensity: number;
  context?: string;
  triggers: string[];
  coping_strategies: string[];
  notes?: string;
  mood_before?: number;
  mood_after?: number;
  session_duration_minutes?: number;
  ai_response?: string;
  ai_recommendations: string[];
  follow_up_needed: boolean;
  created_at: string;
}

export const useEmotionalLogs = (limit?: number) => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['emotional-logs', user?.id, limit],
    queryFn: async (): Promise<EmotionalLog[]> => {
      if (!user) return [];

      let query = supabase
        .from('emotional_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateEmotionalLog = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async (logData: Omit<EmotionalLog, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('emotional_logs')
        .insert({
          ...logData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emotional-logs'] });
    },
  });
};

export const useEmotionalInsights = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['emotional-insights', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('emotional_logs')
        .select('emotion_primary, intensity, mood_before, mood_after, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 30 días
        .order('created_at', { ascending: false });

      if (error) throw error;

      const logs = data || [];
      
      // Calcular insights
      const emotionCounts = logs.reduce((acc, log) => {
        acc[log.emotion_primary] = (acc[log.emotion_primary] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const averageIntensity = logs.length > 0 
        ? logs.reduce((sum, log) => sum + log.intensity, 0) / logs.length 
        : 0;

      const moodImprovement = logs.filter(log => 
        log.mood_before && log.mood_after && log.mood_after > log.mood_before
      ).length;

      const totalSessions = logs.length;

      return {
        totalSessions,
        averageIntensity: Math.round(averageIntensity * 10) / 10,
        moodImprovementRate: totalSessions > 0 ? Math.round((moodImprovement / totalSessions) * 100) : 0,
        topEmotions: Object.entries(emotionCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([emotion, count]) => ({ emotion, count })),
        recentTrend: logs.slice(0, 7).map(log => ({
          date: log.created_at,
          intensity: log.intensity,
          emotion: log.emotion_primary,
        })),
      };
    },
    enabled: !!user,
  });
};