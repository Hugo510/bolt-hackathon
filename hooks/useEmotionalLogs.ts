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

export interface EmotionalPattern {
  emotion: string;
  frequency: number;
  averageIntensity: number;
  commonTriggers: string[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface EmotionalInsight {
  totalLogs: number;
  averageIntensity: number;
  moodImprovementRate: number;
  topEmotions: Array<{ emotion: string; count: number }>;
  recentTrend: Array<{
    date: string;
    intensity: number;
    emotion: string;
  }>;
  patterns: EmotionalPattern[];
  recommendations: string[];
}

// Hook para obtener logs emocionales
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

// Hook para crear un log emocional
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
      queryClient.invalidateQueries({ queryKey: ['emotional-insights'] });
    },
  });
};

// Hook para obtener insights emocionales
export const useEmotionalInsights = (timeRange: 'week' | 'month' | 'quarter' = 'month') => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['emotional-insights', user?.id, timeRange],
    queryFn: async (): Promise<EmotionalInsight | null> => {
      if (!user) return null;

      const daysBack = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('emotional_logs')
        .select('emotion_primary, intensity, mood_before, mood_after, created_at, triggers')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
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

      // Calcular patrones emocionales
      const patterns: EmotionalPattern[] = Object.entries(emotionCounts).map(([emotion, frequency]) => {
        const emotionLogs = logs.filter(log => log.emotion_primary === emotion);
        const avgIntensity = emotionLogs.reduce((sum, log) => sum + log.intensity, 0) / emotionLogs.length;
        
        // Calcular triggers comunes
        const allTriggers = emotionLogs.flatMap(log => log.triggers || []);
        const triggerCounts = allTriggers.reduce((acc, trigger) => {
          acc[trigger] = (acc[trigger] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const commonTriggers = Object.entries(triggerCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([trigger]) => trigger);

        // Calcular tendencia (últimos vs primeros logs)
        const recentLogs = emotionLogs.slice(0, Math.ceil(emotionLogs.length / 3));
        const olderLogs = emotionLogs.slice(-Math.ceil(emotionLogs.length / 3));
        
        const recentAvg = recentLogs.reduce((sum, log) => sum + log.intensity, 0) / recentLogs.length;
        const olderAvg = olderLogs.reduce((sum, log) => sum + log.intensity, 0) / olderLogs.length;
        
        let trend: 'improving' | 'stable' | 'declining' = 'stable';
        if (recentAvg < olderAvg - 0.5) trend = 'improving';
        else if (recentAvg > olderAvg + 0.5) trend = 'declining';

        return {
          emotion,
          frequency,
          averageIntensity: avgIntensity,
          commonTriggers,
          trend,
        };
      });

      return {
        totalLogs: totalSessions,
        averageIntensity: Math.round(averageIntensity * 10) / 10,
        moodImprovementRate: totalSessions > 0 ? Math.round((moodImprovement / totalSessions) * 100) : 0,
        topEmotions: Object.entries(emotionCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([emotion, count]) => ({ emotion, count })),
        recentTrend: logs.slice(0, 14).map(log => ({
          date: log.created_at,
          intensity: log.intensity,
          emotion: log.emotion_primary,
        })),
        patterns,
        recommendations: generateRecommendations(patterns),
      };
    },
    enabled: !!user,
  });
};

// Hook para obtener logs por emoción específica
export const useEmotionalLogsByEmotion = (emotion: string) => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['emotional-logs-by-emotion', user?.id, emotion],
    queryFn: async (): Promise<EmotionalLog[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('emotional_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('emotion_primary', emotion)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!emotion,
  });
};

// Hook para obtener estadísticas de seguimiento
export const useEmotionalTracking = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['emotional-tracking', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [todayLogs, weekLogs, needsFollowUp] = await Promise.all([
        supabase
          .from('emotional_logs')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', today),
        
        supabase
          .from('emotional_logs')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', weekAgo),
        
        supabase
          .from('emotional_logs')
          .select('id, emotion_primary, intensity')
          .eq('user_id', user.id)
          .eq('follow_up_needed', true)
          .is('ai_response', null),
      ]);

      return {
        loggedToday: (todayLogs.data?.length || 0) > 0,
        weeklyCount: weekLogs.data?.length || 0,
        needsFollowUp: needsFollowUp.data?.length || 0,
        streak: await calculateStreak(user.id),
      };
    },
    enabled: !!user,
  });
};

// Función auxiliar para generar recomendaciones
function generateRecommendations(patterns: EmotionalPattern[]): string[] {
  const recommendations: string[] = [];
  
  patterns.forEach(pattern => {
    if (pattern.trend === 'declining' && pattern.averageIntensity > 7) {
      recommendations.push(`Considera técnicas de manejo para ${pattern.emotion.toLowerCase()}`);
    }
    
    if (pattern.commonTriggers.length > 0) {
      recommendations.push(`Identifica estrategias para manejar: ${pattern.commonTriggers.join(', ')}`);
    }
    
    if (pattern.frequency > 10 && pattern.averageIntensity > 6) {
      recommendations.push(`Busca apoyo profesional para manejar ${pattern.emotion.toLowerCase()} recurrente`);
    }
  });
  
  return recommendations.slice(0, 3); // Máximo 3 recomendaciones
}

// Función auxiliar para calcular racha
async function calculateStreak(userId: string): Promise<number> {
  const { data } = await supabase
    .from('emotional_logs')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (!data || data.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const hasLog = data.some(log => 
      log.created_at.split('T')[0] === dateStr
    );
    
    if (hasLog) {
      streak++;
    } else if (i > 0) {
      break; // Rompe la racha si no hay log (excepto hoy)
    }
  }
  
  return streak;
}