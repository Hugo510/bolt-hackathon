/*
  # Añadir Sistema de Analítica y Tracking

  Esta migración implementa un sistema de seguimiento de analítica
  para monitorear el uso de la aplicación y mejorar la experiencia del usuario.

  1. Cambios:
    - Crear tabla `analytics_events` para registrar eventos de usuario
    - Crear tabla `user_sessions` para seguimiento de sesiones
    - Crear tabla `feature_usage` para analizar uso de funcionalidades
    - Añadir funciones para registrar eventos automáticamente

  2. Propósito:
    - Mejorar comprensión del comportamiento del usuario
    - Identificar áreas de mejora en la aplicación
    - Medir engagement y retención
    - Proporcionar datos para personalización
*/

-- Tabla de eventos de analítica
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  page_url text,
  referrer text,
  user_agent text,
  ip_address text,
  session_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Tabla de sesiones de usuario
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  duration_seconds integer,
  device_info jsonb DEFAULT '{}',
  location_info jsonb DEFAULT '{}',
  is_mobile boolean,
  created_at timestamptz DEFAULT now()
);

-- Tabla de uso de funcionalidades
CREATE TABLE IF NOT EXISTS feature_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE NOT NULL,
  feature_name text NOT NULL,
  usage_count integer DEFAULT 1,
  last_used timestamptz DEFAULT now(),
  first_used timestamptz DEFAULT now(),
  usage_context jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature_name)
);

-- Habilitar RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analytics_events' 
    AND policyname = 'System can insert analytics events'
  ) THEN
    CREATE POLICY "System can insert analytics events"
      ON analytics_events FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analytics_events' 
    AND policyname = 'Admin can read analytics events'
  ) THEN
    CREATE POLICY "Admin can read analytics events"
      ON analytics_events FOR SELECT TO authenticated
      USING (auth.uid() IN (
        SELECT auth_user_id FROM users WHERE is_mentor = true
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_sessions' 
    AND policyname = 'System can manage user sessions'
  ) THEN
    CREATE POLICY "System can manage user sessions"
      ON user_sessions FOR ALL TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feature_usage' 
    AND policyname = 'System can manage feature usage'
  ) THEN
    CREATE POLICY "System can manage feature usage"
      ON feature_usage FOR ALL TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Función para registrar evento de analítica
CREATE OR REPLACE FUNCTION log_analytics_event(
  p_user_id uuid,
  p_event_type text,
  p_event_data jsonb DEFAULT '{}',
  p_page_url text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO analytics_events (
    user_id, 
    event_type, 
    event_data, 
    page_url, 
    user_agent
  )
  VALUES (
    p_user_id, 
    p_event_type, 
    p_event_data, 
    p_page_url, 
    p_user_agent
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar uso de funcionalidad
CREATE OR REPLACE FUNCTION log_feature_usage(
  p_user_id uuid,
  p_feature_name text,
  p_usage_context jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO feature_usage (
    user_id,
    feature_name,
    usage_context
  )
  VALUES (
    p_user_id,
    p_feature_name,
    p_usage_context
  )
  ON CONFLICT (user_id, feature_name) 
  DO UPDATE SET 
    usage_count = feature_usage.usage_count + 1,
    last_used = now(),
    usage_context = COALESCE(feature_usage.usage_context, '{}') || p_usage_context,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_feature_usage_updated_at'
  ) THEN
    CREATE TRIGGER update_feature_usage_updated_at
      BEFORE UPDATE ON feature_usage
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature ON feature_usage(user_id, feature_name);

-- Insertar algunos eventos de ejemplo
INSERT INTO analytics_events (user_id, event_type, event_data, page_url)
VALUES
('550e8400-e29b-41d4-a716-446655440001', 'page_view', '{"page_name": "home"}', '/home'),
('550e8400-e29b-41d4-a716-446655440001', 'test_started', '{"test_type": "vocational"}', '/test'),
('550e8400-e29b-41d4-a716-446655440004', 'page_view', '{"page_name": "mentors"}', '/mentors'),
('550e8400-e29b-41d4-a716-446655440005', 'resource_viewed', '{"resource_id": "1", "resource_type": "article"}', '/resources/1');

-- Insertar algunos registros de uso de funcionalidades
INSERT INTO feature_usage (user_id, feature_name, usage_count, usage_context)
VALUES
('550e8400-e29b-41d4-a716-446655440001', 'vocational_test', 3, '{"completed": true, "time_spent_minutes": 15}'),
('550e8400-e29b-41d4-a716-446655440001', 'chat_support', 5, '{"messages_sent": 12, "emotions_detected": ["ansiedad", "curiosidad"]}'),
('550e8400-e29b-41d4-a716-446655440004', 'mentor_search', 2, '{"filters_used": ["Diseño", "Arte"], "results_count": 8}'),
('550e8400-e29b-41d4-a716-446655440005', 'community_post', 1, '{"category": "Recursos", "likes_received": 23}');

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Migración de sistema de analítica completada';
  RAISE NOTICE '📊 Tablas creadas:';
  RAISE NOTICE '   - analytics_events';
  RAISE NOTICE '   - user_sessions';
  RAISE NOTICE '   - feature_usage';
  RAISE NOTICE '🔍 Funciones creadas para registro automático de eventos';
  RAISE NOTICE '🔒 Seguridad RLS habilitada en todas las tablas';
  RAISE NOTICE '📈 Datos de ejemplo insertados para demostración';
END $$;