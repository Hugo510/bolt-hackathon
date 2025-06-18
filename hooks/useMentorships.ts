import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';

export interface Mentorship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  goals: string[];
  progress_notes: string[];
  created_at: string;
  updated_at: string;
  // Datos relacionados
  mentor?: {
    id: string;
    user_id: string;
    specialties: string[];
    experience_years: number;
    rating: number;
    users?: {
      full_name: string;
      avatar_url?: string;
    };
  };
  mentee?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface MentorshipSession {
  id: string;
  mentorship_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  meeting_link?: string;
  agenda?: string;
  notes?: string;
  mentor_feedback?: string;
  mentee_feedback?: string;
  rating?: number;
  created_at: string;
}

// Hook para obtener mentorías del usuario (como mentor o mentee)
export const useMentorships = (role?: 'mentor' | 'mentee') => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['mentorships', user?.id, role],
    queryFn: async (): Promise<Mentorship[]> => {
      if (!user) return [];

      let query = supabase
        .from('mentorships')
        .select(`
          *,
          mentor:mentors!inner(
            id,
            user_id,
            specialties,
            experience_years,
            rating,
            users!inner(
              full_name,
              avatar_url
            )
          ),
          mentee:users!mentee_id(
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (role === 'mentor') {
        query = query.eq('mentor.user_id', user.auth_user_id);
      } else if (role === 'mentee') {
        query = query.eq('mentee_id', user.auth_user_id);
      } else {
        // Ambos roles
        query = query.or(`mentee_id.eq.${user.auth_user_id},mentor.user_id.eq.${user.auth_user_id}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

// Hook para crear una nueva mentoría
export const useCreateMentorship = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async (mentorshipData: {
      mentor_id: string;
      goals: string[];
      start_date: string;
    }) => {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('mentorships')
        .insert({
          ...mentorshipData,
          mentee_id: user.auth_user_id,
          status: 'pending',
          progress_notes: [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorships'] });
    },
  });
};

// Hook para actualizar una mentoría
export const useUpdateMentorship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mentorshipId,
      updates,
    }: {
      mentorshipId: string;
      updates: Partial<Mentorship>;
    }) => {
      const { data, error } = await supabase
        .from('mentorships')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', mentorshipId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorships'] });
    },
  });
};

// Hook para obtener sesiones de una mentoría
export const useMentorshipSessions = (mentorshipId: string) => {
  return useQuery({
    queryKey: ['mentorship-sessions', mentorshipId],
    queryFn: async (): Promise<MentorshipSession[]> => {
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select('*')
        .eq('mentorship_id', mentorshipId)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!mentorshipId,
  });
};

// Hook para crear una sesión de mentoría
export const useCreateMentorshipSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: {
      mentorship_id: string;
      scheduled_at: string;
      duration_minutes?: number;
      agenda?: string;
      meeting_link?: string;
    }) => {
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .insert({
          ...sessionData,
          status: 'scheduled',
          duration_minutes: sessionData.duration_minutes || 60,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['mentorship-sessions', variables.mentorship_id] 
      });
    },
  });
};

// Hook para estadísticas de mentoría
export const useMentorshipStats = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['mentorship-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [
        activeMentorships,
        completedSessions,
        upcomingSessions,
        totalHours,
      ] = await Promise.all([
        supabase
          .from('mentorships')
          .select('id')
          .or(`mentee_id.eq.${user.auth_user_id},mentor.user_id.eq.${user.auth_user_id}`)
          .eq('status', 'active'),
        
        supabase
          .from('mentorship_sessions')
          .select('id')
          .eq('status', 'completed')
          .in('mentorship_id', 
            supabase
              .from('mentorships')
              .select('id')
              .or(`mentee_id.eq.${user.auth_user_id},mentor.user_id.eq.${user.auth_user_id}`)
          ),
        
        supabase
          .from('mentorship_sessions')
          .select('id')
          .eq('status', 'scheduled')
          .gte('scheduled_at', new Date().toISOString())
          .in('mentorship_id', 
            supabase
              .from('mentorships')
              .select('id')
              .or(`mentee_id.eq.${user.auth_user_id},mentor.user_id.eq.${user.auth_user_id}`)
          ),
        
        supabase
          .from('mentorship_sessions')
          .select('duration_minutes')
          .eq('status', 'completed')
          .in('mentorship_id', 
            supabase
              .from('mentorships')
              .select('id')
              .or(`mentee_id.eq.${user.auth_user_id},mentor.user_id.eq.${user.auth_user_id}`)
          ),
      ]);

      const totalMinutes = totalHours.data?.reduce((sum, session) => 
        sum + (session.duration_minutes || 0), 0) || 0;

      return {
        activeMentorships: activeMentorships.data?.length || 0,
        completedSessions: completedSessions.data?.length || 0,
        upcomingSessions: upcomingSessions.data?.length || 0,
        totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      };
    },
    enabled: !!user,
  });
};