/*
  # Añadir Configuración de Integración con IA

  Esta migración implementa un sistema para gestionar las integraciones
  con servicios de IA externos y almacenar configuraciones relacionadas.

  1. Cambios:
    - Crear tabla `ai_service_configs` para almacenar configuraciones de servicios
    - Crear tabla `ai_usage_logs` para registrar uso de servicios de IA
    - Crear tabla `ai_model_cache` para cachear respuestas comunes
    - Añadir funciones para gestionar el uso de IA

  2. Propósito:
    - Centralizar configuración de servicios de IA
    - Monitorear uso y costos de servicios externos
    - Mejorar rendimiento mediante caché de respuestas
    - Facilitar auditoría de interacciones con IA
*/

-- Tabla de configuraciones de servicios de IA
CREATE TABLE IF NOT EXISTS ai_service_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL UNIQUE,
  is_enabled boolean DEFAULT true,
  config_data jsonb NOT NULL DEFAULT '{}',
  rate_limit_per_minute integer DEFAULT 60,
  cost_per_1k_tokens decimal(10,6) DEFAULT 0.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de logs de uso de IA
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE SET NULL,
  service_name text NOT NULL,
  operation_type text NOT NULL,
  tokens_used integer DEFAULT 0,
  estimated_cost decimal(10,6) DEFAULT 0.0,
  request_data jsonb DEFAULT NULL,
  response_data jsonb DEFAULT NULL,
  success boolean DEFAULT true,
  error_message text,
  processing_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Tabla de caché de modelos de IA
CREATE TABLE IF NOT EXISTS ai_model_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  service_name text NOT NULL,
  request_hash text NOT NULL,
  response_data jsonb NOT NULL,
  tokens_saved integer DEFAULT 0,
  hit_count integer DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE ai_service_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_cache ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_service_configs' 
    AND policyname = 'Admin can manage AI service configs'
  ) THEN
    CREATE POLICY "Admin can manage AI service configs"
      ON ai_service_configs FOR ALL TO authenticated
      USING (auth.uid() IN (
        SELECT auth_user_id FROM users WHERE is_mentor = true
      ))
      WITH CHECK (auth.uid() IN (
        SELECT auth_user_id FROM users WHERE is_mentor = true
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_usage_logs' 
    AND policyname = 'System can insert AI usage logs'
  ) THEN
    CREATE POLICY "System can insert AI usage logs"
      ON ai_usage_logs FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_usage_logs' 
    AND policyname = 'Admin can read AI usage logs'
  ) THEN
    CREATE POLICY "Admin can read AI usage logs"
      ON ai_usage_logs FOR SELECT TO authenticated
      USING (auth.uid() IN (
        SELECT auth_user_id FROM users WHERE is_mentor = true
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_model_cache' 
    AND policyname = 'System can manage AI model cache'
  ) THEN
    CREATE POLICY "System can manage AI model cache"
      ON ai_model_cache FOR ALL TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Trigger para actualizar updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_ai_service_configs_updated_at'
  ) THEN
    CREATE TRIGGER update_ai_service_configs_updated_at
      BEFORE UPDATE ON ai_service_configs
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Función para registrar uso de IA
CREATE OR REPLACE FUNCTION log_ai_usage(
  p_user_id uuid,
  p_service_name text,
  p_operation_type text,
  p_tokens_used integer DEFAULT 0,
  p_request_data jsonb DEFAULT NULL,
  p_response_data jsonb DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL,
  p_processing_time_ms integer DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
  cost_per_token decimal(10,6);
  estimated_cost decimal(10,6);
BEGIN
  -- Obtener costo por token del servicio
  SELECT cost_per_1k_tokens INTO cost_per_token
  FROM ai_service_configs
  WHERE service_name = p_service_name;
  
  -- Calcular costo estimado
  estimated_cost := (p_tokens_used::decimal / 1000) * COALESCE(cost_per_token, 0.0);
  
  -- Registrar uso
  INSERT INTO ai_usage_logs (
    user_id,
    service_name,
    operation_type,
    tokens_used,
    estimated_cost,
    request_data,
    response_data,
    success,
    error_message,
    processing_time_ms
  )
  VALUES (
    p_user_id,
    p_service_name,
    p_operation_type,
    p_tokens_used,
    estimated_cost,
    p_request_data,
    p_response_data,
    p_success,
    p_error_message,
    p_processing_time_ms
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar límite de tasa
CREATE OR REPLACE FUNCTION check_ai_rate_limit(
  p_user_id uuid,
  p_service_name text
)
RETURNS boolean AS $$
DECLARE
  rate_limit integer;
  current_usage integer;
BEGIN
  -- Obtener límite de tasa para el servicio
  SELECT rate_limit_per_minute INTO rate_limit
  FROM ai_service_configs
  WHERE service_name = p_service_name;
  
  -- Contar uso en el último minuto
  SELECT COUNT(*) INTO current_usage
  FROM ai_usage_logs
  WHERE user_id = p_user_id
    AND service_name = p_service_name
    AND created_at > now() - interval '1 minute';
  
  -- Verificar si excede el límite
  RETURN current_usage < COALESCE(rate_limit, 60);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para gestionar caché de IA
CREATE OR REPLACE FUNCTION get_or_create_ai_cache(
  p_service_name text,
  p_request_hash text,
  p_ttl_minutes integer DEFAULT 60
)
RETURNS jsonb AS $$
DECLARE
  cached_response jsonb;
  cache_key text;
BEGIN
  cache_key := p_service_name || ':' || p_request_hash;
  
  -- Intentar obtener de caché
  SELECT response_data INTO cached_response
  FROM ai_model_cache
  WHERE cache_key = cache_key
    AND expires_at > now();
  
  -- Si existe en caché, actualizar contador y devolver
  IF cached_response IS NOT NULL THEN
    UPDATE ai_model_cache
    SET hit_count = hit_count + 1
    WHERE cache_key = cache_key;
    
    RETURN jsonb_build_object(
      'cached', true,
      'data', cached_response
    );
  END IF;
  
  -- Si no existe en caché, devolver nulo
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_service_name ON ai_usage_logs(service_name);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_model_cache_cache_key ON ai_model_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_model_cache_expires_at ON ai_model_cache(expires_at);

-- Insertar configuraciones de servicios de IA de ejemplo
INSERT INTO ai_service_configs (service_name, is_enabled, config_data, rate_limit_per_minute, cost_per_1k_tokens)
VALUES
('openai', true, '{"model": "gpt-3.5-turbo", "temperature": 0.7, "max_tokens": 1000}', 60, 0.002),
('elevenlabs', true, '{"voice_id": "rachel", "model": "eleven_multilingual_v2"}', 30, 0.005),
('tavus', true, '{"background": "office", "resolution": "720p"}', 10, 0.05),
('anthropic', false, '{"model": "claude-2", "temperature": 0.5}', 40, 0.008);

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Migración de integración con IA completada';
  RAISE NOTICE '📊 Tablas creadas:';
  RAISE NOTICE '   - ai_service_configs';
  RAISE NOTICE '   - ai_usage_logs';
  RAISE NOTICE '   - ai_model_cache';
  RAISE NOTICE '🔍 Funciones creadas para gestión de IA';
  RAISE NOTICE '🔒 Seguridad RLS habilitada en todas las tablas';
  RAISE NOTICE '⚙️ Configuraciones de ejemplo insertadas para servicios comunes';
END $$;