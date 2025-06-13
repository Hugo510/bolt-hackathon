import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Career {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  required_skills: string[];
  personality_match: string[];
  education_requirements: string[];
  average_salary_min?: number;
  average_salary_max?: number;
  job_outlook?: 'excellent' | 'good' | 'fair' | 'poor';
  work_environment: string[];
  related_careers: string[];
  growth_rate?: number;
  difficulty_level?: number;
  time_to_complete_years?: number;
  is_active: boolean;
  country_specific: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useCareers = (filters?: {
  category?: string;
  difficulty_level?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['careers', filters],
    queryFn: async (): Promise<Career[]> => {
      let query = supabase
        .from('careers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.difficulty_level) {
        query = query.eq('difficulty_level', filters.difficulty_level);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCareer = (id: string) => {
  return useQuery({
    queryKey: ['career', id],
    queryFn: async (): Promise<Career | null> => {
      const { data, error } = await supabase
        .from('careers')
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

export const useCareerCategories = () => {
  return useQuery({
    queryKey: ['career-categories'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('careers')
        .select('category')
        .eq('is_active', true);

      if (error) throw error;

      const categories = [...new Set(data?.map(item => item.category) || [])];
      return categories.sort();
    },
  });
};