import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Star, MapPin, Clock, Video, MessageCircle } from 'lucide-react-native';
import { useState } from 'react';

export default function MentorsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Tecnología', 'Medicina', 'Arte', 'Negocios', 'Educación'];

  const mentors = [
    {
      id: 1,
      name: 'Dr. Ana García',
      specialty: 'Medicina',
      experience: '8 años',
      rating: 4.9,
      reviews: 127,
      location: 'Ciudad de México',
      price: '$50/hora',
      available: true,
      image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      description: 'Especialista en cardiología con experiencia en investigación médica.',
      tags: ['Cardiología', 'Investigación', 'Docencia'],
    },
    {
      id: 2,
      name: 'Ing. Carlos Ruiz',
      specialty: 'Tecnología',
      experience: '12 años',
      rating: 4.8,
      reviews: 89,
      location: 'Guadalajara',
      price: '$65/hora',
      available: true,
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      description: 'Desarrollador senior y líder técnico en startups tecnológicas.',
      tags: ['Desarrollo', 'Startups', 'Liderazgo'],
    },
    {
      id: 3,
      name: 'Lic. María López',
      specialty: 'Arte',
      experience: '6 años',
      rating: 4.7,
      reviews: 64,
      location: 'Monterrey',
      price: '$40/hora',
      available: false,
      image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      description: 'Diseñadora gráfica y directora creativa en agencia de publicidad.',
      tags: ['Diseño', 'Creatividad', 'Publicidad'],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mentores</Text>
          <Text style={styles.subtitle}>Conecta con profesionales experimentados</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar mentores..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipSelected
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextSelected
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Mentor */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Mentor Destacado</Text>
          <View style={styles.featuredCard}>
            <Image
              source={{ uri: mentors[0].image }}
              style={styles.featuredImage}
            />
            <View style={styles.featuredContent}>
              <View style={styles.featuredHeader}>
                <Text style={styles.featuredName}>{mentors[0].name}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>{mentors[0].rating}</Text>
                </View>
              </View>
              <Text style={styles.featuredSpecialty}>{mentors[0].specialty}</Text>
              <Text style={styles.featuredDescription}>{mentors[0].description}</Text>
              <TouchableOpacity style={styles.featuredButton}>
                <Video size={16} color="#FFFFFF" />
                <Text style={styles.featuredButtonText}>Agendar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Mentors List */}
        <View style={styles.mentorsSection}>
          <Text style={styles.sectionTitle}>Todos los Mentores</Text>
          {mentors.map((mentor) => (
            <View key={mentor.id} style={styles.mentorCard}>
              <View style={styles.mentorHeader}>
                <Image source={{ uri: mentor.image }} style={styles.mentorImage} />
                <View style={styles.mentorInfo}>
                  <View style={styles.mentorNameRow}>
                    <Text style={styles.mentorName}>{mentor.name}</Text>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: mentor.available ? '#10B981' : '#EF4444' }
                    ]} />
                  </View>
                  <Text style={styles.mentorSpecialty}>{mentor.specialty}</Text>
                  <View style={styles.mentorMeta}>
                    <View style={styles.metaItem}>
                      <Star size={14} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.metaText}>{mentor.rating} ({mentor.reviews})</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MapPin size={14} color="#6B7280" />
                      <Text style={styles.metaText}>{mentor.location}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>{mentor.price}</Text>
                </View>
              </View>

              <Text style={styles.mentorDescription}>{mentor.description}</Text>

              <View style={styles.tagsContainer}>
                {mentor.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.mentorActions}>
                <TouchableOpacity style={styles.chatButton}>
                  <MessageCircle size={16} color="#6366F1" />
                  <Text style={styles.chatButtonText}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[
                  styles.bookButton,
                  !mentor.available && styles.bookButtonDisabled
                ]}>
                  <Video size={16} color={mentor.available ? "#FFFFFF" : "#9CA3AF"} />
                  <Text style={[
                    styles.bookButtonText,
                    !mentor.available && styles.bookButtonTextDisabled
                  ]}>
                    {mentor.available ? 'Agendar' : 'No disponible'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  categoriesSection: {
    paddingLeft: 20,
    marginBottom: 24,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredImage: {
    width: '100%',
    height: 160,
  },
  featuredContent: {
    padding: 20,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 4,
  },
  featuredSpecialty: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6366F1',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  featuredButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  mentorsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  mentorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mentorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  mentorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mentorName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  mentorSpecialty: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6366F1',
    marginBottom: 8,
  },
  mentorMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  mentorDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  mentorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  chatButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6366F1',
    marginLeft: 6,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  bookButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  bookButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  bookButtonTextDisabled: {
    color: '#9CA3AF',
  },
});