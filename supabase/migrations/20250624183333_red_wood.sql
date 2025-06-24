/*
  # Esquema Completo de CarreraGuía

  Este archivo contiene el esquema completo de la base de datos para CarreraGuía,
  incluyendo todas las tablas, funciones, políticas y datos de ejemplo necesarios
  para una instalación completa.

  IMPORTANTE: Este archivo debe ejecutarse SOLO para instalaciones nuevas.
  Para actualizaciones incrementales, use las migraciones específicas.
*/

-- =============================================
-- FUNCIONES AUXILIARES
-- =============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TABLA PRINCIPAL DE USUARIOS
-- =============================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  birth_date date,
  country text DEFAULT 'México',
  city text,
  phone text,
  education_level text CHECK (education_level IN ('secondary', 'technical', 'university', 'postgraduate')),
  interests text[] DEFAULT '{}',
  goals text[] DEFAULT '{}',
  preferred_language text DEFAULT 'es',
  timezone text DEFAULT 'America/Mexico_City',
  is_mentor boolean DEFAULT false,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- PERFILES EXTENDIDOS (COMPATIBILIDAD)
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text NOT NULL,
  age integer,
  country text,
  interests text[] DEFAULT '{}',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- TESTS VOCACIONALES
-- =============================================

CREATE TABLE IF NOT EXISTS vocational_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  questions_answered integer DEFAULT 0,
  results jsonb,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- MENTORES
-- =============================================

CREATE TABLE IF NOT EXISTS mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  specialties text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  rating decimal(3,2) DEFAULT 0.0,
  hourly_rate decimal(10,2) DEFAULT 0.0,
  bio text DEFAULT '',
  available_slots text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- SESIONES DE MENTORÍA
-- =============================================

CREATE TABLE IF NOT EXISTS mentor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES mentors(id) ON DELETE CASCADE NOT NULL,
  mentee_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  meeting_link text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- CHAT Y MENSAJES
-- =============================================

CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  session_name text,
  started_at timestamptz DEFAULT now() NOT NULL,
  ended_at timestamptz,
  message_count integer DEFAULT 0,
  emotions_detected text[] DEFAULT '{}',
  summary text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES chat_sessions(id) ON DELETE SET NULL,
  content text NOT NULL,
  message_type text DEFAULT 'user' CHECK (message_type IN ('user', 'ai')),
  emotion_detected text,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- RECURSOS EDUCATIVOS
-- =============================================

CREATE TABLE IF NOT EXISTS educational_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content_type text DEFAULT 'article' CHECK (content_type IN ('article', 'video', 'course', 'podcast')),
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  tags text[] DEFAULT '{}',
  url text NOT NULL,
  thumbnail_url text,
  duration_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content_type text CHECK (content_type IN ('article', 'video', 'course', 'podcast', 'book', 'tool', 'assessment')) NOT NULL,
  category text NOT NULL,
  subcategory text,
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  duration_minutes integer DEFAULT 0,
  language text DEFAULT 'es',
  tags text[] DEFAULT '{}',
  url text NOT NULL,
  thumbnail_url text,
  author text,
  provider text,
  rating decimal(3,2) DEFAULT 0.0,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  price decimal(10,2),
  currency text DEFAULT 'MXN',
  target_audience text[] DEFAULT '{}',
  learning_objectives text[] DEFAULT '{}',
  prerequisites text[] DEFAULT '{}',
  certification_available boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- COMUNIDAD
-- =============================================

CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- =============================================
-- PROGRESO Y GAMIFICACIÓN
-- =============================================

CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE UNIQUE NOT NULL,
  points_earned integer DEFAULT 0,
  level integer DEFAULT 1,
  badges_earned text[] DEFAULT '{}',
  streak_days integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  achievement_type text NOT NULL,
  achievement_data jsonb DEFAULT '{}',
  earned_at timestamptz DEFAULT now(),
  points_awarded integer DEFAULT 0
);

-- =============================================
-- LOGS EMOCIONALES
-- =============================================

CREATE TABLE IF NOT EXISTS emotional_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  emotion_primary text NOT NULL,
  emotion_secondary text,
  intensity integer CHECK (intensity >= 1 AND intensity <= 10) NOT NULL,
  context text,
  triggers text[] DEFAULT '{}',
  coping_strategies text[] DEFAULT '{}',
  notes text,
  mood_before integer CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after integer CHECK (mood_after >= 1 AND mood_after <= 10),
  session_duration_minutes integer DEFAULT 0,
  ai_response text,
  ai_recommendations text[] DEFAULT '{}',
  follow_up_needed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- CARRERAS
