/*
  # Implementar Sistema de Versionado

  Esta migración añade un sistema de versionado para la base de datos,
  permitiendo un seguimiento claro de las migraciones aplicadas y
  facilitando la gestión de actualizaciones.

  1. Cambios:
    - Crear tabla `db_versions` para registrar versiones de la base de datos
    - Crear función para registrar versiones aplicadas
    - Registrar versión actual y migraciones previas

  2. Propósito:
    - Facilitar seguimiento de migraciones aplicadas
    - Permitir verificación de estado de la base de datos
    - Mejorar gestión de actualizaciones
*/

-- Tabla de versiones de la base de datos
CREATE TABLE IF NOT EXISTS db_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number text NOT NULL UNIQUE,
  migration_name text NOT NULL,
  description text,
  applied_at timestamptz DEFAULT now(),
  applied_by text DEFAULT current_user,
  is_success boolean DEFAULT true,
  error_message text,
  execution_time_ms integer
);

-- Función para registrar versión
CREATE OR REPLACE FUNCTION register_db_version(
  p_version_number text,
  p_migration_name text,
  p_description text DEFAULT NULL,
  p_execution_time_ms integer DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  version_id uuid;
BEGIN
  INSERT INTO db_versions (
    version_number,
    migration_name,
    description,
    execution_time_ms
  )
  VALUES (
    p_version_number,
    p_migration_name,
    p_description,
    p_execution_time_ms
  )
  RETURNING id INTO version_id;
  
  RETURN version_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener versión actual
CREATE OR REPLACE FUNCTION get_current_db_version()
RETURNS text AS $$
DECLARE
  current_version text;
BEGIN
  SELECT version_number INTO current_version
  FROM db_versions
  ORDER BY applied_at DESC
  LIMIT 1;
  
  RETURN current_version;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si una migración ya fue aplicada
CREATE OR REPLACE FUNCTION is_migration_applied(p_migration_name text)
RETURNS boolean AS $$
DECLARE
  exists_count integer;
BEGIN
  SELECT COUNT(*) INTO exists_count
  FROM db_versions
  WHERE migration_name = p_migration_name;
  
  RETURN exists_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Registrar migraciones previas
DO $$
DECLARE
  start_time timestamptz;
  execution_time integer;
BEGIN
  start_time := clock_timestamp();
  
  -- Registrar migración completa
  PERFORM register_db_version(
    '1.0.0',
    '20250624_000000_complete_schema',
    'Esquema completo inicial con todas las tablas y datos de ejemplo',
    NULL
  );
  
  -- Registrar migraciones incrementales
  PERFORM register_db_version(
    '1.0.1',
    '20250624_000001_add_ai_metadata',
    'Añadir metadatos de IA a mensajes de chat y logs emocionales',
    NULL
  );
  
  PERFORM register_db_version(
    '1.0.2',
    '20250624_000002_add_user_preferences',
    'Añadir preferencias de usuario avanzadas',
    NULL
  );
  
  PERFORM register_db_version(
    '1.0.3',
    '20250624_000003_add_analytics_tracking',
    'Añadir sistema de analítica y tracking',
    NULL
  );
  
  PERFORM register_db_version(
    '1.0.4',
    '20250624_000004_add_ai_integration_config',
    'Añadir configuración de integración con IA',
    NULL
  );
  
  -- Calcular tiempo de ejecución
  execution_time := extract(epoch from clock_timestamp() - start_time) * 1000;
  
  -- Registrar versión actual
  PERFORM register_db_version(
    '1.0.5',
    '20250624_000005_add_versioning',
    'Implementar sistema de versionado',
    execution_time
  );
  
  RAISE NOTICE 'Versión actual de la base de datos: %', get_current_db_version();
END $$;

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Migración de sistema de versionado completada';
  RAISE NOTICE '📊 Tabla creada: db_versions';
  RAISE NOTICE '🔍 Funciones creadas para gestión de versiones';
  RAISE NOTICE '📝 Historial de migraciones registrado';
  RAISE NOTICE '🔢 Versión actual: 1.0.5';
END $$;