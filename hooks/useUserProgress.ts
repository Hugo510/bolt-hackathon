import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';

export interface UserProgressData {
  id: string;
  user_id: string;
  points_earned: number;
  level: number;
  badges_earned: string[];
  streak_days: number;
  last_activity: string;
  created_at: string;
  // Estadísticas calculadas
  tests_completed?: number;
  sessions_attended?: number;
  resources_consumed?: number;
  posts_created?: number;
  comments_made?: number;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_data: Record<string, any>;
  earned_at: string;
  points_awarded: number;
}

export const useUserProgress = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async (): Promise<UserProgressData | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.auth_user_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Crear progreso inicial si no existe
          const { data: newProgress, error: createError } = await supabase
            .from('user_progress')
            .insert({
              user_id: user.auth_user_id,
              points_earned: 0,
              level: 1,
              badges_earned: [],
              streak_days: 0,
              last_activity: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) throw createError;
          return newProgress;
        }
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });
};

export const useUpdateUserProgress = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async (updates: Partial<UserProgressData>) => {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_progress')
        .update({
          ...updates,
          last_activity: new Date().toISOString(),
        })
        .eq('user_id', user.auth_user_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    },
  });
};

export const useAddPoints = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async ({
      points,
      reason,
      achievementType,
    }: {
      points: number;
      reason: string;
      achievementType?: string;
    }) => {
      if (!user) throw new Error('No authenticated user');

      // Obtener progreso actual
      const { data: currentProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.auth_user_id)
        .single();

      if (!currentProgress) throw new Error('User progress not found');

      const newPoints = currentProgress.points_earned + points;
      const newLevel = Math.floor(newPoints / 1000) + 1;

      // Actualizar progreso
      const { data: updatedProgress, error: progressError } = await supabase
        .from('user_progress')
        .update({
          points_earned: newPoints,
          level: newLevel,
          last_activity: new Date().toISOString(),
        })
        .eq('user_id', user.auth_user_id)
        .select()
        .single();

      if (progressError) throw progressError;

      // Crear registro de logro si se especifica
      if (achievementType) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: user.auth_user_id,
            achievement_type: achievementType,
            achievement_data: { reason, points_awarded: points },
            points_awarded: points,
          });
      }

      return updatedProgress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
    },
  });
};

export const useUserAchievements = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async (): Promise<Achievement[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.auth_user_id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useProgressStats = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['progress-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Obtener estadísticas de diferentes tablas
      const [
        testsResult,
        sessionsResult,
        resourcesResult,
        postsResult,
        commentsResult,
      ] = await Promise.all([
        supabase
          .from('vocational_tests')
          .select('id')
          .eq('user_id', user.auth_user_id)
          .not('completed_at', 'is', null),
        
        supabase
          .from('mentor_sessions')
          .select('id')
          .eq('mentee_id', user.auth_user_id)
          .eq('status', 'completed'),
        
        supabase
          .from('resource_interactions')
          .select('id')
          .eq('user_id', user.auth_user_id)
          .eq('interaction_type', 'view'),
        
        supabase
          .from('community_posts')
          .select('id')
          .eq('user_id', user.auth_user_id),
        
        supabase
          .from('post_comments')
          .select('id')
          .eq('user_id', user.auth_user_id),
      ]);

      return {
        testsCompleted: testsResult.data?.length || 0,
        sessionsAttended: sessionsResult.data?.length || 0,
        resourcesConsumed: resourcesResult.data?.length || 0,
        postsCreated: postsResult.data?.length || 0,
        commentsMade: commentsResult.data?.length || 0,
      };
    },
    enabled: !!user,
  });
};

export const useUpdateStreak = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No authenticated user');

      const { data: currentProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.auth_user_id)
        .single();

      if (!currentProgress) throw new Error('User progress not found');

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = new Date(currentProgress.last_activity).toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let newStreakDays = currentProgress.streak_days;

      if (lastActivity === yesterday) {
        // Continúa la racha
        newStreakDays = currentProgress.streak_days + 1;
      } else if (lastActivity !== today) {
        // Nueva racha o se rompió
        newStreakDays = 1;
      }

      const { data, error } = await supabase
        .from('user_progress')
        .update({
          streak_days: newStreakDays,
          last_activity: new Date().toISOString(),
        })
        .eq('user_id', user.auth_user_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    },
  });
};