-- =============================================

CREATE TABLE IF NOT EXISTS careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  subcategory text,
  required_skills text[] DEFAULT '{}',
  personality_match text[] DEFAULT '{}',
  education_requirements text[] DEFAULT '{}',
  average_salary_min integer,
  average_salary_max integer,
  job_outlook text CHECK (job_outlook IN ('excellent', 'good', 'fair', 'poor')),
  work_environment text[] DEFAULT '{}',
  related_careers text[] DEFAULT '{}',
  growth_rate decimal(5,2),
  difficulty_level integer CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  time_to_complete_years integer,
  is_active boolean DEFAULT true,
  country_specific jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- NOTIFICACIONES
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  type text CHECK (type IN ('mentorship', 'test_result', 'achievement', 'reminder', 'system')) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  action_url text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE UNIQUE NOT NULL,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  mentorship_reminders boolean DEFAULT true,
  achievement_alerts boolean DEFAULT true,
  weekly_summary boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- MENTORÍAS AVANZADAS
-- =============================================

CREATE TABLE IF NOT EXISTS mentorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES mentors(id) ON DELETE CASCADE NOT NULL,
  mentee_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  start_date date NOT NULL,
  end_date date,
  goals text[] DEFAULT '{}',
  progress_notes text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mentorship_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorship_id uuid REFERENCES mentorships(id) ON DELETE CASCADE NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  meeting_link text,
  agenda text,
  notes text,
  mentor_feedback text,
  mentee_feedback text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- INTERACCIONES CON RECURSOS
-- =============================================

CREATE TABLE IF NOT EXISTS resource_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  resource_id uuid REFERENCES educational_resources(id) ON DELETE CASCADE NOT NULL,
  interaction_type text CHECK (interaction_type IN ('view', 'like', 'complete', 'bookmark')) NOT NULL,
  progress_percentage integer DEFAULT 0,
  time_spent_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, resource_id, interaction_type)
);

-- =============================================
-- HABILITAR RLS
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocational_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_interactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS DE SEGURIDAD
-- =============================================

-- Políticas para users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data"
      ON users FOR SELECT TO authenticated
      USING (auth.uid() = auth_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data"
      ON users FOR UPDATE TO authenticated
      USING (auth.uid() = auth_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can insert own data'
  ) THEN
    CREATE POLICY "Users can insert own data"
      ON users FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = auth_user_id);
  END IF;
END $$;

-- Políticas para profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON profiles FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas para vocational_tests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vocational_tests' 
    AND policyname = 'Users can manage own tests'
  ) THEN
    CREATE POLICY "Users can manage own tests"
      ON vocational_tests FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas para mentors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mentors' 
    AND policyname = 'Everyone can read mentors'
  ) THEN
    CREATE POLICY "Everyone can read mentors"
      ON mentors FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mentors' 
    AND policyname = 'Users can manage own mentor profile'
  ) THEN
    CREATE POLICY "Users can manage own mentor profile"
      ON mentors FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas para mentor_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mentor_sessions' 
    AND policyname = 'Users can read own sessions'
  ) THEN
    CREATE POLICY "Users can read own sessions"
      ON mentor_sessions FOR SELECT TO authenticated
      USING (
        auth.uid() = mentee_id OR 
        auth.uid() IN (SELECT user_id FROM mentors WHERE id = mentor_id)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mentor_sessions' 
    AND policyname = 'Users can insert sessions as mentee'
  ) THEN
    CREATE POLICY "Users can insert sessions as mentee"
      ON mentor_sessions FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = mentee_id);
  END IF;
END $$;

-- Políticas para chat
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_sessions' 
    AND policyname = 'Users can manage own chat sessions'
  ) THEN
    CREATE POLICY "Users can manage own chat sessions"
      ON chat_sessions FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' 
    AND policyname = 'Users can manage own messages'
  ) THEN
    CREATE POLICY "Users can manage own messages"
      ON chat_messages FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas para recursos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'educational_resources' 
    AND policyname = 'Everyone can read educational resources'
  ) THEN
    CREATE POLICY "Everyone can read educational resources"
      ON educational_resources FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'resources' 
    AND policyname = 'Everyone can read resources'
  ) THEN
    CREATE POLICY "Everyone can read resources"
      ON resources FOR SELECT TO authenticated
      USING (is_active = true);
  END IF;
