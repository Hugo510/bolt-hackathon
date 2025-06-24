/*
  # Añadir Metadatos de IA a Mensajes de Chat

  Esta migración añade campos de metadatos para almacenar información
  relacionada con las respuestas de IA en los mensajes de chat.

  1. Cambios:
    - Añadir campo `ai_response_metadata` a la tabla `chat_messages`
    - Añadir campo `ai_analysis_data` a la tabla `emotional_logs`
    - Añadir campo `ai_recommendations_metadata` a la tabla `vocational_tests`

  2. Propósito:
    - Almacenar información detallada sobre las respuestas de IA
    - Guardar análisis emocionales realizados por IA
    - Mejorar la trazabilidad y explicabilidad de las recomendaciones
*/

-- Añadir campo de metadatos de IA a chat_messages
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS ai_response_metadata jsonb DEFAULT NULL;

-- Añadir campo de datos de análisis de IA a emotional_logs
ALTER TABLE emotional_logs 
ADD COLUMN IF NOT EXISTS ai_analysis_data jsonb DEFAULT NULL;

-- Añadir campo de metadatos de recomendaciones de IA a vocational_tests
ALTER TABLE vocational_tests 
ADD COLUMN IF NOT EXISTS ai_recommendations_metadata jsonb DEFAULT NULL;

-- Actualizar algunos mensajes existentes con metadatos de ejemplo
UPDATE chat_messages 
SET ai_response_metadata = jsonb_build_object(
  'model', 'gpt-3.5-turbo',
  'confidence', 0.92,
  'processing_time', 1.2,
  'emotion_analysis', jsonb_build_object(
    'primary', 'ansiedad',
    'intensity', 7,
    'suggestions', ARRAY['Técnicas de respiración', 'Hablar con un mentor']
  )
)
WHERE message_type = 'ai' 
AND id IN (
  SELECT id FROM chat_messages 
  WHERE message_type = 'ai' 
  LIMIT 2
);

-- Actualizar algunos logs emocionales con datos de análisis
UPDATE emotional_logs
SET ai_analysis_data = jsonb_build_object(
  'analysis_timestamp', (now() - interval '1 day')::text,
  'model', 'emotion-detection-v2',
  'confidence_score', 0.89,
  'emotion_breakdown', jsonb_build_object(
    'ansiedad', 0.7,
    'miedo', 0.2,
    'tristeza', 0.1
  ),
  'suggested_coping_mechanisms', ARRAY['Meditación', 'Ejercicio', 'Hablar con amigos']
)
WHERE id IN (
  SELECT id FROM emotional_logs
  LIMIT 2
);

-- Actualizar algunos tests vocacionales con metadatos de recomendaciones
UPDATE vocational_tests
SET ai_recommendations_metadata = jsonb_build_object(
  'model', 'career-match-v3',
  'analysis_factors', ARRAY['intereses', 'personalidad', 'habilidades', 'valores'],
  'confidence_scores', jsonb_build_object(
    'Desarrollo de Software', 0.85,
    'Diseño UX/UI', 0.72,
    'Ciencia de Datos', 0.68
  ),
  'recommendation_basis', 'Basado en patrones de interés y aptitudes técnico-creativas'
)
WHERE id IN (
  SELECT id FROM vocational_tests
  WHERE completed_at IS NOT NULL
  LIMIT 1
);

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Migración de metadatos de IA completada';
  RAISE NOTICE '📊 Campos añadidos:';
  RAISE NOTICE '   - ai_response_metadata en chat_messages';
  RAISE NOTICE '   - ai_analysis_data en emotional_logs';
  RAISE NOTICE '   - ai_recommendations_metadata en vocational_tests';
  RAISE NOTICE '🔍 Datos de ejemplo actualizados para demostración';
END $$;