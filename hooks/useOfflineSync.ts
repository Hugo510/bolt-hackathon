import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retries: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingActions: number;
  lastSyncTime?: Date;
  syncErrors: string[];
}

// Hook para manejo de sincronización offline
export const useOfflineSync = () => {
  const queryClient = useQueryClient();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingActions: 0,
    syncErrors: [],
  });

  // Detectar cambios en conectividad
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      syncPendingActions();
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cargar acciones pendientes al inicializar
  useEffect(() => {
    loadPendingActions();
  }, []);

  const loadPendingActions = async () => {
    try {
      const stored = await AsyncStorage.getItem('offline_actions');
      const actions: OfflineAction[] = stored ? JSON.parse(stored) : [];
      setSyncStatus(prev => ({ ...prev, pendingActions: actions.length }));
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
  };

  const savePendingAction = async (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>) => {
    try {
      const stored = await AsyncStorage.getItem('offline_actions');
      const actions: OfflineAction[] = stored ? JSON.parse(stored) : [];
      
      const newAction: OfflineAction = {
        ...action,
        id: Date.now().toString(),
        timestamp: Date.now(),
        retries: 0,
      };

      actions.push(newAction);
      await AsyncStorage.setItem('offline_actions', JSON.stringify(actions));
      
      setSyncStatus(prev => ({ ...prev, pendingActions: actions.length }));
      
      // Intentar sincronizar inmediatamente si estamos online
      if (syncStatus.isOnline) {
        syncPendingActions();
      }
    } catch (error) {
      console.error('Error saving pending action:', error);
    }
  };

  const syncPendingActions = async () => {
    if (syncStatus.isSyncing || !syncStatus.isOnline) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncErrors: [] }));

    try {
      const stored = await AsyncStorage.getItem('offline_actions');
      const actions: OfflineAction[] = stored ? JSON.parse(stored) : [];

      if (actions.length === 0) {
        setSyncStatus(prev => ({ 
          ...prev, 
          isSyncing: false, 
          lastSyncTime: new Date() 
        }));
        return;
      }

      const successfulActions: string[] = [];
      const errors: string[] = [];

      for (const action of actions) {
        try {
          await executeAction(action);
          successfulActions.push(action.id);
        } catch (error) {
          console.error(`Error syncing action ${action.id}:`, error);
          errors.push(`Error en ${action.type} ${action.table}: ${error}`);
          
          // Incrementar contador de reintentos
          action.retries++;
          
          // Eliminar acción si ha fallado demasiadas veces
          if (action.retries >= 3) {
            successfulActions.push(action.id);
            errors.push(`Acción ${action.id} eliminada tras 3 intentos fallidos`);
          }
        }
      }

      // Remover acciones exitosas
      const remainingActions = actions.filter(action => 
        !successfulActions.includes(action.id)
      );

      await AsyncStorage.setItem('offline_actions', JSON.stringify(remainingActions));

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        pendingActions: remainingActions.length,
        lastSyncTime: new Date(),
        syncErrors: errors,
      }));

      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries();

    } catch (error) {
      console.error('Error during sync:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncErrors: [`Error general de sincronización: ${error}`],
      }));
    }
  };

  const executeAction = async (action: OfflineAction) => {
    const { supabase } = await import('@/lib/supabase');
    
    switch (action.type) {
      case 'create':
        const { error: createError } = await supabase
          .from(action.table)
          .insert(action.data);
        if (createError) throw createError;
        break;

      case 'update':
        const { error: updateError } = await supabase
          .from(action.table)
          .update(action.data.updates)
          .eq('id', action.data.id);
        if (updateError) throw updateError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from(action.table)
          .delete()
          .eq('id', action.data.id);
        if (deleteError) throw deleteError;
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  };

  const clearSyncErrors = () => {
    setSyncStatus(prev => ({ ...prev, syncErrors: [] }));
  };

  const forcSync = () => {
    if (syncStatus.isOnline) {
      syncPendingActions();
    }
  };

  const clearAllPendingActions = async () => {
    await AsyncStorage.removeItem('offline_actions');
    setSyncStatus(prev => ({ ...prev, pendingActions: 0 }));
  };

  return {
    syncStatus,
    savePendingAction,
    syncPendingActions,
    clearSyncErrors,
    forcSync,
    clearAllPendingActions,
  };
};

// Hook para operaciones offline-first
export const useOfflineFirst = () => {
  const { savePendingAction, syncStatus } = useOfflineSync();

  const createOffline = useCallback(async (table: string, data: any) => {
    if (syncStatus.isOnline) {
      // Si estamos online, ejecutar directamente
      const { supabase } = await import('@/lib/supabase');
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } else {
      // Si estamos offline, guardar para sincronizar después
      await savePendingAction({
        type: 'create',
        table,
        data,
      });
      
      // Retornar datos con ID temporal
      return {
        ...data,
        id: `temp_${Date.now()}`,
        _isTemporary: true,
      };
    }
  }, [savePendingAction, syncStatus.isOnline]);

  const updateOffline = useCallback(async (table: string, id: string, updates: any) => {
    if (syncStatus.isOnline) {
      const { supabase } = await import('@/lib/supabase');
      const { data: result, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } else {
      await savePendingAction({
        type: 'update',
        table,
        data: { id, updates },
      });
      
      return { id, ...updates, _isTemporary: true };
    }
  }, [savePendingAction, syncStatus.isOnline]);

  const deleteOffline = useCallback(async (table: string, id: string) => {
    if (syncStatus.isOnline) {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } else {
      await savePendingAction({
        type: 'delete',
        table,
        data: { id },
      });
    }
  }, [savePendingAction, syncStatus.isOnline]);

  return {
    createOffline,
    updateOffline,
    deleteOffline,
    isOnline: syncStatus.isOnline,
  };
};