END $$;

-- Políticas para comunidad
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'community_posts' 
    AND policyname = 'Everyone can read posts'
  ) THEN
    CREATE POLICY "Everyone can read posts"
      ON community_posts FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'community_posts' 
    AND policyname = 'Users can manage own posts'
  ) THEN
    CREATE POLICY "Users can manage own posts"
      ON community_posts FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_comments' 
    AND policyname = 'Users can read all comments'
  ) THEN
    CREATE POLICY "Users can read all comments"
      ON post_comments FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_comments' 
    AND policyname = 'Users can manage own comments'
  ) THEN
    CREATE POLICY "Users can manage own comments"
      ON post_comments FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_likes' 
    AND policyname = 'Users can manage own likes'
  ) THEN
    CREATE POLICY "Users can manage own likes"
      ON post_likes FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas para progreso
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_progress' 
    AND policyname = 'Users can manage own progress'
  ) THEN
    CREATE POLICY "Users can manage own progress"
      ON user_progress FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_achievements' 
    AND policyname = 'Users can read own achievements'
  ) THEN
    CREATE POLICY "Users can read own achievements"
      ON user_achievements FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_achievements' 
    AND policyname = 'System can create achievements'
  ) THEN
    CREATE POLICY "System can create achievements"
      ON user_achievements FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas para emotional_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'emotional_logs' 
    AND policyname = 'Users can manage own emotional logs'
  ) THEN
    CREATE POLICY "Users can manage own emotional logs"
      ON emotional_logs FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas para careers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'careers' 
    AND policyname = 'Everyone can read careers'
  ) THEN
    CREATE POLICY "Everyone can read careers"
      ON careers FOR SELECT TO authenticated
      USING (is_active = true);
  END IF;
END $$;

-- Políticas para notificaciones
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can manage own notifications'
  ) THEN
    CREATE POLICY "Users can manage own notifications"
      ON notifications FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notification_preferences' 
    AND policyname = 'Users can manage own notification preferences'
  ) THEN
    CREATE POLICY "Users can manage own notification preferences"
      ON notification_preferences FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas para mentorships
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mentorships' 
    AND policyname = 'Users can read mentorships they''re involved in'
  ) THEN
    CREATE POLICY "Users can read mentorships they're involved in"
      ON mentorships FOR SELECT TO authenticated
      USING (
        auth.uid() = mentee_id OR 
        auth.uid() IN (SELECT user_id FROM mentors WHERE id = mentor_id)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mentorships' 
    AND policyname = 'Mentees can create mentorship requests'
  ) THEN
    CREATE POLICY "Mentees can create mentorship requests"
      ON mentorships FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = mentee_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mentorships' 
    AND policyname = 'Mentors and mentees can update their mentorships'
  ) THEN
    CREATE POLICY "Mentors and mentees can update their mentorships"
      ON mentorships FOR UPDATE TO authenticated
      USING (
        auth.uid() = mentee_id OR 
        auth.uid() IN (SELECT user_id FROM mentors WHERE id = mentor_id)
      );
  END IF;
END $$;

-- Políticas para mentorship_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mentorship_sessions' 
    AND policyname = 'Users can manage sessions for their mentorships'
  ) THEN
    CREATE POLICY "Users can manage sessions for their mentorships"
      ON mentorship_sessions FOR ALL TO authenticated
      USING (
        mentorship_id IN (
          SELECT id FROM mentorships 
          WHERE mentee_id = auth.uid() OR 
                mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid())
        )
      )
      WITH CHECK (
        mentorship_id IN (
          SELECT id FROM mentorships 
          WHERE mentee_id = auth.uid() OR 
                mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid())
        )
      );
  END IF;
END $$;

-- Políticas para resource_interactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'resource_interactions' 
    AND policyname = 'Users can manage own resource interactions'
  ) THEN
    CREATE POLICY "Users can manage own resource interactions"
      ON resource_interactions FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- =============================================
-- TRIGGERS
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_careers_updated_at'
  ) THEN
    CREATE TRIGGER update_careers_updated_at
      BEFORE UPDATE ON careers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_resources_updated_at'
  ) THEN
    CREATE TRIGGER update_resources_updated_at
      BEFORE UPDATE ON resources
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_mentorships_updated_at'
  ) THEN
    CREATE TRIGGER update_mentorships_updated_at
      BEFORE UPDATE ON mentorships
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_notification_preferences_updated_at'
  ) THEN
    CREATE TRIGGER update_notification_preferences_updated_at
      BEFORE UPDATE ON notification_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =============================================
