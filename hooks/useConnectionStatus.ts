import { useState, useEffect } from 'react';
import { supabase, testConnection, checkDatabaseSchema } from '@/lib/supabase';

interface ConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  schemaStatus: {
    successful: number;
    failed: number;
    total: number;
  } | null;
  lastChecked: Date | null;
}

// Hook para monitorear el estado de conexión a Supabase
export const useConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: true,
    error: null,
    schemaStatus: null,
    lastChecked: null,
  });

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const isConnected = await testConnection();
      const schemaStatus = await checkDatabaseSchema();

      setStatus({
        isConnected,
        isLoading: false,
        error: null,
        schemaStatus,
        lastChecked: new Date(),
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        lastChecked: new Date(),
      }));
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Verificar conexión cada 5 minutos
    const interval = setInterval(checkConnection, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    ...status,
    refresh: checkConnection,
  };
};

// Hook para verificar configuración de variables de entorno
export const useEnvironmentCheck = () => {
  const [envStatus, setEnvStatus] = useState({
    supabaseConfigured: false,
    aiServicesConfigured: false,
    missingVars: [] as string[],
  });

  useEffect(() => {
    const requiredVars = [
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    ];

    const optionalVars = [
      'EXPO_PUBLIC_ELEVENLABS_API_KEY',
      'EXPO_PUBLIC_TAVUS_API_KEY',
      'EXPO_PUBLIC_OPENAI_API_KEY',
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    const aiConfigured = optionalVars.some(varName => process.env[varName]);

    setEnvStatus({
      supabaseConfigured: missing.length === 0,
      aiServicesConfigured: aiConfigured,
      missingVars: missing,
    });
  }, []);

  return envStatus;
};