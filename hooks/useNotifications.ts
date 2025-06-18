import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';

export interface Notification {
  id: string;
  user_id: string;
  type: 'mentorship' | 'test_result' | 'achievement' | 'reminder' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  action_url?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expires_at?: string;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  mentorship_reminders: boolean;
  achievement_alerts: boolean;
  weekly_summary: boolean;
  marketing_emails: boolean;
  updated_at: string;
}

// Hook para obtener notificaciones
export const useNotifications = (unreadOnly = false) => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['notifications', user?.id, unreadOnly],
    queryFn: async (): Promise<Notification[]> => {
      if (!user) return [];

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('read', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

// Hook para contar notificaciones no leídas
export const useUnreadNotificationsCount = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['unread-notifications-count', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
};

// Hook para marcar notificación como leída
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
  });
};

// Hook para marcar todas las notificaciones como leídas
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
  });
};

// Hook para crear notificación
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationData: Omit<Notification, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
  });
};

// Hook para obtener preferencias de notificaciones
export const useNotificationPreferences = () => {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async (): Promise<NotificationPreferences | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Crear preferencias por defecto
          const defaultPreferences = {
            user_id: user.id,
            email_notifications: true,
            push_notifications: true,
            mentorship_reminders: true,
            achievement_alerts: true,
            weekly_summary: true,
            marketing_emails: false,
          };

          const { data: created, error: createError } = await supabase
            .from('notification_preferences')
            .insert(defaultPreferences)
            .select()
            .single();

          if (createError) throw createError;
          return created;
        }
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });
};

// Hook para actualizar preferencias de notificaciones
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('notification_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
};

// Hook para eliminar notificación
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
  });
};

// Hook para limpiar notificaciones antiguas
export const useClearOldNotifications = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async (daysOld = 30) => {
      if (!user) throw new Error('No authenticated user');

      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('read', true)
        .lt('created_at', cutoffDate);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};