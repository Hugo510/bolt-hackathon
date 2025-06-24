import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useCreateEmotionalLog } from '@/hooks/useEmotionalLogs';
import { Heart, Brain, MessageCircle, Calendar, Clock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsiveSpacing, useResponsiveFontSize } from '@/hooks/useResponsive';
import AnimatedButton from '@/components/ui/AnimatedButton';

interface EmotionalJourneyFormData {
  emotion_primary: string;
  emotion_secondary?: string;
  intensity: number;
  context?: string;
  triggers: string[];
  notes?: string;
  mood_before?: number;
  mood_after?: number;
  activity_type?: string;
}

interface EmotionalJourneyFormProps {
  onSuccess?: () => void;
  initialValues?: Partial<EmotionalJourneyFormData>;
}

const primaryEmotions = [
  'Felicidad', 'Tristeza', 'Ansiedad', 'Estrés', 'Enojo', 'Miedo', 
  'Confusión', 'Motivación', 'Frustración', 'Calma', 'Esperanza', 'Gratitud'
];

const secondaryEmotions = [
  'Entusiasmo', 'Orgullo', 'Alivio', 'Nostalgia', 'Culpa', 'Vergüenza',
  'Sorpresa', 'Curiosidad', 'Aburrimiento', 'Soledad', 'Admiración', 'Satisfacción'
];

const commonTriggers = [
  'Estudios', 'Trabajo', 'Familia', 'Relaciones', 'Futuro', 'Dinero',
  'Salud', 'Decisiones', 'Presión social', 'Cambios', 'Test vocacional',
  'Mentoría', 'Resultados', 'Incertidumbre', 'Éxito', 'Fracaso'
];

const activityTypes = [
  'Test vocacional', 'Sesión de mentoría', 'Chat de apoyo', 'Exploración de carreras',
  'Lectura de recursos', 'Reflexión personal', 'Toma de decisiones'
];

