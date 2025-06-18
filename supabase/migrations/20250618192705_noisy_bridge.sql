/*
  # Esquema completo con datos de ejemplo para CarreraGuía

  1. Nuevas Tablas Faltantes
    - `users` - Tabla principal de usuarios
    - `emotional_logs` - Logs emocionales detallados
    - `careers` - Catálogo de carreras
    - `resources` - Recursos educativos mejorados

  2. Datos de Ejemplo
    - Usuarios de prueba
    - Mentores con especialidades
    - Recursos educativos variados
    - Tests vocacionales de ejemplo
    - Posts de comunidad
    - Logs emocionales

  3. Funciones y Triggers
    - Funciones para contadores automáticos
    - Triggers para notificaciones
    - Funciones de utilidad
*/

-- Tabla principal de usuarios (extendida)
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

-- Tabla de logs emocionales
CREATE TABLE IF NOT EXISTS emotional_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
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

-- Tabla de carreras
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

-- Tabla de recursos mejorada
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

-- Habilitar RLS en nuevas tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Políticas para emotional_logs
CREATE POLICY "Users can manage own emotional logs"
  ON emotional_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id))
  WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

-- Políticas para careers
CREATE POLICY "Everyone can read careers"
  ON careers
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Políticas para resources
CREATE POLICY "Everyone can read resources"
  ON resources
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_careers_updated_at
  BEFORE UPDATE ON careers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo

-- 1. Usuarios de ejemplo
INSERT INTO users (auth_user_id, email, full_name, country, city, education_level, interests, goals, is_mentor) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'maria.gonzalez@email.com', 'María González', 'México', 'Ciudad de México', 'university', ARRAY['tecnología', 'diseño', 'emprendimiento'], ARRAY['aprender programación', 'crear startup'], false),
('550e8400-e29b-41d4-a716-446655440002', 'carlos.mentor@email.com', 'Carlos Ruiz', 'México', 'Guadalajara', 'postgraduate', ARRAY['tecnología', 'liderazgo'], ARRAY['ayudar jóvenes', 'compartir experiencia'], true),
('550e8400-e29b-41d4-a716-446655440003', 'ana.doctora@email.com', 'Ana García', 'México', 'Monterrey', 'postgraduate', ARRAY['medicina', 'investigación'], ARRAY['formar nuevos médicos'], true),
('550e8400-e29b-41d4-a716-446655440004', 'luis.estudiante@email.com', 'Luis Martínez', 'México', 'Puebla', 'secondary', ARRAY['arte', 'música', 'creatividad'], ARRAY['estudiar diseño gráfico'], false),
('550e8400-e29b-41d4-a716-446655440005', 'sofia.creativa@email.com', 'Sofía López', 'México', 'Tijuana', 'technical', ARRAY['arte', 'diseño', 'fotografía'], ARRAY['ser directora creativa'], false);

-- 2. Mentores
INSERT INTO mentors (user_id, specialties, experience_years, rating, hourly_rate, bio, available_slots) VALUES
((SELECT auth_user_id FROM users WHERE email = 'carlos.mentor@email.com'), ARRAY['Tecnología', 'Desarrollo', 'Startups'], 12, 4.8, 65.00, 'Desarrollador senior y líder técnico con experiencia en startups tecnológicas. Especializado en desarrollo web y mobile.', ARRAY['Lunes 10:00-12:00', 'Miércoles 14:00-16:00', 'Viernes 16:00-18:00']),
((SELECT auth_user_id FROM users WHERE email = 'ana.doctora@email.com'), ARRAY['Medicina', 'Cardiología', 'Investigación'], 8, 4.9, 50.00, 'Especialista en cardiología con experiencia en investigación médica y docencia universitaria.', ARRAY['Martes 09:00-11:00', 'Jueves 15:00-17:00']);

