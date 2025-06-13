/*
  # Esquema inicial para la aplicación de orientación vocacional

  1. Nuevas Tablas
    - `profiles` - Perfiles de usuario extendidos
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `full_name` (text)
      - `age` (integer)
      - `country` (text)
      - `interests` (text array)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `vocational_tests` - Tests vocacionales
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `questions_answered` (integer)
      - `results` (jsonb)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

    - `mentors` - Mentores disponibles
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `specialties` (text array)
      - `experience_years` (integer)
      - `rating` (decimal)
      - `hourly_rate` (decimal)
      - `bio` (text)
      - `available_slots` (text array)
      - `created_at` (timestamp)

    - `mentor_sessions` - Sesiones de mentoría
      - `id` (uuid, primary key)
      - `mentor_id` (uuid, foreign key)
      - `mentee_id` (uuid, foreign key)
      - `scheduled_at` (timestamp)
      - `duration_minutes` (integer)
      - `status` (text)
      - `meeting_link` (text)
      - `notes` (text)
      - `created_at` (timestamp)

    - `chat_messages` - Mensajes del chat emocional
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `message_type` (text)
      - `emotion_detected` (text)
      - `created_at` (timestamp)

    - `educational_resources` - Recursos educativos
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `content_type` (text)
      - `difficulty_level` (text)
      - `tags` (text array)
      - `url` (text)
      - `thumbnail_url` (text)
      - `duration_minutes` (integer)
      - `created_at` (timestamp)

    - `community_posts` - Posts de la comunidad
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `content` (text)
      - `category` (text)
      - `likes_count` (integer)
      - `comments_count` (integer)
      - `created_at` (timestamp)

    - `user_progress` - Progreso del usuario
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `points_earned` (integer)
      - `level` (integer)
      - `badges_earned` (text array)
      - `streak_days` (integer)
      - `last_activity` (timestamp)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Añadir políticas para que los usuarios solo puedan acceder a sus propios datos
    - Los mentores pueden ver sesiones relacionadas
    - Los recursos educativos son públicos
*/

-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text NOT NULL,
  age integer,
  country text,
  interests text[] DEFAULT '{}',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de tests vocacionales
CREATE TABLE IF NOT EXISTS vocational_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  questions_answered integer DEFAULT 0,
  results jsonb,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de mentores
CREATE TABLE IF NOT EXISTS mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  specialties text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  rating decimal(3,2) DEFAULT 0.0,
  hourly_rate decimal(10,2) DEFAULT 0.0,
  bio text DEFAULT '',
  available_slots text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de sesiones de mentoría
CREATE TABLE IF NOT EXISTS mentor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES mentors(id) ON DELETE CASCADE NOT NULL,
  mentee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  meeting_link text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de mensajes del chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'user' CHECK (message_type IN ('user', 'ai')),
  emotion_detected text,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de recursos educativos
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

-- Crear tabla de posts de la comunidad
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de progreso del usuario
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  points_earned integer DEFAULT 0,
  level integer DEFAULT 1,
  badges_earned text[] DEFAULT '{}',
  streak_days integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocational_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Políticas para vocational_tests
CREATE POLICY "Users can read own tests"
  ON vocational_tests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tests"
  ON vocational_tests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tests"
  ON vocational_tests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para mentors
CREATE POLICY "Everyone can read mentors"
  ON mentors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own mentor profile"
  ON mentors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mentor profile"
  ON mentors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para mentor_sessions
CREATE POLICY "Users can read own sessions"
  ON mentor_sessions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = mentee_id OR 
    auth.uid() IN (SELECT user_id FROM mentors WHERE id = mentor_id)
  );

CREATE POLICY "Users can insert sessions as mentee"
  ON mentor_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = mentee_id);

-- Políticas para chat_messages
CREATE POLICY "Users can read own messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Políticas para educational_resources
CREATE POLICY "Everyone can read resources"
  ON educational_resources
  FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para community_posts
CREATE POLICY "Everyone can read posts"
  ON community_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own posts"
  ON community_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON community_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para user_progress
CREATE POLICY "Users can read own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos recursos educativos de ejemplo
INSERT INTO educational_resources (title, description, content_type, difficulty_level, tags, url, thumbnail_url, duration_minutes) VALUES
('Guía Completa para Elegir tu Carrera', 'Todo lo que necesitas saber para tomar la decisión más importante de tu vida profesional.', 'article', 'beginner', ARRAY['Orientación', 'Carrera', 'Decisiones'], '#', 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg', 15),
('Introducción a la Programación', 'Curso básico para comenzar tu camino en el desarrollo de software.', 'course', 'beginner', ARRAY['Programación', 'Tecnología', 'Desarrollo'], '#', 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg', 120),
('Habilidades del Futuro en el Trabajo', 'Descubre qué habilidades serán más valoradas en los próximos años.', 'video', 'intermediate', ARRAY['Futuro', 'Habilidades', 'Trabajo'], '#', 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg', 25),
('Emprendimiento para Jóvenes', 'Historias y consejos de emprendedores exitosos que comenzaron siendo jóvenes.', 'podcast', 'intermediate', ARRAY['Emprendimiento', 'Negocios', 'Inspiración'], '#', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg', 45),
('Diseño UX/UI: Primeros Pasos', 'Aprende los fundamentos del diseño de experiencia de usuario.', 'course', 'beginner', ARRAY['Diseño', 'UX', 'UI', 'Creatividad'], '#', 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg', 90),
('Networking para Estudiantes', 'Cómo construir una red profesional desde la universidad.', 'article', 'beginner', ARRAY['Networking', 'Carrera', 'Estudiantes'], '#', 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg', 10);