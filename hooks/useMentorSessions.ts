import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';

export interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  meeting_link?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  created_at: string;
}

export interface Mentor {
  id: string;
  user_id: string;
  specialties: string[];
  experience_years: number;
  rating: number;
  hourly_rate: number;
  bio: string;
  available_slots: string[];
  created_at: string;
  // Datos del usuario relacionado
  users?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const useMentorSessions = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['mentor-sessions', user?.id],
    queryFn: async (): Promise<MentorSession[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('mentor_sessions')
        .select(`
          *,
          mentors!inner(
            id,
            users!inner(
              full_name,
              avatar_url
            )
          )
        `)
        .eq('mentee_id', user.auth_user_id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateMentorSession = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async (sessionData: {
      mentor_id: string;
      scheduled_at: string;
      duration_minutes?: number;
      notes?: string;
    }) => {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('mentor_sessions')
        .insert({
          ...sessionData,
          mentee_id: user.auth_user_id,
          status: 'scheduled',
          duration_minutes: sessionData.duration_minutes || 60,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-sessions'] });
    },
  });
};

export const useUpdateMentorSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      updates 
    }: { 
      sessionId: string; 
      updates: Partial<MentorSession> 
    }) => {
      const { data, error } = await supabase
        .from('mentor_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-sessions'] });
    },
  });
};

export const useMentors = (filters?: {
  specialty?: string;
  minRating?: number;
  maxRate?: number;
}) => {
  return useQuery({
    queryKey: ['mentors', filters],
    queryFn: async (): Promise<Mentor[]> => {
      let query = supabase
        .from('mentors')
        .select(`
          *,
          users!inner(
            full_name,
            avatar_url
          )
        `)
        .order('rating', { ascending: false });

      if (filters?.specialty) {
        query = query.contains('specialties', [filters.specialty]);
      }

      if (filters?.minRating) {
        query = query.gte('rating', filters.minRating);
      }

      if (filters?.maxRate) {
        query = query.lte('hourly_rate', filters.maxRate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
};