-- 3. Carreras
INSERT INTO careers (name, description, category, required_skills, personality_match, education_requirements, average_salary_min, average_salary_max, job_outlook, work_environment, difficulty_level, time_to_complete_years) VALUES
('Desarrollo de Software', 'Diseño, desarrollo y mantenimiento de aplicaciones y sistemas informáticos', 'Tecnología', ARRAY['Programación', 'Lógica', 'Resolución de problemas'], ARRAY['Analítico', 'Detallista', 'Creativo'], ARRAY['Licenciatura en Sistemas', 'Bootcamp de programación'], 25000, 80000, 'excellent', ARRAY['Oficina', 'Remoto', 'Híbrido'], 3, 4),
('Medicina General', 'Diagnóstico, tratamiento y prevención de enfermedades', 'Salud', ARRAY['Empatía', 'Conocimiento científico', 'Comunicación'], ARRAY['Empático', 'Responsable', 'Analítico'], ARRAY['Licenciatura en Medicina', 'Especialización'], 40000, 120000, 'good', ARRAY['Hospital', 'Clínica', 'Consultorio'], 5, 8),
('Diseño Gráfico', 'Creación de comunicación visual mediante elementos gráficos', 'Arte y Diseño', ARRAY['Creatividad', 'Software de diseño', 'Comunicación visual'], ARRAY['Creativo', 'Visual', 'Innovador'], ARRAY['Licenciatura en Diseño', 'Portafolio'], 18000, 45000, 'good', ARRAY['Agencia', 'Freelance', 'Empresa'], 2, 4),
('Psicología', 'Estudio del comportamiento humano y procesos mentales', 'Salud Mental', ARRAY['Empatía', 'Escucha activa', 'Análisis'], ARRAY['Empático', 'Paciente', 'Observador'], ARRAY['Licenciatura en Psicología', 'Especialización'], 20000, 60000, 'good', ARRAY['Consultorio', 'Hospital', 'Escuela'], 4, 6),
('Marketing Digital', 'Promoción de productos y servicios a través de medios digitales', 'Negocios', ARRAY['Creatividad', 'Análisis de datos', 'Comunicación'], ARRAY['Creativo', 'Analítico', 'Social'], ARRAY['Licenciatura en Marketing', 'Certificaciones digitales'], 22000, 70000, 'excellent', ARRAY['Agencia', 'Empresa', 'Remoto'], 2, 4);