export default function EmotionalJourneyForm({ onSuccess, initialValues }: EmotionalJourneyFormProps) {
  const { theme } = useTheme();
  const spacing = useResponsiveSpacing();
  const fontSize = useResponsiveFontSize();
  
  const createEmotionalLog = useCreateEmotionalLog();
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(initialValues?.triggers || []);
  const [selectedActivity, setSelectedActivity] = useState<string | undefined>(initialValues?.activity_type);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmotionalJourneyFormData>({
    defaultValues: {
      emotion_primary: initialValues?.emotion_primary || '',
      emotion_secondary: initialValues?.emotion_secondary || '',
      intensity: initialValues?.intensity || 5,
      context: initialValues?.context || '',
      triggers: initialValues?.triggers || [],
      notes: initialValues?.notes || '',
      mood_before: initialValues?.mood_before || 5,
      mood_after: initialValues?.mood_after || 5,
      activity_type: initialValues?.activity_type || '',
    },
  });

  const onSubmit = async (data: EmotionalJourneyFormData) => {
    try {
      await createEmotionalLog.mutateAsync({
        ...data,
        triggers: selectedTriggers,
        coping_strategies: [], // Se puede expandir en el futuro
        ai_recommendations: [],
        follow_up_needed: data.intensity >= 8,
      });
      
      Alert.alert('Éxito', 'Registro emocional guardado correctamente');
      reset();
      setSelectedTriggers([]);
      setSelectedActivity(undefined);
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el registro');
    }
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const IntensitySelector = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => (
    <View style={styles.intensityContainer}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
        <TouchableOpacity
          key={level}
          style={[
            styles.intensityButton,
            value === level && styles.intensityButtonActive,
            { backgroundColor: value === level ? theme.colors.primary : theme.colors.surface }
          ]}
          onPress={() => onChange(level)}
        >
          <Text
            style={[
              styles.intensityButtonText,
              value === level && styles.intensityButtonTextActive,
              { color: value === level ? '#FFFFFF' : theme.colors.textSecondary }
            ]}
          >
            {level}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    form: {
      padding: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: fontSize.xl,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      marginLeft: spacing.sm,
    },
    inputContainer: {
      marginBottom: spacing.xl,
    },
    label: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_500Medium',
      color: theme.colors.text,
      marginBottom: spacing.sm,
    },
    emotionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    emotionButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 20,
      marginBottom: spacing.sm,
    },
    emotionButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    emotionButtonText: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.text,
    },
    emotionButtonTextActive: {
      color: '#FFFFFF',
      fontFamily: 'Inter_500Medium',
    },
    intensityContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    intensityButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    intensityButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    intensityButtonText: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_500Medium',
    },
    intensityButtonTextActive: {
      color: '#FFFFFF',
    },
    triggerGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    triggerButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      marginBottom: spacing.sm,
    },
    triggerButtonActive: {
      backgroundColor: theme.colors.primary + '20',
      borderColor: theme.colors.primary,
    },
    triggerButtonText: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.text,
    },
    triggerButtonTextActive: {
      color: theme.colors.primary,
      fontFamily: 'Inter_500Medium',
    },
    activityContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    activityButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      marginBottom: spacing.sm,
    },
    activityButtonActive: {
      backgroundColor: theme.colors.secondary + '20',
      borderColor: theme.colors.secondary,
    },
    activityButtonText: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.text,
    },
    activityButtonTextActive: {
      color: theme.colors.secondary,
      fontFamily: 'Inter_500Medium',
    },
    textArea: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: spacing.md,
      fontSize: fontSize.md,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.text,
      textAlignVertical: 'top',
      minHeight: 100,
    },
    dateTimeContainer: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    dateTimeInput: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: spacing.md,
      fontSize: fontSize.md,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.text,
    },
    submitButton: {
      marginTop: spacing.lg,
    },
    errorText: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.error,
      marginTop: spacing.xs,
    },
    sectionTitle: {
      fontSize: fontSize.md,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    infoText: {
      fontSize: fontSize.sm,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <View style={styles.header}>
          <Heart size={24} color={theme.colors.primary} />
          <Text style={styles.title}>Registrar Experiencia Emocional</Text>
        </View>

        <Text style={styles.infoText}>
          Registra cómo te sientes durante tu exploración vocacional. Esto nos ayudará a entender mejor tu viaje emocional y ofrecerte recomendaciones personalizadas.
        </Text>

        {/* Emoción Principal */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>¿Cómo te sientes principalmente? *</Text>
          <Controller
            control={control}
            name="emotion_primary"
            rules={{ required: 'Selecciona una emoción principal' }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.emotionGrid}>
                {primaryEmotions.map((emotion) => (
                  <TouchableOpacity
                    key={emotion}
                    style={[
                      styles.emotionButton,
                      value === emotion && styles.emotionButtonActive,
                    ]}
                    onPress={() => onChange(emotion)}
                  >
                    <Text
                      style={[
                        styles.emotionButtonText,
                        value === emotion && styles.emotionButtonTextActive,
                      ]}
                    >
                      {emotion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.emotion_primary && (
            <Text style={styles.errorText}>{errors.emotion_primary.message}</Text>
          )}
        </View>

        {/* Emoción Secundaria */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>¿Alguna otra emoción presente?</Text>
          <Controller
            control={control}
            name="emotion_secondary"
            render={({ field: { onChange, value } }) => (
              <View style={styles.emotionGrid}>
                {secondaryEmotions.map((emotion) => (
                  <TouchableOpacity
                    key={emotion}
                    style={[
                      styles.emotionButton,
                      value === emotion && styles.emotionButtonActive,
                    ]}
                    onPress={() => onChange(emotion)}
                  >
                    <Text
                      style={[
                        styles.emotionButtonText,
                        value === emotion && styles.emotionButtonTextActive,
                      ]}
                    >
                      {emotion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* Intensidad */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Intensidad (1-10) *</Text>
          <Controller
            control={control}
            name="intensity"
            rules={{ required: 'Selecciona la intensidad' }}
            render={({ field: { onChange, value } }) => (
              <IntensitySelector value={value} onChange={onChange} />
            )}
          />
          <Text style={styles.infoText}>
            1 = Apenas perceptible, 10 = Extremadamente intensa
          </Text>
        </View>

        {/* Actividad Relacionada */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>¿Qué actividad estabas realizando?</Text>
          <View style={styles.activityContainer}>
            {activityTypes.map((activity) => (
              <TouchableOpacity
                key={activity}
                style={[
                  styles.activityButton,
                  selectedActivity === activity && styles.activityButtonActive,
                ]}
                onPress={() => {
                  setSelectedActivity(selectedActivity === activity ? undefined : activity);
                  control.setValue('activity_type', selectedActivity === activity ? '' : activity);
                }}
              >
                <Text
                  style={[
                    styles.activityButtonText,
                    selectedActivity === activity && styles.activityButtonTextActive,
                  ]}
                >
                  {activity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Desencadenantes */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>¿Qué desencadenó esta emoción?</Text>
          <View style={styles.triggerGrid}>
            {commonTriggers.map((trigger) => (
              <TouchableOpacity
                key={trigger}
                style={[
                  styles.triggerButton,
                  selectedTriggers.includes(trigger) && styles.triggerButtonActive,
                ]}
                onPress={() => toggleTrigger(trigger)}
              >
                <Text
                  style={[
                    styles.triggerButtonText,
                    selectedTriggers.includes(trigger) && styles.triggerButtonTextActive,
                  ]}
                >
                  {trigger}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estado de ánimo antes/después */}
        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>Estado de ánimo</Text>
          
          <Text style={styles.label}>Antes de la actividad (1-10)</Text>
          <Controller
            control={control}
            name="mood_before"
            render={({ field: { onChange, value } }) => (
              <IntensitySelector value={value || 5} onChange={onChange} />
            )}
          />
          
          <Text style={[styles.label, { marginTop: spacing.md }]}>Después de la actividad (1-10)</Text>
          <Controller
            control={control}
            name="mood_after"
            render={({ field: { onChange, value } }) => (
              <IntensitySelector value={value || 5} onChange={onChange} />
            )}
          />
        </View>

        {/* Contexto */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contexto adicional</Text>
          <Controller
            control={control}
            name="context"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.textArea}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Describe brevemente la situación..."
                multiline
                numberOfLines={4}
              />
            )}
          />
        </View>

        {/* Notas personales */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reflexiones personales</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.textArea}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="¿Qué aprendiste de esta experiencia? ¿Cómo te gustaría manejarla en el futuro?"
                multiline
                numberOfLines={4}
              />
            )}
          />
        </View>

        {/* Botón de envío */}
        <AnimatedButton
          title={isSubmitting ? "Guardando..." : "Guardar Registro"}
          onPress={handleSubmit(onSubmit)}
          variant="gradient"
          size="lg"
          disabled={isSubmitting}
          style={styles.submitButton}
          icon={<Heart size={20} color="#FFFFFF" />}
        />
      </View>
    </ScrollView>
  );
}