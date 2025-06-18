// Utilidades para testing de hooks
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Wrapper para testing con React Query
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

export const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Mock para Supabase
export const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
  auth: {
    getUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
};

// Helpers para testing de hooks específicos
export const mockUser = {
  id: 'test-user-id',
  auth_user_id: 'auth-test-id',
  email: 'test@example.com',
  full_name: 'Test User',
  interests: ['technology', 'design'],
  goals: ['learn programming'],
  preferred_language: 'es',
  timezone: 'America/Mexico_City',
  is_mentor: false,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockEmotionalLog = {
  id: 'test-log-id',
  user_id: 'test-user-id',
  emotion_primary: 'happy',
  intensity: 7,
  triggers: ['success', 'achievement'],
  coping_strategies: ['meditation'],
  ai_recommendations: ['continue positive activities'],
  follow_up_needed: false,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockMentorship = {
  id: 'test-mentorship-id',
  mentor_id: 'mentor-id',
  mentee_id: 'test-user-id',
  status: 'active' as const,
  start_date: '2024-01-01',
  goals: ['career guidance'],
  progress_notes: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Función para esperar a que se resuelvan las queries
export const waitForQuery = async (hook: any) => {
  await waitFor(() => {
    expect(hook.result.current.isLoading).toBe(false);
  });
};