-- 4. Recursos educativos
INSERT INTO resources (title, description, content_type, category, difficulty_level, duration_minutes, tags, url, thumbnail_url, author, provider, rating, is_featured) VALUES
('Introducción a la Programación con Python', 'Curso completo para aprender los fundamentos de la programación usando Python', 'course', 'Tecnología', 'beginner', 480, ARRAY['Python', 'Programación', 'Fundamentos'], 'https://example.com/python-course', 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg', 'Dr. Juan Pérez', 'TechAcademy', 4.7, true),
('Guía Completa de Diseño UX/UI', 'Todo lo que necesitas saber sobre diseño de experiencia de usuario', 'article', 'Diseño', 'intermediate', 45, ARRAY['UX', 'UI', 'Diseño', 'Usuario'], 'https://example.com/ux-guide', 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg', 'María Diseñadora', 'DesignHub', 4.5, true),
('Fundamentos de Marketing Digital', 'Aprende las bases del marketing en la era digital', 'video', 'Negocios', 'beginner', 120, ARRAY['Marketing', 'Digital', 'Redes Sociales'], 'https://example.com/marketing-video', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg', 'Carlos Marketero', 'BusinessSchool', 4.3, false),
('Podcast: Carreras del Futuro', 'Entrevistas con profesionales sobre las carreras más prometedoras', 'podcast', 'Orientación', 'beginner', 35, ARRAY['Futuro', 'Carreras', 'Entrevistas'], 'https://example.com/future-careers-podcast', 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg', 'Ana Orientadora', 'FutureCast', 4.6, false),
('Matemáticas para Ingeniería', 'Curso avanzado de matemáticas aplicadas a la ingeniería', 'course', 'Ciencias', 'advanced', 600, ARRAY['Matemáticas', 'Ingeniería', 'Cálculo'], 'https://example.com/math-engineering', 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg', 'Prof. Roberto Números', 'MathInstitute', 4.8, true);

-- 5. Tests vocacionales de ejemplo
INSERT INTO vocational_tests (user_id, questions_answered, results, completed_at) VALUES
((SELECT id FROM users WHERE email = 'maria.gonzalez@email.com'), 50, 
 '{"career_matches": [{"career": "Desarrollo de Software", "match_percentage": 85, "description": "Excelente compatibilidad con tus intereses tecnológicos"}], "personality_type": "Analítico-Creativo", "strengths": ["Lógica", "Creatividad", "Resolución de problemas"]}', 
 now() - interval '2 days'),
((SELECT id FROM users WHERE email = 'luis.estudiante@email.com'), 45, 
 '{"career_matches": [{"career": "Diseño Gráfico", "match_percentage": 92, "description": "Perfecta alineación con tu perfil creativo"}], "personality_type": "Creativo-Visual", "strengths": ["Creatividad", "Comunicación visual", "Innovación"]}', 
 now() - interval '1 week');

-- 6. Posts de comunidad
INSERT INTO community_posts (user_id, title, content, category, likes_count, comments_count) VALUES
((SELECT id FROM users WHERE email = 'maria.gonzalez@email.com'), '¿Cómo elegir entre desarrollo web y mobile?', 'Estoy indecisa entre especializarme en desarrollo web o mobile. ¿Qué recomiendan basado en el mercado actual?', 'Tecnología', 12, 8),
((SELECT id FROM users WHERE email = 'luis.estudiante@email.com'), 'Mi experiencia con el test vocacional', 'Acabo de completar el test y los resultados fueron muy acertados. Me ayudó a confirmar mi interés en el diseño gráfico.', 'Experiencias', 15, 5),
((SELECT id FROM users WHERE email = 'sofia.creativa@email.com'), 'Recursos gratuitos para aprender diseño', 'Comparto una lista de recursos gratuitos que me han ayudado mucho en mi aprendizaje de diseño gráfico.', 'Recursos', 23, 12);

-- 7. Progreso de usuarios
INSERT INTO user_progress (user_id, points_earned, level, badges_earned, streak_days) VALUES
((SELECT id FROM users WHERE email = 'maria.gonzalez@email.com'), 750, 3, ARRAY['first-test', 'week-streak'], 7),
((SELECT id FROM users WHERE email = 'luis.estudiante@email.com'), 450, 2, ARRAY['first-test'], 3),
((SELECT id FROM users WHERE email = 'sofia.creativa@email.com'), 320, 2, ARRAY['first-test'], 5);

-- 8. Logs emocionales
INSERT INTO emotional_logs (user_id, emotion_primary, intensity, triggers, mood_before, mood_after, notes, ai_recommendations) VALUES
((SELECT id FROM users WHERE email = 'maria.gonzalez@email.com'), 'ansiedad', 7, ARRAY['futuro', 'decisiones'], 4, 6, 'Me siento ansiosa por elegir la carrera correcta', ARRAY['Técnicas de respiración', 'Hablar con un mentor']),
((SELECT id FROM users WHERE email = 'luis.estudiante@email.com'), 'motivación', 8, ARRAY['test_resultado', 'claridad'], 5, 9, 'El test me dio mucha claridad sobre mi futuro', ARRAY['Continuar explorando diseño', 'Buscar cursos especializados']),
((SELECT id FROM users WHERE email = 'sofia.creativa@email.com'), 'felicidad', 9, ARRAY['logro', 'reconocimiento'], 7, 9, 'Mi post en la comunidad tuvo muy buena recepción', ARRAY['Seguir compartiendo conocimiento', 'Conectar con otros creativos']);

-- 9. Mensajes de chat de ejemplo
INSERT INTO chat_messages (user_id, content, message_type, emotion_detected) VALUES
((SELECT id FROM users WHERE email = 'maria.gonzalez@email.com'), 'Hola, me siento un poco perdida con mi futuro profesional', 'user', 'ansiedad'),
((SELECT id FROM users WHERE email = 'maria.gonzalez@email.com'), 'Entiendo perfectamente cómo te sientes. Es normal sentir ansiedad cuando pensamos en decisiones importantes sobre nuestro futuro. ¿Podrías contarme qué aspectos específicos te generan más incertidumbre?', 'ai', null),
((SELECT id FROM users WHERE email = 'luis.estudiante@email.com'), '¡Acabo de terminar el test vocacional y estoy muy emocionado con los resultados!', 'user', 'felicidad'),
((SELECT id FROM users WHERE email = 'luis.estudiante@email.com'), '¡Qué maravilloso escuchar tu entusiasmo! Los resultados positivos del test son una excelente señal de que estás en el camino correcto. ¿Te gustaría explorar más sobre las carreras que te sugirió?', 'ai', null);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_emotional_logs_user_id ON emotional_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_logs_created_at ON emotional_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_careers_category ON careers(category);
CREATE INDEX IF NOT EXISTS idx_careers_active ON careers(is_active);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON resources(is_featured);
CREATE INDEX IF NOT EXISTS idx_resources_active ON resources(is_active);