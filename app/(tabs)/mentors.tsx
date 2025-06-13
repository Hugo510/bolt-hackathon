import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Star, Calendar, Video, MapPin } from 'lucide-react-native';

interface Mentor {
  id: string;
  name: string;
  specialties: string[];
  experience: number;
  rating: number;
  price: number;
  bio: string;
  avatar: string;
  location: string;
  available: boolean;
}

const mentors: Mentor[] = [
  {
    id: '1',
    name: 'Dra. María González',
    specialties: ['Medicina', 'Investigación', 'Cardiología'],
    experience: 15,
    rating: 4.9,
    price: 80,
    bio: 'Especialista en cardiología con amplia experiencia en docencia e investigación médica.',
    avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg',
    location: 'Ciudad de México, MX',
    available: true,
  },
  {
    id: '2',
    name: 'Ing. Carlos Ruiz',
    specialties: ['Ingeniería de Software', 'Tecnología', 'Startups'],
    experience: 12,
    rating: 4.8,
    price: 65,
    bio: 'CTO con experiencia en startups tecnológicas y desarrollo de equipos de ingeniería.',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    location: 'Bogotá, CO',
    available: true,
  },
  {
    id: '3',
    name: 'Lic. Ana Herrera',
    specialties: ['Psicología', 'Recursos Humanos', 'Coaching'],
    experience: 10,
    rating: 4.7,
    price: 55,
    bio: 'Psicóloga organizacional especializada en desarrollo de talento y liderazgo.',
    avatar: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg',
    location: 'Buenos Aires, AR',
    available: false,
  },
  {
    id: '4',
    name: 'Arq. Luis Mendoza',
    specialties: ['Arquitectura', 'Diseño Urbano', 'Sostenibilidad'],
    experience: 18,
    rating: 4.9,
    price: 70,
    bio: 'Arquitecto especializado en diseño sostenible y desarrollo urbano inteligente.',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
    location: 'Lima, PE',
    available: true,
  },
];

const MentorCard = ({ mentor, onBook }: { mentor: Mentor; onBook: (mentor: Mentor) => void }) => (
  <View style={styles.mentorCard}>
    <View style={styles.mentorHeader}>
      <Image source={{ uri: mentor.avatar }} style={styles.mentorAvatar} />
      <View style={styles.mentorInfo}>
        <Text style={styles.mentorName}>{mentor.name}</Text>
        <View style={styles.ratingContainer}>
          <Star size={14} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.rating}>{mentor.rating}</Text>
          <Text style={styles.experience}>• {mentor.experience} años exp.</Text>
        </View>
        <View style={styles.locationContainer}>
          <MapPin size={12} color="#6b7280" />
          <Text style={styles.location}>{mentor.location}</Text>
        </View>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>${mentor.price}</Text>
        <Text style={styles.priceUnit}>USD/hora</Text>
      </View>
    </View>

    <View style={styles.specialtiesContainer}>
      {mentor.specialties.map((specialty, index) => (
        <View key={index} style={styles.specialtyTag}>
          <Text style={styles.specialtyText}>{specialty}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.mentorBio}>{mentor.bio}</Text>

    <View style={styles.cardActions}>
      <TouchableOpacity
        style={[
          styles.bookButton,
          !mentor.available && styles.bookButtonDisabled
        ]}
        onPress={() => mentor.available && onBook(mentor)}
        disabled={!mentor.available}
      >
        <Calendar size={16} color={mentor.available ? "white" : "#9ca3af"} />
        <Text style={[
          styles.bookButtonText,
          !mentor.available && styles.bookButtonTextDisabled
        ]}>
          {mentor.available ? 'Agendar Sesión' : 'No Disponible'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function MentorsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const specialties = ['Todos', 'Medicina', 'Ingeniería', 'Psicología', 'Arquitectura', 'Tecnología'];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSpecialty = !selectedSpecialty || selectedSpecialty === 'Todos' ||
                            mentor.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const handleBookSession = (mentor: Mentor) => {
    // TODO: Implement booking logic with Supabase
    alert(`Agendar sesión con ${mentor.name} - Funcionalidad en desarrollo`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mentores</Text>
        <Text style={styles.subtitle}>Conecta con profesionales experimentados</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar mentores..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.specialtiesScroll}
        contentContainerStyle={styles.specialtiesContainer}
      >
        {specialties.map((specialty) => (
          <TouchableOpacity
            key={specialty}
            style={[
              styles.specialtyFilter,
              selectedSpecialty === specialty && styles.specialtyFilterActive
            ]}
            onPress={() => setSelectedSpecialty(specialty === 'Todos' ? null : specialty)}
          >
            <Text style={[
              styles.specialtyFilterText,
              selectedSpecialty === specialty && styles.specialtyFilterTextActive
            ]}>
              {specialty}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.mentorsList} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 'es' : ''} encontrado{filteredMentors.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {filteredMentors.map((mentor) => (
          <MentorCard
            key={mentor.id}
            mentor={mentor}
            onBook={handleBookSession}
          />
        ))}

        {filteredMentors.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No se encontraron mentores que coincidan con tu búsqueda
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
  specialtiesScroll: {
    marginBottom: 16,
  },
  specialtiesContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  specialtyFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  specialtyFilterActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  specialtyFilterText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#6b7280',
  },
  specialtyFilterTextActive: {
    color: 'white',
  },
  mentorsList: {
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
  mentorCard: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mentorHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  mentorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1f2937',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#1f2937',
    marginLeft: 4,
  },
  experience: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#4f46e5',
  },
  priceUnit: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  specialtyTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specialtyText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#374151',
  },
  mentorBio: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bookButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  bookButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
    marginLeft: 8,
  },
  bookButtonTextDisabled: {
    color: '#9ca3af',
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