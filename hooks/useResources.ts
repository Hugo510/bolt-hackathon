import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Resource {
  id: string;
  title: string;
  description: string;
  content_type: 'article' | 'video' | 'course' | 'podcast' | 'book' | 'tool' | 'assessment';
  category: string;
  subcategory?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes?: number;
  language: string;
  tags: string[];
  url: string;
  thumbnail_url?: string;
  author?: string;
  provider?: string;
  rating: number;
  views_count: number;
  likes_count: number;
  is_premium: boolean;
  price?: number;
  currency: string;
  target_audience: string[];
  learning_objectives: string[];
  prerequisites: string[];
  certification_available: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useResources = (filters?: {
  category?: string;
  content_type?: string;
  difficulty_level?: string;
  search?: string;
  is_featured?: boolean;
}) => {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: async (): Promise<Resource[]> => {
      let query = supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.content_type) {
        query = query.eq('content_type', filters.content_type);
      }

      if (filters?.difficulty_level) {
        query = query.eq('difficulty_level', filters.difficulty_level);
      }

      if (filters?.is_featured) {
        query = query.eq('is_featured', filters.is_featured);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
};

export const useResource = (id: string) => {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: async (): Promise<Resource | null> => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

export const useIncrementResourceViews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resourceId: string) => {
      const { error } = await supabase.rpc('increment_resource_views', {
        resource_id: resourceId,
      });

      if (error) throw error;
    },
    onSuccess: (_, resourceId) => {
      queryClient.invalidateQueries({ queryKey: ['resource', resourceId] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};