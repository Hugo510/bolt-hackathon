import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { User, useUpdateUser } from '@/hooks/useUser';
import { Calendar, MapPin, Phone, GraduationCap } from 'lucide-react-native';

interface UserProfileFormData {
  full_name: string;
  phone?: string;
  country?: string;
  city?: string;
  education_level?: string;
  birth_date?: string;
}

interface UserProfileFormProps {
  user: User;
  onSuccess?: () => void;
}

const educationLevels = [
  { value: 'secondary', label: 'Educación Secundaria' },
  { value: 'technical', label: 'Educación Técnica' },
  { value: 'university', label: 'Educación Universitaria' },
  { value: 'postgraduate', label: 'Posgrado' },
];

export default function UserProfileForm({ user, onSuccess }: UserProfileFormProps) {
  const updateUser = useUpdateUser();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileFormData>({
    defaultValues: {
      full_name: user.full_name,
      phone: user.phone || '',
      country: user.country || '',
      city: user.city || '',
      education_level: user.education_level || '',
      birth_date: user.birth_date || '',
    },
  });

  const onSubmit = async (data: UserProfileFormData) => {
    try {
      await updateUser.mutateAsync(data);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre Completo *</Text>
          <Controller
            control={control}
            name="full_name"
            rules={{ required: 'El nombre es requerido' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.full_name && styles.inputError]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Tu nombre completo"
              />
            )}
          />
          {errors.full_name && (
            <Text style={styles.errorText}>{errors.full_name.message}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Teléfono</Text>
          <View style={styles.inputWithIcon}>
            <Phone size={20} color="#6b7280" style={styles.inputIcon} />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.inputWithIconText, errors.phone && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="+52 123 456 7890"
                  keyboardType="phone-pad"
                />
              )}
            />
          </View>
          {errors.phone && (
            <Text style={styles.errorText}>{errors.phone.message}</Text>
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>País</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color="#6b7280" style={styles.inputIcon} />
              <Controller
                control={control}
                name="country"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.inputWithIconText, errors.country && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="México"
                  />
                )}
              />
            </View>
          </View>

          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Ciudad</Text>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.city && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Ciudad de México"
                />
              )}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nivel Educativo</Text>
          <View style={styles.inputWithIcon}>
            <GraduationCap size={20} color="#6b7280" style={styles.inputIcon} />
            <Controller
              control={control}
              name="education_level"
              render={({ field: { onChange, value } }) => (
                <View style={styles.selectContainer}>
                  {educationLevels.map((level) => (
                    <TouchableOpacity
                      key={level.value}
                      style={[
                        styles.selectOption,
                        value === level.value && styles.selectOptionActive,
                      ]}
                      onPress={() => onChange(level.value)}
                    >
                      <Text
                        style={[
                          styles.selectOptionText,
                          value === level.value && styles.selectOptionTextActive,
                        ]}
                      >
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fecha de Nacimiento</Text>
          <View style={styles.inputWithIcon}>
            <Calendar size={20} color="#6b7280" style={styles.inputIcon} />
            <Controller
              control={control}
              name="birth_date"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.inputWithIconText, errors.birth_date && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="YYYY-MM-DD"
                />
              )}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  inputWithIcon: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  inputWithIconText: {
    flex: 1,
    height: 52,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#ef4444',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  selectContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectOptionActive: {
    backgroundColor: '#eff6ff',
  },
  selectOptionText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#374151',
  },
  selectOptionTextActive: {
    color: '#2563eb',
    fontFamily: 'Inter_500Medium',
  },
  submitButton: {
    height: 52,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
  },
});