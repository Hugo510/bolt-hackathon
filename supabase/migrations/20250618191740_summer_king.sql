/*
  # Agregar tablas para notificaciones y preferencias

  1. Nuevas Tablas
    - `notifications` - Sistema de notificaciones
    - `notification_preferences` - Preferencias de notificaciones del usuario
    - `mentorships` - Relaciones de mentoría
    - `mentorship_sessions` - Sesiones específicas de mentoría

  2. Funciones
    - Crear notificaciones automáticas
    - Limpiar notificaciones antiguas

  3. Triggers
    - Notificaciones automáticas en eventos importantes
*/

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
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

-- Tabla de preferencias de notificaciones
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  mentorship_reminders boolean DEFAULT true,
  achievement_alerts boolean DEFAULT true,
  weekly_summary boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Tabla de mentorías (relaciones)
CREATE TABLE IF NOT EXISTS mentorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES mentors(id) ON DELETE CASCADE NOT NULL,
  mentee_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  start_date date NOT NULL,
  end_date date,
  goals text[] DEFAULT '{}',
  progress_notes text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de sesiones de mentoría específicas
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

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para notifications
CREATE POLICY "Users can manage own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para notification_preferences
CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para mentorships
CREATE POLICY "Users can read mentorships they're involved in"
  ON mentorships
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = mentee_id OR 
    auth.uid() IN (SELECT user_id FROM mentors WHERE id = mentor_id)
  );

CREATE POLICY "Mentees can create mentorship requests"
  ON mentorships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentors and mentees can update their mentorships"
  ON mentorships
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = mentee_id OR 
    auth.uid() IN (SELECT user_id FROM mentors WHERE id = mentor_id)
  );

-- Políticas para mentorship_sessions
CREATE POLICY "Users can manage sessions for their mentorships"
  ON mentorship_sessions
  FOR ALL
  TO authenticated
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

-- Función para limpiar notificaciones antiguas
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  -- Eliminar notificaciones leídas de más de 30 días
  DELETE FROM notifications 
  WHERE read = true 
    AND created_at < NOW() - INTERVAL '30 days';
  
  -- Eliminar notificaciones expiradas
  DELETE FROM notifications 
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificaciones automáticas en mentorías
CREATE OR REPLACE FUNCTION notify_mentorship_events()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar cuando se crea una nueva mentoría
  IF TG_OP = 'INSERT' THEN
    -- Notificar al mentor
    PERFORM create_notification(
      (SELECT user_id FROM mentors WHERE id = NEW.mentor_id),
      'mentorship',
      'Nueva solicitud de mentoría',
      'Tienes una nueva solicitud de mentoría pendiente',
      jsonb_build_object('mentorship_id', NEW.id),
      'high'
    );
    
    -- Notificar al mentee
    PERFORM create_notification(
      NEW.mentee_id,
      'mentorship',
      'Solicitud de mentoría enviada',
      'Tu solicitud de mentoría ha sido enviada y está pendiente de aprobación',
      jsonb_build_object('mentorship_id', NEW.id),
      'medium'
    );
  END IF;
  
  -- Notificar cuando cambia el estado de la mentoría
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'active' THEN
      -- Notificar al mentee que la mentoría fue aceptada
      PERFORM create_notification(
        NEW.mentee_id,
        'mentorship',
        '¡Mentoría aceptada!',
        'Tu solicitud de mentoría ha sido aceptada. ¡Puedes comenzar a programar sesiones!',
        jsonb_build_object('mentorship_id', NEW.id),
        'high'
      );
    ELSIF NEW.status = 'cancelled' THEN
      -- Notificar cancelación
      PERFORM create_notification(
        NEW.mentee_id,
        'mentorship',
        'Mentoría cancelada',
        'Tu mentoría ha sido cancelada',
        jsonb_build_object('mentorship_id', NEW.id),
        'medium'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER mentorship_notifications_trigger
  AFTER INSERT OR UPDATE ON mentorships
  FOR EACH ROW
  EXECUTE FUNCTION notify_mentorship_events();

-- Trigger para notificaciones de sesiones
CREATE OR REPLACE FUNCTION notify_session_events()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar cuando se programa una nueva sesión
  IF TG_OP = 'INSERT' THEN
    -- Notificar al mentee
    PERFORM create_notification(
      (SELECT mentee_id FROM mentorships WHERE id = NEW.mentorship_id),
      'mentorship',
      'Nueva sesión programada',
      'Se ha programado una nueva sesión de mentoría',
      jsonb_build_object('session_id', NEW.id, 'scheduled_at', NEW.scheduled_at),
      'medium'
    );
    
    -- Notificar al mentor
    PERFORM create_notification(
      (SELECT m.user_id FROM mentors m 
       JOIN mentorships ms ON m.id = ms.mentor_id 
       WHERE ms.id = NEW.mentorship_id),
      'mentorship',
      'Nueva sesión programada',
      'Se ha programado una nueva sesión de mentoría',
      jsonb_build_object('session_id', NEW.id, 'scheduled_at', NEW.scheduled_at),
      'medium'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER session_notifications_trigger
  AFTER INSERT ON mentorship_sessions
  FOR EACH ROW
  EXECUTE FUNCTION notify_session_events();

-- Trigger para actualizar updated_at
CREATE TRIGGER update_mentorships_updated_at
  BEFORE UPDATE ON mentorships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor_mentee ON mentorships(mentor_id, mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_mentorship_id ON mentorship_sessions(mentorship_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_scheduled_at ON mentorship_sessions(scheduled_at);