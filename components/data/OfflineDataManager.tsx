import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RefreshCw, Upload, Download } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import AnimatedButton from '@/components/ui/AnimatedButton';

interface OfflineDataManagerProps {
  onSyncRequested?: () => void;
}

export default function OfflineDataManager({ onSyncRequested }: OfflineDataManagerProps) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [pendingChanges, setPendingChanges] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Simular conteo de cambios pendientes
    // En una implementación real, esto vendría de un store offline
    const checkPendingChanges = () => {
      const queries = queryClient.getQueryCache().getAll();
      const pendingMutations = queryClient.getMutationCache().getAll()
        .filter(mutation => mutation.state.status === 'pending').length;
      
      setPendingChanges(pendingMutations);
    };

    checkPendingChanges();
    const interval = setInterval(checkPendingChanges, 5000);

    return () => clearInterval(interval);
  }, [queryClient]);

  const handleSyncAll = () => {
    // Invalidar todas las queries para forzar re-fetch
    queryClient.invalidateQueries();
    setLastSyncTime(new Date());
    onSyncRequested?.();
  };

  const handleRetryFailedMutations = () => {
    // Reintentar mutaciones fallidas
    const failedMutations = queryClient.getMutationCache().getAll()
      .filter(mutation => mutation.state.status === 'error');
    
    failedMutations.forEach(mutation => {
      mutation.execute();
    });
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      margin: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
    },
    syncTime: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textMuted,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 16,
    },
    stat: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontFamily: 'Inter_700Bold',
      color: theme.colors.text,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
    },
    pendingIndicator: {
      backgroundColor: theme.colors.warning + '20',
      borderRadius: 8,
      padding: 8,
      marginBottom: 12,
    },
    pendingText: {
      fontSize: 12,
      fontFamily: 'Inter_500Medium',
      color: theme.colors.warning,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Datos</Text>
        {lastSyncTime && (
          <Text style={styles.syncTime}>
            Última sincronización: {lastSyncTime.toLocaleTimeString()}
          </Text>
        )}
      </View>

      {pendingChanges > 0 && (
        <View style={styles.pendingIndicator}>
          <Text style={styles.pendingText}>
            {pendingChanges} cambio{pendingChanges !== 1 ? 's' : ''} pendiente{pendingChanges !== 1 ? 's' : ''} de sincronizar
          </Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{queryClient.getQueryCache().getAll().length}</Text>
          <Text style={styles.statLabel}>Consultas en caché</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{pendingChanges}</Text>
          <Text style={styles.statLabel}>Cambios pendientes</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {queryClient.getMutationCache().getAll()
              .filter(m => m.state.status === 'error').length}
          </Text>
          <Text style={styles.statLabel}>Errores</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <AnimatedButton
          title="Sincronizar Todo"
          onPress={handleSyncAll}
          variant="primary"
          size="sm"
          icon={<RefreshCw size={16} color="white" />}
          style={styles.actionButton}
        />
        
        <AnimatedButton
          title="Reintentar Errores"
          onPress={handleRetryFailedMutations}
          variant="secondary"
          size="sm"
          icon={<Upload size={16} color={theme.colors.text} />}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}