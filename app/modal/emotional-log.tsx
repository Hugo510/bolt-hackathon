import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import EmotionalJourneyForm from '@/components/forms/EmotionalJourneyForm';

export default function EmotionalLogModal() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleSuccess = () => {
    // Close the modal after successful submission
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Registrar Emoción',
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontFamily: 'Inter_600SemiBold',
          },
          presentation: 'modal',
        }}
      />
      <EmotionalJourneyForm onSuccess={handleSuccess} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});