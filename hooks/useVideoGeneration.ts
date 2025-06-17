import { useState, useCallback } from 'react';
import { useTavus } from './useAIServices';

export interface VideoGenerationOptions {
  replicaId?: string;
  background?: 'office' | 'home' | 'studio' | 'outdoor' | 'custom';
  resolution?: '720p' | '1080p';
  duration?: number;
  customBackground?: string;
}

export interface VideoProject {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  createdAt: Date;
  script: string;
  options: VideoGenerationOptions;
}

// Hook para generación de videos personalizados con AI
export function useVideoGeneration() {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [currentProject, setCurrentProject] = useState<VideoProject | null>(null);
  
  const { 
    generateVideo, 
    getVideoStatus, 
    getReplicas, 
    isLoading, 
    error, 
    clearError 
  } = useTavus();

  const createVideoProject = useCallback(async (
    script: string,
    options: VideoGenerationOptions = {}
  ): Promise<VideoProject | null> => {
    const project: VideoProject = {
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date(),
      script,
      options,
    };

    setProjects(prev => [project, ...prev]);
    setCurrentProject(project);

    const result = await generateVideo(script, options);

    if (result.success && result.data) {
      const updatedProject = {
        ...project,
        status: 'processing' as const,
        videoUrl: result.data.videoUrl,
      };

      setProjects(prev => 
        prev.map(p => p.id === project.id ? updatedProject : p)
      );
      setCurrentProject(updatedProject);

      // Polling para verificar el estado del video
      const pollStatus = async () => {
        const statusResult = await getVideoStatus(result.data!.videoId);
        
        if (statusResult.success && statusResult.data) {
          const finalProject = {
            ...updatedProject,
            status: statusResult.data.status === 'completed' ? 'completed' as const : 'processing' as const,
            videoUrl: statusResult.data.videoUrl || updatedProject.videoUrl,
          };

          setProjects(prev => 
            prev.map(p => p.id === project.id ? finalProject : p)
          );
          setCurrentProject(finalProject);

          if (statusResult.data.status !== 'completed') {
            setTimeout(pollStatus, 5000); // Verificar cada 5 segundos
          }
        }
      };

      setTimeout(pollStatus, 2000); // Esperar 2 segundos antes del primer check
      return updatedProject;
    } else {
      const failedProject = { ...project, status: 'failed' as const };
      setProjects(prev => 
        prev.map(p => p.id === project.id ? failedProject : p)
      );
      setCurrentProject(failedProject);
      return null;
    }
  }, [generateVideo, getVideoStatus]);

  const getAvailableReplicas = useCallback(async () => {
    const result = await getReplicas();
    return result.success ? result.data : [];
  }, [getReplicas]);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  }, [currentProject]);

  const getProjectById = useCallback((projectId: string) => {
    return projects.find(p => p.id === projectId) || null;
  }, [projects]);

  // Templates predefinidos para diferentes casos de uso
  const generateMentorIntroduction = useCallback(async (
    mentorName: string,
    specialty: string,
    experience: string
  ) => {
    const script = `
¡Hola! Soy ${mentorName}, tu mentor especializado en ${specialty}. 
Con ${experience} años de experiencia en el campo, estoy aquí para guiarte en tu camino profesional.
Mi objetivo es ayudarte a descubrir tus fortalezas y encontrar la carrera que mejor se adapte a ti.
¡Estoy emocionado de trabajar contigo y ver todo lo que puedes lograr!
    `.trim();

    return createVideoProject(script, {
      background: 'office',
      resolution: '720p',
    });
  }, [createVideoProject]);

  const generateCareerExplanation = useCallback(async (
    careerName: string,
    description: string,
    requirements: string[]
  ) => {
    const script = `
Te voy a explicar todo sobre la carrera de ${careerName}.
${description}
Para tener éxito en esta área, es importante que desarrolles estas habilidades: ${requirements.join(', ')}.
Esta carrera ofrece muchas oportunidades de crecimiento y puede ser muy gratificante si se alinea con tus intereses y valores.
¿Te gustaría saber más sobre algún aspecto específico?
    `.trim();

    return createVideoProject(script, {
      background: 'studio',
      resolution: '720p',
    });
  }, [createVideoProject]);

  const generateMotivationalMessage = useCallback(async (
    studentName: string,
    achievement: string
  ) => {
    const script = `
¡Felicidades ${studentName}! 
Quiero reconocer tu logro: ${achievement}. 
Este es un paso importante en tu desarrollo profesional y personal.
Recuerda que cada pequeño paso te acerca más a tus metas.
Sigue así, tienes todo lo necesario para alcanzar el éxito.
¡Estoy muy orgulloso de tu progreso!
    `.trim();

    return createVideoProject(script, {
      background: 'home',
      resolution: '720p',
    });
  }, [createVideoProject]);

  return {
    projects,
    currentProject,
    createVideoProject,
    getAvailableReplicas,
    deleteProject,
    getProjectById,
    generateMentorIntroduction,
    generateCareerExplanation,
    generateMotivationalMessage,
    isLoading,
    error,
    clearError,
  };
}