import { useCallback } from 'react';
import { useUser } from './useUser';

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: Date;
}

export interface UserProperties {
  age?: number;
  country?: string;
  interests?: string[];
  is_mentor?: boolean;
  education_level?: string;
  signup_date?: string;
}

// Hook para analytics y tracking
export const useAnalytics = () => {
  const { data: user } = useUser();

  // Función para trackear eventos
  const track = useCallback((event: string, properties?: Record<string, any>) => {
    const eventData: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        platform: 'web',
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
      userId: user?.id,
      timestamp: new Date(),
    };

    // En desarrollo, solo log a consola
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventData);
      return;
    }

    // Aquí se integraría con servicios como Mixpanel, Amplitude, etc.
    // Ejemplo con Mixpanel:
    // if (window.mixpanel) {
    //   window.mixpanel.track(event, eventData.properties);
    // }
  }, [user]);

  // Función para identificar usuario
  const identify = useCallback((userId: string, properties?: UserProperties) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('👤 Analytics Identify:', { userId, properties });
      return;
    }

    // Ejemplo con Mixpanel:
    // if (window.mixpanel) {
    //   window.mixpanel.identify(userId);
    //   if (properties) {
    //     window.mixpanel.people.set(properties);
    //   }
    // }
  }, []);

  // Función para trackear páginas/pantallas
  const page = useCallback((pageName: string, properties?: Record<string, any>) => {
    track('Page Viewed', {
      page_name: pageName,
      ...properties,
    });
  }, [track]);

  // Eventos específicos de la app
  const trackTestStarted = useCallback((testType: string) => {
    track('Test Started', {
      test_type: testType,
    });
  }, [track]);

  const trackTestCompleted = useCallback((testType: string, results: any) => {
    track('Test Completed', {
      test_type: testType,
      completion_time: results.completionTime,
      score: results.score,
    });
  }, [track]);

  const trackMentorshipRequested = useCallback((mentorId: string) => {
    track('Mentorship Requested', {
      mentor_id: mentorId,
    });
  }, [track]);

  const trackChatMessage = useCallback((messageType: 'user' | 'ai', emotion?: string) => {
    track('Chat Message Sent', {
      message_type: messageType,
      emotion_detected: emotion,
    });
  }, [track]);

  const trackResourceViewed = useCallback((resourceId: string, resourceType: string) => {
    track('Resource Viewed', {
      resource_id: resourceId,
      resource_type: resourceType,
    });
  }, [track]);

  const trackEmotionalLogCreated = useCallback((emotion: string, intensity: number) => {
    track('Emotional Log Created', {
      emotion_primary: emotion,
      intensity,
    });
  }, [track]);

  const trackFeatureUsed = useCallback((feature: string, context?: Record<string, any>) => {
    track('Feature Used', {
      feature_name: feature,
      ...context,
    });
  }, [track]);

  const trackError = useCallback((error: string, context?: Record<string, any>) => {
    track('Error Occurred', {
      error_message: error,
      ...context,
    });
  }, [track]);

  return {
    track,
    identify,
    page,
    trackTestStarted,
    trackTestCompleted,
    trackMentorshipRequested,
    trackChatMessage,
    trackResourceViewed,
    trackEmotionalLogCreated,
    trackFeatureUsed,
    trackError,
  };
};

// Hook para métricas de rendimiento
export const usePerformanceTracking = () => {
  const { track } = useAnalytics();

  const trackPageLoad = useCallback((pageName: string) => {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      track('Page Load Performance', {
        page_name: pageName,
        load_time_ms: Math.round(loadTime),
      });
    };
  }, [track]);

  const trackAPICall = useCallback((endpoint: string, method: string) => {
    const startTime = performance.now();
    
    return (success: boolean, statusCode?: number) => {
      const duration = performance.now() - startTime;
      track('API Call Performance', {
        endpoint,
        method,
        success,
        status_code: statusCode,
        duration_ms: Math.round(duration),
      });
    };
  }, [track]);

  return {
    trackPageLoad,
    trackAPICall,
  };
};

// Hook para A/B testing
export const useABTesting = () => {
  const { data: user } = useUser();
  const { track } = useAnalytics();

  const getVariant = useCallback((experimentName: string, variants: string[]) => {
    if (!user) return variants[0];

    // Usar hash del user ID para determinar variante de forma consistente
    const hash = user.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const variantIndex = Math.abs(hash) % variants.length;
    const variant = variants[variantIndex];

    // Trackear exposición al experimento
    track('Experiment Exposure', {
      experiment_name: experimentName,
      variant,
    });

    return variant;
  }, [user, track]);

  const trackConversion = useCallback((experimentName: string, variant: string, conversionEvent: string) => {
    track('Experiment Conversion', {
      experiment_name: experimentName,
      variant,
      conversion_event: conversionEvent,
    });
  }, [track]);

  return {
    getVariant,
    trackConversion,
  };
};