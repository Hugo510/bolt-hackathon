export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  age?: number;
  country?: string;
  interests?: string[];
  created_at: string;
  updated_at: string;
}

export interface VocationalTest {
  id: string;
  user_id: string;
  questions_answered: number;
  results: VocationalTestResult;
  completed_at?: string;
  created_at: string;
}

export interface VocationalTestResult {
  career_matches: CareerMatch[];
  personality_type: string;
  strengths: string[];
  recommendations: string[];
}

export interface CareerMatch {
  career: string;
  match_percentage: number;
  description: string;
  skills_required: string[];
}

export interface Mentor {
  id: string;
  user_id: string;
  specialties: string[];
  experience_years: number;
  rating: number;
  hourly_rate: number;
  bio: string;
  available_slots: string[];
  created_at: string;
}

export interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  meeting_link?: string;
  notes?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  message_type: 'user' | 'ai';
  emotion_detected?: string;
  created_at: string;
}

export interface EducationalResource {
  id: string;
  title: string;
  description: string;
  content_type: 'article' | 'video' | 'course' | 'podcast';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  url: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  points_earned: number;
  level: number;
  badges_earned: string[];
  streak_days: number;
  last_activity: string;
  created_at: string;
}