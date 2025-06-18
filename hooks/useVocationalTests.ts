import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';

export interface VocationalTestResult {
  career_matches: CareerMatch[];
  personality_type: string;
  strengths: string[];
  recommendations: string[];
  interests: string[];
  skills_assessment: Record<string, number>;
  values_ranking: string[];
}

export interface CareerMatch {
  career: string;
  match_percentage: number;
  description: string;
  skills_required: string[];
  education_path: string[];
  salary_range?: {
    min: number;
    max: number;
  };
  job_outlook: string;
}

export interface VocationalTest {
  id: string;
  user_id: string;
  test_type: 'personality' | 'interests' | 'skills' | 'comprehensive';
  questions_answered: number;
  total_questions: number;
  results?: VocationalTestResult;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useVocationalTests = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['vocational-tests', user?.id],
    queryFn: async (): Promise<VocationalTest[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('vocational_tests')
        .select('*')
        .eq('user_id', user.auth_user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateVocationalTest = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async (testData: {
      test_type: VocationalTest['test_type'];
      total_questions: number;
    }) => {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('vocational_tests')
        .insert({
          user_id: user.auth_user_id,
          test_type: testData.test_type,
          total_questions: testData.total_questions,
          questions_answered: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocational-tests'] });
    },
  });
};

export const useUpdateVocationalTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      testId,
      updates,
    }: {
      testId: string;
      updates: Partial<VocationalTest>;
    }) => {
      const { data, error } = await supabase
        .from('vocational_tests')
        .update(updates)
        .eq('id', testId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocational-tests'] });
    },
  });
};

export const useCompleteVocationalTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      testId,
      results,
    }: {
      testId: string;
      results: VocationalTestResult;
    }) => {
      const { data, error } = await supabase
        .from('vocational_tests')
        .update({
          results,
          completed_at: new Date().toISOString(),
          questions_answered: results.career_matches.length > 0 ? 100 : 0, // Asumiendo 100% completado
        })
        .eq('id', testId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocational-tests'] });
    },
  });
};

export const useLatestTestResults = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['latest-test-results', user?.id],
    queryFn: async (): Promise<VocationalTest | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('vocational_tests')
        .select('*')
        .eq('user_id', user.auth_user_id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });
};