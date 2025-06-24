/*
  # Añadir Preferencias de Usuario Avanzadas

  Esta migración añade una tabla de preferencias de usuario para almacenar
  configuraciones personalizadas de la aplicación.

  1. Cambios:
    - Crear tabla `user_preferences`
    - Añadir políticas de seguridad para la tabla
    - Insertar preferencias por defecto para usuarios existentes

  2. Propósito:
    - Permitir personalización de la experiencia de usuario
    - Almacenar configuraciones de accesibilidad
    - Guardar preferencias de tema y visualización
*/

-- Crear tabla de preferencias de usuario
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(auth_user_id) ON DELETE CASCADE UNIQUE NOT NULL,
  theme_mode text DEFAULT 'system' CHECK (theme_mode IN ('light', 'dark', 'system')),
  high_contrast boolean DEFAULT false,
  font_size text DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'x-large')),
  reduce_motion boolean DEFAULT false,
  enable_animations boolean DEFAULT true,
  language_preference text DEFAULT 'es',
  dashboard_layout jsonb DEFAULT '{"widgets": ["progress", "recommendations", "upcoming_sessions"]}',
  privacy_settings jsonb DEFAULT '{"profile_visibility": "registered", "activity_visibility": "private"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_preferences' 
    AND policyname = 'Users can manage own preferences'
  ) THEN
    CREATE POLICY "Users can manage own preferences"
      ON user_preferences FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Crear trigger para updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_user_preferences_updated_at'
  ) THEN
    CREATE TRIGGER update_user_preferences_updated_at
      BEFORE UPDATE ON user_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Insertar preferencias por defecto para usuarios existentes
INSERT INTO user_preferences (user_id, theme_mode, language_preference)
SELECT auth_user_id, 'system', preferred_language
FROM users
WHERE auth_user_id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Migración de preferencias de usuario completada';
  RAISE NOTICE '📊 Tabla creada: user_preferences';
  RAISE NOTICE '🔒 Seguridad RLS habilitada';
  RAISE NOTICE '🧩 Preferencias por defecto insertadas para usuarios existentes';
END $$;