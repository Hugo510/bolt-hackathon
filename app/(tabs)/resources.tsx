import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, BookOpen, Video, Headphones, Clock, Star } from 'lucide-react-native';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'course' | 'podcast';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  rating: number;
  thumbnail: string;
  tags: string[];
  url: string;
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'Guía Completa para Elegir tu Carrera',
    description: 'Todo lo que necesitas saber para tomar la decisión más importante de tu vida profesional.',
    type: 'article',
    difficulty: 'beginner',
    duration: 15,
    rating: 4.8,
    thumbnail: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
    tags: ['Orientación', 'Carrera', 'Decisiones'],
    url: '#'
  },
  {
    id: '2',
    title: 'Introducción a la Programación',
    description: 'Curso básico para comenzar tu camino en el desarrollo de software.',
    type: 'course',
    difficulty: 'beginner',
    duration: 120,
    rating: 4.9,
    thumbnail: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg',
    tags: ['Programación', 'Tecnología', 'Desarrollo'],
    url: '#'
  },
  {
    id: '3',
    title: 'Habilidades del Futuro en el Trabajo',
    description: 'Descubre qué habilidades serán más valoradas en los próximos años.',
    type: 'video',
    difficulty: 'intermediate',
    duration: 25,
    rating: 4.7,
    thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
    tags: ['Futuro', 'Habilidades', 'Trabajo'],
    url: '#'
  },
  {
    id: '4',
    title: 'Emprendimiento para Jóvenes',
    description: 'Historias y consejos de emprendedores exitosos que comenzaron siendo jóvenes.',
    type: 'podcast',
    difficulty: 'intermediate',
    duration: 45,
    rating: 4.6,
    thumbnail: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
    tags: ['Emprendimiento', 'Negocios', 'Inspiración'],
    url: '#'
  },
  {
    id: '5',
    title: 'Diseño UX/UI: Primeros Pasos',
    description: 'Aprende los fundamentos del diseño de experiencia de usuario.',
    type: 'course',
    difficulty: 'beginner',
    duration: 90,
    rating: 4.8,
    thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
    tags: ['Diseño', 'UX', 'UI', 'Creatividad'],
    url: '#'
  },
  {
    id: '6',
    title: 'Networking para Estudiantes',
    description: 'Cómo construir una red profesional desde la universidad.',
    type: 'article',
    difficulty: 'beginner',
    duration: 10,
    rating: 4.5,
    thumbnail: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg',
    tags: ['Networking', 'Carrera', 'Estudiantes'],
    url: '#'
  }
];

const getTypeIcon = (type: Resource['type']) => {
  switch (type) {
    case 'article':
      return <BookOpen size={16} color="#4f46e5" />;
    case 'video':
      return <Video size={16} color="#ef4444" />;
    case 'course':
      return <BookOpen size={16} color="#10b981" />;
    case 'podcast':
      return <Headphones size={16} color="#f59e0b" />;
  }
};

const getDifficultyColor = (difficulty: Resource['difficulty']) => {
  switch (difficulty) {
    case 'beginner':
      return '#10b981';
    case 'intermediate':
      return '#f59e0b';
    case 'advanced':
      return '#ef4444';
  }
};

const getDifficultyText = (difficulty: Resource['difficulty']) => {
  switch (difficulty) {
    case 'beginner':
      return 'Principiante';
    case 'intermediate':
      return 'Intermedio';
    case 'advanced':
      return 'Avanzado';
  }
};

const ResourceCard = ({ resource }: { resource: Resource }) => (
  <TouchableOpacity style={styles.resourceCard}>
    <Image source={{ uri: resource.thumbnail }} style={styles.thumbnail} />
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <View style={styles.typeContainer}>
          {getTypeIcon(resource.type)}
          <Text style={styles.typeText}>
            {resource.type === 'article' ? 'Artículo' :
             resource.type === 'video' ? 'Video' :
             resource.type === 'course' ? 'Curso' : 'Podcast'}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <Star size={12} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.rating}>{resource.rating}</Text>
        </View>
      </View>

      <Text style={styles.resourceTitle}>{resource.title}</Text>
      <Text style={styles.resourceDescription}>{resource.description}</Text>

      <View style={styles.resourceMeta}>
        <View style={styles.metaItem}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.metaText}>{resource.duration} min</Text>
        </View>
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: getDifficultyColor(resource.difficulty) + '20' }
        ]}>
          <Text style={[
            styles.difficultyText,
            { color: getDifficultyColor(resource.difficulty) }
          ]}>
            {getDifficultyText(resource.difficulty)}
          </Text>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tagsContainer}
      >
        {resource.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  </TouchableOpacity>
);

export default function ResourcesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const types = ['Todos', 'Artículos', 'Videos', 'Cursos', 'Podcasts'];
  const difficulties = ['Todos', 'Principiante', 'Intermedio', 'Avanzado'];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const typeMap: { [key: string]: Resource['type'] } = {
      'Artículos': 'article',
      'Videos': 'video',
      'Cursos': 'course',
      'Podcasts': 'podcast'
    };
    
    const matchesType = !selectedType || selectedType === 'Todos' ||
                       resource.type === typeMap[selectedType];
    
    const difficultyMap: { [key: string]: Resource['difficulty'] } = {
      'Principiante': 'beginner',
      'Intermedio': 'intermediate',
      'Avanzado': 'advanced'
    };
    
    const matchesDifficulty = !selectedDifficulty || selectedDifficulty === 'Todos' ||
                             resource.difficulty === difficultyMap[selectedDifficulty];
    
    return matchesSearch && matchesType && matchesDifficulty;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recursos Educativos</Text>
        <Text style={styles.subtitle}>Aprende y desarrolla nuevas habilidades</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar recursos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContainer}
      >
        <Text style={styles.filterLabel}>Tipo:</Text>
        {types.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              selectedType === type && styles.filterButtonActive
            ]}
            onPress={() => setSelectedType(type === 'Todos' ? null : type)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedType === type && styles.filterButtonTextActive
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContainer}
      >
        <Text style={styles.filterLabel}>Nivel:</Text>
        {difficulties.map((difficulty) => (
          <TouchableOpacity
            key={difficulty}
            style={[
              styles.filterButton,
              selectedDifficulty === difficulty && styles.filterButtonActive
            ]}
            onPress={() => setSelectedDifficulty(difficulty === 'Todos' ? null : difficulty)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedDifficulty === difficulty && styles.filterButtonTextActive
            ]}>
              {difficulty}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.resourcesList} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredResources.length} recurso{filteredResources.length !== 1 ? 's' : ''} encontrado{filteredResources.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {filteredResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}

        {filteredResources.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No se encontraron recursos que coincidan con tu búsqueda
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
  },
  searchContainer: {
    padding: 24,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1f2937',
  },
  filtersScroll: {
    marginBottom: 8,
  },
  filtersContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#374151',
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  resourcesList: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#6b7280',
  },
  resourceCard: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#6b7280',
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#1f2937',
    marginLeft: 4,
  },
  resourceTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1f2937',
    marginBottom: 8,
  },
  resourceDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  resourceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#374151',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
});