-- FUNCIONES AUXILIARES
-- =============================================

-- Función para incrementar likes en posts
CREATE OR REPLACE FUNCTION increment_post_likes(post_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO post_likes (post_id, user_id)
  VALUES (post_id, auth.uid())
  ON CONFLICT (post_id, user_id) DO NOTHING;
  
  UPDATE community_posts 
  SET likes_count = (
    SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = community_posts.id
  )
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para incrementar comentarios en posts
CREATE OR REPLACE FUNCTION increment_post_comments(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE community_posts 
  SET comments_count = (
    SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = community_posts.id
  )
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para incrementar vistas de recursos
CREATE OR REPLACE FUNCTION increment_resource_views(resource_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO resource_interactions (user_id, resource_id, interaction_type)
  VALUES (auth.uid(), resource_id, 'view')
  ON CONFLICT (user_id, resource_id, interaction_type) DO NOTHING;
  
  UPDATE educational_resources 
  SET views_count = (
    SELECT COUNT(*) FROM resource_interactions 
    WHERE resource_interactions.resource_id = educational_resources.id 
    AND interaction_type = 'view'
  )
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear notificación automática
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}',
  p_priority text DEFAULT 'medium'
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data, priority)
  VALUES (p_user_id, p_type, p_title, p_message, p_data, p_priority)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ÍNDICES PARA RENDIMIENTO
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_vocational_tests_user_id ON vocational_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor_id ON mentor_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentee_id ON mentor_sessions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_logs_user_id ON emotional_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_logs_created_at ON emotional_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_careers_category ON careers(category);
CREATE INDEX IF NOT EXISTS idx_careers_active ON careers(is_active);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON resources(is_featured);
CREATE INDEX IF NOT EXISTS idx_resources_active ON resources(is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor_mentee ON mentorships(mentor_id, mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_mentorship_id ON mentorship_sessions(mentorship_id);
CREATE INDEX IF NOT EXISTS idx_resource_interactions_user_resource ON resource_interactions(user_id, resource_id);

-- =============================================
-- DATOS DE EJEMPLO
-- =============================================

-- 1. Usuarios de ejemplo
INSERT INTO users (auth_user_id, email, full_name, country, city, education_level, interests, goals, is_mentor) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'maria.gonzalez@email.com', 'María González', 'México', 'Ciudad de México', 'university', ARRAY['tecnología', 'diseño', 'emprendimiento'], ARRAY['aprender programación', 'crear startup'], false),
('550e8400-e29b-41d4-a716-446655440002', 'carlos.mentor@email.com', 'Carlos Ruiz', 'México', 'Guadalajara', 'postgraduate', ARRAY['tecnología', 'liderazgo'], ARRAY['ayudar jóvenes', 'compartir experiencia'], true),
('550e8400-e29b-41d4-a716-446655440003', 'ana.doctora@email.com', 'Ana García', 'México', 'Monterrey', 'postgraduate', ARRAY['medicina', 'investigación'], ARRAY['formar nuevos médicos'], true),
('550e8400-e29b-41d4-a716-446655440004', 'luis.estudiante@email.com', 'Luis Martínez', 'México', 'Puebla', 'secondary', ARRAY['arte', 'música', 'creatividad'], ARRAY['estudiar diseño gráfico'], false),
('550e8400-e29b-41d4-a716-446655440005', 'sofia.creativa@email.com', 'Sofía López', 'México', 'Tijuana', 'technical', ARRAY['arte', 'diseño', 'fotografía'], ARRAY['ser directora creativa'], false);

-- 2. Perfiles (compatibilidad)
INSERT INTO profiles (user_id, full_name, age, country, interests) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'María González', 22, 'México', ARRAY['tecnología', 'diseño']),
('550e8400-e29b-41d4-a716-446655440002', 'Carlos Ruiz', 35, 'México', ARRAY['tecnología', 'liderazgo']),
('550e8400-e29b-41d4-a716-446655440003', 'Ana García', 32, 'México', ARRAY['medicina', 'investigación']),
('550e8400-e29b-41d4-a716-446655440004', 'Luis Martínez', 18, 'México', ARRAY['arte', 'música']),
('550e8400-e29b-41d4-a716-446655440005', 'Sofía López', 20, 'México', ARRAY['arte', 'diseño']);

-- 3. Mentores
INSERT INTO mentors (user_id, specialties, experience_years, rating, hourly_rate, bio, available_slots) VALUES
('550e8400-e29b-41d4-a716-446655440002', ARRAY['Tecnología', 'Desarrollo', 'Startups'], 12, 4.8, 65.00, 'Desarrollador senior y líder técnico con experiencia en startups tecnológicas. Especializado en desarrollo web y mobile.', ARRAY['Lunes 10:00-12:00', 'Miércoles 14:00-16:00', 'Viernes 16:00-18:00']),
('550e8400-e29b-41d4-a716-446655440003', ARRAY['Medicina', 'Cardiología', 'Investigación'], 8, 4.9, 50.00, 'Especialista en cardiología con experiencia en investigación médica y docencia universitaria.', ARRAY['Martes 09:00-11:00', 'Jueves 15:00-17:00']);

-- 4. Carreras
INSERT INTO careers (name, description, category, required_skills, personality_match, education_requirements, average_salary_min, average_salary_max, job_outlook, work_environment, difficulty_level, time_to_complete_years) VALUES
('Desarrollo de Software', 'Diseño, desarrollo y mantenimiento de aplicaciones y sistemas informáticos', 'Tecnología', ARRAY['Programación', 'Lógica', 'Resolución de problemas'], ARRAY['Analítico', 'Detallista', 'Creativo'], ARRAY['Licenciatura en Sistemas', 'Bootcamp de programación'], 25000, 80000, 'excellent', ARRAY['Oficina', 'Remoto', 'Híbrido'], 3, 4),
('Medicina General', 'Diagnóstico, tratamiento y prevención de enfermedades', 'Salud', ARRAY['Empatía', 'Conocimiento científico', 'Comunicación'], ARRAY['Empático', 'Responsable', 'Analítico'], ARRAY['Licenciatura en Medicina', 'Especialización'], 40000, 120000, 'good', ARRAY['Hospital', 'Clínica', 'Consultorio'], 5, 8),
('Diseño Gráfico', 'Creación de comunicación visual mediante elementos gráficos', 'Arte y Diseño', ARRAY['Creatividad', 'Software de diseño', 'Comunicación visual'], ARRAY['Creativo', 'Visual', 'Innovador'], ARRAY['Licenciatura en Diseño', 'Portafolio'], 18000, 45000, 'good', ARRAY['Agencia', 'Freelance', 'Empresa'], 2, 4),
('Psicología', 'Estudio del comportamiento humano y procesos mentales', 'Salud Mental', ARRAY['Empatía', 'Escucha activa', 'Análisis'], ARRAY['Empático', 'Paciente', 'Observador'], ARRAY['Licenciatura en Psicología', 'Especialización'], 20000, 60000, 'good', ARRAY['Consultorio', 'Hospital', 'Escuela'], 4, 6),
('Marketing Digital', 'Promoción de productos y servicios a través de medios digitales', 'Negocios', ARRAY['Creatividad', 'Análisis de datos', 'Comunicación'], ARRAY['Creativo', 'Analítico', 'Social'], ARRAY['Licenciatura en Marketing', 'Certificaciones digitales'], 22000, 70000, 'excellent', ARRAY['Agencia', 'Empresa', 'Remoto'], 2, 4);

-- 5. Recursos educativos
INSERT INTO educational_resources (title, description, content_type, difficulty_level, tags, url, thumbnail_url, duration_minutes) VALUES
('Guía Completa para Elegir tu Carrera', 'Todo lo que necesitas saber para tomar la decisión más importante de tu vida profesional.', 'article', 'beginner', ARRAY['Orientación', 'Carrera', 'Decisiones'], 'https://example.com/career-guide', 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg', 15),
('Introducción a la Programación', 'Curso básico para comenzar tu camino en el desarrollo de software.', 'course', 'beginner', ARRAY['Programación', 'Tecnología', 'Desarrollo'], 'https://example.com/programming-course', 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg', 120),
('Habilidades del Futuro en el Trabajo', 'Descubre qué habilidades serán más valoradas en los próximos años.', 'video', 'intermediate', ARRAY['Futuro', 'Habilidades', 'Trabajo'], 'https://example.com/future-skills', 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg', 25),
('Emprendimiento para Jóvenes', 'Historias y consejos de emprendedores exitosos que comenzaron siendo jóvenes.', 'podcast', 'intermediate', ARRAY['Emprendimiento', 'Negocios', 'Inspiración'], 'https://example.com/entrepreneurship-podcast', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg', 45),
('Diseño UX/UI: Primeros Pasos', 'Aprende los fundamentos del diseño de experiencia de usuario.', 'course', 'beginner', ARRAY['Diseño', 'UX', 'UI', 'Creatividad'], 'https://example.com/ux-course', 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg', 90);

-- 6. Recursos mejorados
INSERT INTO resources (title, description, content_type, category, difficulty_level, duration_minutes, tags, url, thumbnail_url, author, provider, rating, is_featured) VALUES
('Introducción a la Programación con Python', 'Curso completo para aprender los fundamentos de la programación usando Python', 'course', 'Tecnología', 'beginner', 480, ARRAY['Python', 'Programación', 'Fundamentos'], 'https://example.com/python-course', 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg', 'Dr. Juan Pérez', 'TechAcademy', 4.7, true),
('Guía Completa de Diseño UX/UI', 'Todo lo que necesitas saber sobre diseño de experiencia de usuario', 'article', 'Diseño', 'intermediate', 45, ARRAY['UX', 'UI', 'Diseño', 'Usuario'], 'https://example.com/ux-guide', 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg', 'María Diseñadora', 'DesignHub', 4.5, true),
('Fundamentos de Marketing Digital', 'Aprende las bases del marketing en la era digital', 'video', 'Negocios', 'beginner', 120, ARRAY['Marketing', 'Digital', 'Redes Sociales'], 'https://example.com/marketing-video', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg', 'Carlos Marketero', 'BusinessSchool', 4.3, false),
('Podcast: Carreras del Futuro', 'Entrevistas con profesionales sobre las carreras más prometedoras', 'podcast', 'Orientación', 'beginner', 35, ARRAY['Futuro', 'Carreras', 'Entrevistas'], 'https://example.com/future-careers-podcast', 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg', 'Ana Orientadora', 'FutureCast', 4.6, false),
('Matemáticas para Ingeniería', 'Curso avanzado de matemáticas aplicadas a la ingeniería', 'course', 'Ciencias', 'advanced', 600, ARRAY['Matemáticas', 'Ingeniería', 'Cálculo'], 'https://example.com/math-engineering', 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg', 'Prof. Roberto Números', 'MathInstitute', 4.8, true);

-- 7. Tests vocacionales de ejemplo
INSERT INTO vocational_tests (user_id, questions_answered, results, completed_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 50, 
 '{"career_matches": [{"career": "Desarrollo de Software", "match_percentage": 85, "description": "Excelente compatibilidad con tus intereses tecnológicos"}], "personality_type": "Analítico-Creativo", "strengths": ["Lógica", "Creatividad", "Resolución de problemas"]}', 
 now() - interval '2 days'),
('550e8400-e29b-41d4-a716-446655440004', 45, 
 '{"career_matches": [{"career": "Diseño Gráfico", "match_percentage": 92, "description": "Perfecta alineación con tu perfil creativo"}], "personality_type": "Creativo-Visual", "strengths": ["Creatividad", "Comunicación visual", "Innovación"]}', 
 now() - interval '1 week');

-- 8. Posts de comunidad
INSERT INTO community_posts (user_id, title, content, category, likes_count, comments_count) VALUES
('550e8400-e29b-41d4-a716-446655440001', '¿Cómo elegir entre desarrollo web y mobile?', 'Estoy indecisa entre especializarme en desarrollo web o mobile. ¿Qué recomiendan basado en el mercado actual?', 'Tecnología', 12, 8),
('550e8400-e29b-41d4-a716-446655440004', 'Mi experiencia con el test vocacional', 'Acabo de completar el test y los resultados fueron muy acertados. Me ayudó a confirmar mi interés en el diseño gráfico.', 'Experiencias', 15, 5),
('550e8400-e29b-41d4-a716-446655440005', 'Recursos gratuitos para aprender diseño', 'Comparto una lista de recursos gratuitos que me han ayudado mucho en mi aprendizaje de diseño gráfico.', 'Recursos', 23, 12);

-- 9. Progreso de usuarios
INSERT INTO user_progress (user_id, points_earned, level, badges_earned, streak_days) VALUES
('550e8400-e29b-41d4-a716-446655440001', 750, 3, ARRAY['first-test', 'week-streak'], 7),
('550e8400-e29b-41d4-a716-446655440004', 450, 2, ARRAY['first-test'], 3),
('550e8400-e29b-41d4-a716-446655440005', 320, 2, ARRAY['first-test'], 5);

-- 10. Logs emocionales
INSERT INTO emotional_logs (user_id, emotion_primary, intensity, triggers, mood_before, mood_after, notes, ai_recommendations) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ansiedad', 7, ARRAY['futuro', 'decisiones'], 4, 6, 'Me siento ansiosa por elegir la carrera correcta', ARRAY['Técnicas de respiración', 'Hablar con un mentor']),
('550e8400-e29b-41d4-a716-446655440004', 'motivación', 8, ARRAY['test_resultado', 'claridad'], 5, 9, 'El test me dio mucha claridad sobre mi futuro', ARRAY['Continuar explorando diseño', 'Buscar cursos especializados']),
('550e8400-e29b-41d4-a716-446655440005', 'felicidad', 9, ARRAY['logro', 'reconocimiento'], 7, 9, 'Mi post en la comunidad tuvo muy buena recepción', ARRAY['Seguir compartiendo conocimiento', 'Conectar con otros creativos']);

-- 11. Mensajes de chat de ejemplo
INSERT INTO chat_messages (user_id, content, message_type, emotion_detected) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Hola, me siento un poco perdida con mi futuro profesional', 'user', 'ansiedad'),
('550e8400-e29b-41d4-a716-446655440001', 'Entiendo perfectamente cómo te sientes. Es normal sentir ansiedad cuando pensamos en decisiones importantes sobre nuestro futuro. ¿Podrías contarme qué aspectos específicos te generan más incertidumbre?', 'ai', null),
('550e8400-e29b-41d4-a716-446655440004', '¡Acabo de terminar el test vocacional y estoy muy emocionado con los resultados!', 'user', 'felicidad'),
('550e8400-e29b-41d4-a716-446655440004', '¡Qué maravilloso escuchar tu entusiasmo! Los resultados positivos del test son una excelente señal de que estás en el camino correcto. ¿Te gustaría explorar más sobre las carreras que te sugirió?', 'ai', null);

-- 12. Notificaciones de ejemplo
INSERT INTO notifications (user_id, type, title, message, priority) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'achievement', '¡Nuevo logro desbloqueado!', 'Has completado tu primer test vocacional. ¡Felicidades!', 'medium'),
('550e8400-e29b-41d4-a716-446655440004', 'system', 'Bienvenido a CarreraGuía', 'Explora todas las funcionalidades disponibles para ti.', 'low'),
('550e8400-e29b-41d4-a716-446655440005', 'mentorship', 'Nueva respuesta en tu post', 'Tu post sobre recursos de diseño ha recibido nuevos comentarios.', 'medium');

-- 13. Preferencias de notificaciones
INSERT INTO notification_preferences (user_id, email_notifications, push_notifications, mentorship_reminders, achievement_alerts) VALUES
('550e8400-e29b-41d4-a716-446655440001', true, true, true, true),
('550e8400-e29b-41d4-a716-446655440002', true, false, true, false),
('550e8400-e29b-41d4-a716-446655440003', false, true, true, true),
('550e8400-e29b-41d4-a716-446655440004', true, true, false, true),
('550e8400-e29b-41d4-a716-446655440005', true, true, true, false);

-- =============================================
-- VERIFICACIÓN FINAL
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migración completa ejecutada exitosamente';
  RAISE NOTICE '📊 Datos de ejemplo insertados:';
  RAISE NOTICE '   - 5 usuarios con perfiles completos';
  RAISE NOTICE '   - 2 mentores especializados';
  RAISE NOTICE '   - 5 carreras detalladas';
  RAISE NOTICE '   - 10 recursos educativos';
  RAISE NOTICE '   - Tests vocacionales completados';
  RAISE NOTICE '   - Posts de comunidad con interacciones';
  RAISE NOTICE '   - Logs emocionales con análisis';
  RAISE NOTICE '   - Sistema de notificaciones configurado';
  RAISE NOTICE '   - Progreso gamificado implementado';
  RAISE NOTICE '🔒 Seguridad RLS habilitada en todas las tablas';
  RAISE NOTICE '🚀 ¡La aplicación está lista para usar!';
END $$;