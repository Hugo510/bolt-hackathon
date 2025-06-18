// Barrel export para todos los hooks
export { useUser, useUpdateUser, useIsMentor, useUserPreferences } from './useUser';
export { 
  useMentorships, 
  useCreateMentorship, 
  useUpdateMentorship,
  useMentorshipSessions,
  useCreateMentorshipSession,
  useMentorshipStats 
} from './useMentorships';
export { 
  useEmotionalLogs, 
  useCreateEmotionalLog, 
  useEmotionalInsights,
  useEmotionalLogsByEmotion,
  useEmotionalTracking 
} from './useEmotionalLogs';
export { 
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useCreateNotification,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useDeleteNotification,
  useClearOldNotifications 
} from './useNotifications';
export { 
  useAnalytics, 
  usePerformanceTracking, 
  useABTesting 
} from './useAnalytics';
export { 
  useOfflineSync, 
  useOfflineFirst 
} from './useOfflineSync';

// Re-export hooks existentes
export { useVocationalTests } from './useVocationalTests';
export { useMentorSessions } from './useMentorSessions';
export { useCommunityPosts } from './useCommunityPosts';
export { useChatMessages } from './useChatMessages';
export { useUserProgress } from './useUserProgress';
export { useResources } from './useResources';
export { useResponsive } from './useResponsive';
export { useAIServices } from './useAIServices';