import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wifi, WifiOff, Cloud, CloudOff, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface DataSyncIndicatorProps {
  showDetails?: boolean;
}

export default function DataSyncIndicator({ showDetails = false }: DataSyncIndicatorProps) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Simular verificación de conectividad
    const checkConnectivity = () => {
      // En una app real, usarías @react-native-community/netinfo
      setIsOnline(navigator.onLine);
    };

    checkConnectivity();
    window.addEventListener('online', checkConnectivity);
    window.addEventListener('offline', checkConnectivity);

    return () => {
      window.removeEventListener('online', checkConnectivity);
      window.removeEventListener('offline', checkConnectivity);
    };
  }, []);

  useEffect(() => {
    // Monitorear estado de las queries
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === 'updated') {
        const query = event.query;
        if (query.state.isFetching) {
          setSyncStatus('syncing');
          rotation.value = withTiming(360, { duration: 1000 });
        } else if (query.state.isError) {
          setSyncStatus('error');
          scale.value = withSpring(1.2, {}, () => {
            scale.value = withSpring(1);
          });
        } else {
          setSyncStatus('synced');
          rotation.value = 0;
        }
      }
    });

    return unsubscribe;
  }, [queryClient]);

  useEffect(() => {
    if (!isOnline) {
      setSyncStatus('offline');
      opacity.value = withTiming(0.6);
    } else {
      opacity.value = withTiming(1);
    }
  }, [isOnline]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const getStatusInfo = () => {
    switch (syncStatus) {
      case 'syncing':
        return {
          icon: Cloud,
          color: theme.colors.primary,
          text: 'Sincronizando...',
          description: 'Guardando cambios en la nube',
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: theme.colors.error,
          text: 'Error de sincronización',
          description: 'Algunos datos no se pudieron guardar',
        };
      case 'offline':
        return {
          icon: CloudOff,
          color: theme.colors.warning,
          text: 'Sin conexión',
          description: 'Los cambios se guardarán cuando vuelvas a conectarte',
        };
      default:
        return {
          icon: CheckCircle,
          color: theme.colors.success,
          text: 'Sincronizado',
          description: 'Todos los datos están actualizados',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: statusInfo.color + '30',
    },
    iconContainer: {
      marginRight: showDetails ? 8 : 0,
    },
    textContainer: {
      flex: 1,
    },
    statusText: {
      fontSize: 12,
      fontFamily: 'Inter_500Medium',
      color: statusInfo.color,
    },
    descriptionText: {
      fontSize: 10,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    networkIcon: {
      marginLeft: 8,
    },
  });

  if (!showDetails) {
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.iconContainer}>
          <StatusIcon size={16} color={statusInfo.color} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.iconContainer}>
        <StatusIcon size={16} color={statusInfo.color} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.statusText}>{statusInfo.text}</Text>
        <Text style={styles.descriptionText}>{statusInfo.description}</Text>
      </View>
      
      <View style={styles.networkIcon}>
        {isOnline ? (
          <Wifi size={14} color={theme.colors.success} />
        ) : (
          <WifiOff size={14} color={theme.colors.error} />
        )}
      </View>
    </Animated.View>
  );
}