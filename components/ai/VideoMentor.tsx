import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, RotateCcw, Download } from 'lucide-react-native';
import { useVideoGeneration } from '@/hooks/useVideoGeneration';
import { useTheme } from '@/contexts/ThemeContext';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProgressBar from '@/components/animations/ProgressBar';

interface VideoMentorProps {
  mentorName: string;
  specialty: string;
  script: string;
  onVideoReady?: (videoUrl: string) => void;
  autoPlay?: boolean;
}

export default function VideoMentor({
  mentorName,
  specialty,
  script,
  onVideoReady,
  autoPlay = false,
}: VideoMentorProps) {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);

  const {
    createVideoProject,
    projects,
    isLoading,
    error,
  } = useVideoGeneration();

  useEffect(() => {
    // Generar video automáticamente cuando se monta el componente
    generateVideo();
  }, [script]);

  useEffect(() => {
    // Notificar cuando el video esté listo
    if (currentProject?.status === 'completed' && currentProject.videoUrl) {
      onVideoReady?.(currentProject.videoUrl);
      
      if (autoPlay) {
        setIsPlaying(true);
      }
    }
  }, [currentProject, onVideoReady, autoPlay]);

  const generateVideo = async () => {
    const project = await createVideoProject(script, {
      background: 'office',
      resolution: '720p',
    });
    
    if (project) {
      setCurrentProject(project);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRegenerate = () => {
    setCurrentProject(null);
    generateVideo();
  };

  const handleDownload = () => {
    if (currentProject?.videoUrl) {
      // Implementar descarga del video
      window.open(currentProject.videoUrl, '_blank');
    }
  };

  const getStatusMessage = () => {
    if (!currentProject) return 'Preparando...';
    
    switch (currentProject.status) {
      case 'pending':
        return 'Iniciando generación...';
      case 'processing':
        return 'Generando video personalizado...';
      case 'completed':
        return 'Video listo';
      case 'failed':
        return 'Error en la generación';
      default:
        return 'Procesando...';
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      margin: 16,
    },
    header: {
      marginBottom: 16,
    },
    mentorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    avatarText: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: 'white',
    },
    mentorDetails: {
      flex: 1,
    },
    mentorName: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
    },
    mentorSpecialty: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
    },
    videoContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      aspectRatio: 16 / 9,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      overflow: 'hidden',
    },
    video: {
      width: '100%',
      height: '100%',
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusText: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      color: theme.colors.textSecondary,
      marginTop: 12,
      textAlign: 'center',
    },
    progressContainer: {
      marginTop: 16,
      marginBottom: 8,
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
    },
    controlButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
    },
    scriptPreview: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 12,
      marginTop: 16,
    },
    scriptText: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textMuted,
      lineHeight: 16,
    },
    errorContainer: {
      backgroundColor: theme.colors.error + '10',
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    errorText: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.error,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.mentorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {mentorName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.mentorDetails}>
            <Text style={styles.mentorName}>{mentorName}</Text>
            <Text style={styles.mentorSpecialty}>{specialty}</Text>
          </View>
        </View>
      </View>

      <View style={styles.videoContainer}>
        {currentProject?.status === 'completed' && currentProject.videoUrl ? (
          <video
            src={currentProject.videoUrl}
            style={styles.video}
            controls={false}
            autoPlay={isPlaying}
            loop={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size={40} variant="circle" />
            <Text style={styles.statusText}>{getStatusMessage()}</Text>
            
            {currentProject?.status === 'processing' && (
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={0.6} // Progreso estimado
                  height={4}
                  animated
                />
              </View>
            )}
          </View>
        )}
      </View>

      {currentProject?.status === 'completed' && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePlayPause}
          >
            {isPlaying ? (
              <Pause size={20} color="white" />
            ) : (
              <Play size={20} color="white" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleRegenerate}
          >
            <RotateCcw size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleDownload}
          >
            <Download size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error al generar el video: {error}
          </Text>
          <AnimatedButton
            title="Reintentar"
            onPress={handleRegenerate}
            variant="secondary"
            size="sm"
            style={{ marginTop: 8 }}
          />
        </View>
      )}

      <View style={styles.scriptPreview}>
        <Text style={styles.scriptText}>
          Script: {script.substring(0, 100)}...
        </Text>
      </View>
    </View>
  );
}