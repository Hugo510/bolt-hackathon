/*
  # Agregar tablas faltantes para funcionalidad completa

  1. Nuevas Tablas
    - `chat_sessions` - Sesiones de chat organizadas
    - `post_comments` - Comentarios en posts de la comunidad
    - `post_likes` - Likes en posts (tabla de relación)
    - `resource_interactions` - Interacciones con recursos educativos
    - `user_achievements` - Logros específicos del usuario

  2. Funciones
    - Incrementar contadores de likes y comentarios
    - Incrementar vistas de recursos

  3. Triggers
    - Actualizar contadores automáticamente
*/

-- Tabla de sesiones de chat
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  session_name text,
  started_at timestamptz DEFAULT now() NOT NULL,
  ended_at timestamptz,
  message_count integer DEFAULT 0,
  emotions_detected text[] DEFAULT '{}',
  summary text,
  created_at timestamptz DEFAULT now()
);

-- Agregar session_id a chat_messages
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES chat_sessions(id) ON DELETE SET NULL;

-- Tabla de comentarios en posts
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de likes en posts
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Tabla de interacciones con recursos
CREATE TABLE IF NOT EXISTS resource_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  resource_id uuid REFERENCES educational_resources(id) ON DELETE CASCADE NOT NULL,
  interaction_type text CHECK (interaction_type IN ('view', 'like', 'complete', 'bookmark')) NOT NULL,
  progress_percentage integer DEFAULT 0,
  time_spent_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, resource_id, interaction_type)
);

-- Tabla de logros específicos
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  achievement_type text NOT NULL,
  achievement_data jsonb DEFAULT '{}',
  earned_at timestamptz DEFAULT now(),
  points_awarded integer DEFAULT 0
);

-- Habilitar RLS en todas las nuevas tablas
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Políticas para chat_sessions
CREATE POLICY "Users can manage own chat sessions"
  ON chat_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para post_comments
CREATE POLICY "Users can read all comments"
  ON post_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own comments"
  ON post_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON post_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON post_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para post_likes
CREATE POLICY "Users can manage own likes"
  ON post_likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para resource_interactions
CREATE POLICY "Users can manage own resource interactions"
  ON resource_interactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para user_achievements
CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Función para incrementar likes en posts
CREATE OR REPLACE FUNCTION increment_post_likes(post_id uuid)
RETURNS void AS $$
BEGIN
  -- Insertar like si no existe
  INSERT INTO post_likes (post_id, user_id)
  VALUES (post_id, auth.uid())
  ON CONFLICT (post_id, user_id) DO NOTHING;
  
  -- Actualizar contador en el post
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
  -- Insertar interacción de vista
  INSERT INTO resource_interactions (user_id, resource_id, interaction_type)
  VALUES (auth.uid(), resource_id, 'view')
  ON CONFLICT (user_id, resource_id, interaction_type) DO NOTHING;
  
  -- Actualizar contador en el recurso
  UPDATE educational_resources 
  SET views_count = (
    SELECT COUNT(*) FROM resource_interactions 
    WHERE resource_interactions.resource_id = educational_resources.id 
    AND interaction_type = 'view'
  )
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar message_count en chat_sessions
CREATE OR REPLACE FUNCTION update_chat_session_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.session_id IS NOT NULL THEN
    UPDATE chat_sessions 
    SET message_count = (
      SELECT COUNT(*) FROM chat_messages 
      WHERE session_id = NEW.session_id
    )
    WHERE id = NEW.session_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_session_message_count_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_session_message_count();

-- Agregar índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_resource_interactions_user_resource ON resource_interactions(user_id, resource_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);