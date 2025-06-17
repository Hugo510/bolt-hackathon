import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

// Hook genérico para queries de Supabase
export function useSupabaseQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: QueryOptions
) {
  const { session } = useAuthStore();
  
  return useQuery({
    queryKey,
    queryFn,
    enabled: !!session && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutos
    gcTime: options?.gcTime ?? 1000 * 60 * 30, // 30 minutos
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
  });
}

// Hook para mutaciones de Supabase
export function useSupabaseMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: any, variables: TVariables) => void;
    invalidateQueries?: string[][];
  }
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
    retry: 1,
  });
}

// Hook para datos del usuario actual
export function useCurrentUser() {
  const { user } = useAuthStore();
  
  return useSupabaseQuery(
    ['user', user?.id],
    async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    { enabled: !!user }
  );
}

// Hook para actualizar perfil de usuario
export function useUpdateProfile() {
  const { user } = useAuthStore();
  
  return useSupabaseMutation(
    async (updates: any) => {
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['user']],
    }
  );
}