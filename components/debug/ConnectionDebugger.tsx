import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, RefreshCw, Database, Wifi } from 'lucide-react-native';
import { useConnectionStatus, useEnvironmentCheck } from '@/hooks/useConnectionStatus';
import { useTheme } from '@/contexts/ThemeContext';

interface ConnectionDebuggerProps {
  visible?: boolean;
  onClose?: () => void;
}

export default function ConnectionDebugger({ visible = true, onClose }: ConnectionDebuggerProps) {
  const { theme } = useTheme();
  const connectionStatus = useConnectionStatus();
  const envStatus = useEnvironmentCheck();

  if (!visible) return null;

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    debugPanel: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      margin: 20,
      maxWidth: 400,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
    },
    closeButton: {
      padding: 8,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
    },
    statusText: {
      marginLeft: 12,
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.text,
      flex: 1,
    },
    errorText: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.error,
      marginTop: 4,
      marginLeft: 32,
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      padding: 12,
      marginTop: 16,
    },
    refreshButtonText: {
      color: 'white',
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      marginLeft: 8,
    },
    timestamp: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginTop: 16,
    },
  });

  const getStatusIcon = (status: boolean, loading?: boolean) => {
    if (loading) return <AlertCircle size={20} color={theme.colors.warning} />;
    return status 
      ? <CheckCircle size={20} color={theme.colors.success} />
      : <XCircle size={20} color={theme.colors.error} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.debugPanel}>
        <View style={styles.header}>
          <Text style={styles.title}>Estado de Conexión</Text>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <XCircle size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Variables de Entorno */}
          <View style={styles.section}>
            <View style={[styles.sectionTitle, { flexDirection: 'row' }]}>
              <Database size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>
                Configuración
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              {getStatusIcon(envStatus.supabaseConfigured)}
              <Text style={styles.statusText}>Supabase configurado</Text>
            </View>
            
            <View style={styles.statusItem}>
              {getStatusIcon(envStatus.aiServicesConfigured)}
              <Text style={styles.statusText}>Servicios AI configurados</Text>
            </View>

            {envStatus.missingVars.length > 0 && (
              <Text style={styles.errorText}>
                Variables faltantes: {envStatus.missingVars.join(', ')}
              </Text>
            )}
          </View>

          {/* Estado de Conexión */}
          <View style={styles.section}>
            <View style={[styles.sectionTitle, { flexDirection: 'row' }]}>
              <Wifi size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>
                Conexión a Supabase
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              {getStatusIcon(connectionStatus.isConnected, connectionStatus.isLoading)}
              <Text style={styles.statusText}>
                {connectionStatus.isLoading 
                  ? 'Verificando conexión...' 
                  : connectionStatus.isConnected 
                    ? 'Conectado' 
                    : 'Desconectado'
                }
              </Text>
            </View>

            {connectionStatus.error && (
              <Text style={styles.errorText}>{connectionStatus.error}</Text>
            )}
          </View>

          {/* Estado del Esquema */}
          {connectionStatus.schemaStatus && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estado del Esquema</Text>
              
              <View style={styles.statusItem}>
                {getStatusIcon(connectionStatus.schemaStatus.failed === 0)}
                <Text style={styles.statusText}>
                  {connectionStatus.schemaStatus.successful}/{connectionStatus.schemaStatus.total} tablas verificadas
                </Text>
              </View>

              {connectionStatus.schemaStatus.failed > 0 && (
                <Text style={styles.errorText}>
                  {connectionStatus.schemaStatus.failed} tabla(s) con problemas
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={connectionStatus.refresh}
            disabled={connectionStatus.isLoading}
          >
            <RefreshCw size={16} color="white" />
            <Text style={styles.refreshButtonText}>
              {connectionStatus.isLoading ? 'Verificando...' : 'Verificar Conexión'}
            </Text>
          </TouchableOpacity>

          {connectionStatus.lastChecked && (
            <Text style={styles.timestamp}>
              Última verificación: {connectionStatus.lastChecked.toLocaleTimeString()}
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}