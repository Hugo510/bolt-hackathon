import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Award, Star, Target, Zap, Heart, Trophy } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserProgressStore } from '@/stores/userProgressStore';
import ScaleInView from '@/components/animations/ScaleInView';
import StaggeredList from '@/components/animations/StaggeredList';

interface BadgeDisplayProps {
  maxVisible?: number;
  showAll?: boolean;
}

const badgeConfig = {
  'first-test': {
    icon: Target,
    name: 'Primer Test',
    description: 'Completaste tu primer test vocacional',
    color: '#10B981',
  },
  'week-streak': {
    icon: Zap,
    name: 'Racha Semanal',
    description: '7 días consecutivos de actividad',
    color: '#F59E0B',
  },
  'mentor-enthusiast': {
    icon: Heart,
    name: 'Entusiasta de Mentores',
    description: '10 sesiones de mentoría completadas',
    color: '#EF4444',
  },
  'level-5': {
    icon: Trophy,
    name: 'Nivel 5',
    description: 'Alcanzaste el nivel 5',
    color: '#8B5CF6',
  },
  'community-star': {
    icon: Star,
    name: 'Estrella de la Comunidad',
    description: '50 posts y comentarios creados',
    color: '#3B82F6',
  },
};

export default function BadgeDisplay({
  maxVisible = 3,
  showAll = false,
}: BadgeDisplayProps) {
  const { theme } = useTheme();
  const { badgesEarned } = useUserProgressStore();

  const displayBadges = showAll 
    ? badgesEarned 
    : badgesEarned.slice(0, maxVisible);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    title: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
      marginBottom: 12,
    },
    badgesList: {
      flexDirection: showAll ? 'column' : 'row',
      gap: 8,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 8,
      minWidth: showAll ? undefined : 100,
    },
    badgeIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: showAll ? 12 : 0,
    },
    badgeContent: {
      flex: showAll ? 1 : 0,
    },
    badgeName: {
      fontSize: showAll ? 14 : 12,
      fontFamily: 'Inter_600SemiBold',
      color: theme.colors.text,
    },
    badgeDescription: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    emptyState: {
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
  });

  if (badgesEarned.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Insignias</Text>
        <View style={styles.emptyState}>
          <Award size={32} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>
            Completa actividades para ganar insignias
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Insignias ({badgesEarned.length})
      </Text>
      
      <ScrollView 
        horizontal={!showAll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesList}
      >
        <StaggeredList staggerDelay={100} initialDelay={200}>
          {displayBadges.map((badgeId, index) => {
            const badge = badgeConfig[badgeId as keyof typeof badgeConfig];
            if (!badge) return null;

            return (
              <ScaleInView key={badgeId} delay={index * 100}>
                <View style={styles.badge}>
                  <View 
                    style={[
                      styles.badgeIcon, 
                      { backgroundColor: badge.color + '20' }
                    ]}
                  >
                    <badge.icon size={16} color={badge.color} />
                  </View>
                  {showAll && (
                    <View style={styles.badgeContent}>
                      <Text style={styles.badgeName}>{badge.name}</Text>
                      <Text style={styles.badgeDescription}>
                        {badge.description}
                      </Text>
                    </View>
                  )}
                </View>
              </ScaleInView>
            );
          })}
        </StaggeredList>
      </ScrollView>
    </View>
  );
}