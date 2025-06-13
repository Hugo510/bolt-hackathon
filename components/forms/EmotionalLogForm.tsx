import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useCreateEmotionalLog } from '@/hooks/useEmotionalLogs';
import { Heart, Brain, MessageCircle } from 'lucide-react-native';

interface EmotionalLogFormData {
  emotion_primary: string;
  emotion_secondary?: string;
  intensity: number;
  context?: string;
  triggers: string[];
  notes?: string;
  mood_before?: number;
  mood_after?: number;
}

interface EmotionalLogFormProps {
  onSuccess?: () => void;
}

const primaryEmotions = [
  'Felicidad', 'Tristeza', 'Ansiedad', 'Estrés', 'Enojo', 'Miedo', 
  'Confusión', 'Motivación', 'Frustración', 'Calma'
];

const commonTriggers = [
  'Estudios', 'Trabajo', 'Familia', 'Relaciones', 'Futuro', 'Dinero',
  'Salud', 'Decisiones', 'Presión social', 'Cambios'
];

export default function EmotionalLogForm({ onSuccess }: EmotionalLogFormProps) {
  const createEmotionalLog = useCreateEmotionalLog();
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmotionalLogFormData>({
    defaultValues: {
      emotion_primary: '',
      intensity: 5,
      triggers: [],
      mood_before: 5,
    },
  });

  const onSubmit = async (data: EmotionalLogFormData) => {
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
          ]}
          onPress={() => onChange(level)}
        >
          <Text
            style={[
              styles.intensityButtonText,
              value === level && styles.intensityButtonTextActive,
            ]}
          >
            {level}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <View style={styles.header}>
          <Heart size={24} color="#4f46e5" />
          <Text style={styles.title}>Registro Emocional</Text>
        </View>

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
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Estado de ánimo antes (1-10)</Text>
          <Controller
            control={control}
            name="mood_before"
            render={({ field: { onChange, value } }) => (
              <IntensitySelector value={value || 5} onChange={onChange} />
            )}
          />
        </View>

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
                numberOfLines={3}
              />
            )}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notas personales</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.textArea}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Reflexiones, pensamientos adicionales..."
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <MessageCircle size={20} color="white" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  form: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1f2937',
    marginLeft: 12,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#374151',
    marginBottom: 12,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    marginBottom: 8,
  },
  emotionButtonActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  emotionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#374151',
  },
  emotionButtonTextActive: {
    color: 'white',
    fontFamily: 'Inter_500Medium',
  },
  intensityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  intensityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  intensityButtonActive: {
    backgroundColor: '#4f46e5',
  },
  intensityButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#6b7280',
  },
  intensityButtonTextActive: {
    color: 'white',
  },
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  triggerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    marginBottom: 8,
  },
  triggerButtonActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#fbbf24',
  },
  triggerButtonText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#374151',
  },
  triggerButtonTextActive: {
    color: '#92400e',
    fontFamily: 'Inter_500Medium',
  },
  textArea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#ef4444',
    marginTop: 4,
  },
});