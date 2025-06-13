import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface User {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  birth_date?: string;
  country?: string;
  city?: string;
  phone?: string;
  education_level?: string;
  interests: string[];
  goals: string[];
  preferred_language: string;
  timezone: string;
  is_mentor: boolean;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export const useUser = () => {
  const { user: authUser } = useAuth();

  return useQuery({
    queryKey: ['user', authUser?.id],
    queryFn: async (): Promise<User | null> => {
      if (!authUser) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Usuario no existe, crear uno nuevo
          const newUser = {
            auth_user_id: authUser.id,
            email: authUser.email!,
            full_name: authUser.user_metadata?.full_name || 'Usuario',
            interests: [],
            goals: [],
            preferred_language: 'es',
            timezone: 'America/Mexico_City',
            is_mentor: false,
            is_active: true,
          };

          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert(newUser)
            .select()
            .single();

          if (createError) throw createError;
          return createdUser;
        }
        throw error;
      }

      return data;
    },
    enabled: !!authUser,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<User>) => {
      if (!authUser) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('auth_user_id', authUser.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};