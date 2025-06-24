# Guía de Migración - CarreraGuía

## 📋 Orden de Ejecución de Migraciones

### ⚠️ IMPORTANTE: Solo ejecutar UNA migración

**EJECUTAR ÚNICAMENTE:**
```sql
supabase/migrations/20250618200000_complete_schema_with_data.sql
```

### ❌ NO ejecutar estas migraciones (están obsoletas):
- `20250610204914_maroon_recipe.sql`
- `20250618003004_frosty_frog.sql` 
- `20250618191740_summer_king.sql`
- `20250618192705_noisy_bridge.sql`

## 🚀 Pasos para Configurar la Base de Datos

### 1. Preparar Supabase
1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**

### 2. Ejecutar la Migración Completa
1. Copia **TODO** el contenido del archivo:
   ```
   supabase/migrations/20250618200000_complete_schema_with_data.sql
   ```

2. Pégalo en el SQL Editor de Supabase

3. Haz clic en **"Run"** para ejecutar

### 3. Verificar la Instalación
Después de ejecutar, deberías ver:

```
✅ Migración completa ejecutada exitosamente
📊 Datos de ejemplo insertados:
   - 5 usuarios con perfiles completos
   - 2 mentores especializados
   - 5 carreras detalladas
   - 10 recursos educativos
   - Tests vocacionales completados
   - Posts de comunidad con interacciones
   - Logs emocionales con análisis
   - Sistema de notificaciones configurado
   - Progreso gamificado implementado
🔒 Seguridad RLS habilitada en todas las tablas
🚀 ¡La aplicación está lista para usar!
```

## 📊 Tablas Creadas

### Principales:
- ✅ `users` - Usuarios principales
- ✅ `profiles` - Perfiles extendidos (compatibilidad)
- ✅ `vocational_tests` - Tests vocacionales
- ✅ `mentors` - Mentores disponibles
- ✅ `mentor_sessions` - Sesiones de mentoría

### Chat y Comunicación:
- ✅ `chat_sessions` - Sesiones de chat organizadas
- ✅ `chat_messages` - Mensajes del chat emocional
- ✅ `emotional_logs` - Logs emocionales detallados

### Recursos y Educación:
- ✅ `educational_resources` - Recursos educativos básicos
- ✅ `resources` - Recursos educativos avanzados
- ✅ `careers` - Catálogo completo de carreras
- ✅ `resource_interactions` - Interacciones con recursos

### Comunidad:
- ✅ `community_posts` - Posts de la comunidad
- ✅ `post_comments` - Comentarios en posts
- ✅ `post_likes` - Likes en posts

### Gamificación:
- ✅ `user_progress` - Progreso del usuario
- ✅ `user_achievements` - Logros específicos

### Notificaciones:
- ✅ `notifications` - Sistema de notificaciones
- ✅ `notification_preferences` - Preferencias de notificaciones

### Mentorías Avanzadas:
- ✅ `mentorships` - Relaciones de mentoría
- ✅ `mentorship_sessions` - Sesiones específicas de mentoría

## 🔒 Seguridad Implementada

- **RLS habilitado** en todas las tablas
- **Políticas granulares** por usuario
- **Funciones de seguridad** para operaciones críticas
- **Índices optimizados** para rendimiento

## 📝 Datos de Ejemplo Incluidos

### 👥 Usuarios:
- **María González** - Estudiante interesada en tecnología
- **Carlos Ruiz** - Mentor en tecnología (12 años exp.)
- **Ana García** - Mentora en medicina (8 años exp.)
- **Luis Martínez** - Estudiante de arte
- **Sofía López** - Estudiante de diseño

### 🎯 Carreras:
- Desarrollo de Software
- Medicina General
- Diseño Gráfico
- Psicología
- Marketing Digital

### 📚 Recursos:
- Cursos de programación
- Guías de diseño UX/UI
- Videos de marketing digital
- Podcasts de orientación
- Artículos especializados

### 💬 Interacciones:
- Posts de comunidad con likes y comentarios
- Mensajes de chat con análisis emocional
- Tests vocacionales completados
- Progreso gamificado con badges
- Notificaciones del sistema

## 🔧 Funciones Auxiliares Incluidas

- `increment_post_likes()` - Gestión de likes
- `increment_post_comments()` - Conteo de comentarios
- `increment_resource_views()` - Tracking de vistas
- `create_notification()` - Creación de notificaciones
- `update_updated_at_column()` - Timestamps automáticos

## ✅ Verificación Post-Migración

Para verificar que todo funciona correctamente:

1. **Verifica las tablas:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. **Verifica los datos:**
   ```sql
   SELECT COUNT(*) as total_users FROM users;
   SELECT COUNT(*) as total_mentors FROM mentors;
   SELECT COUNT(*) as total_careers FROM careers;
   ```

3. **Verifica RLS:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND rowsecurity = true;
   ```

## 🚨 Solución de Problemas

### Error: "relation already exists"
Si ves este error, significa que algunas tablas ya existen. Puedes:
1. Eliminar las tablas existentes (⚠️ perderás datos)
2. O usar `IF NOT EXISTS` (ya incluido en la migración)

### Error: "permission denied"
Asegúrate de tener permisos de administrador en tu proyecto de Supabase.

### Error: "function does not exist"
Ejecuta primero las funciones auxiliares antes que las tablas que las usan.

## 📞 Soporte

Si encuentras problemas:
1. Verifica que copiaste **todo** el contenido del archivo
2. Asegúrate de estar en el proyecto correcto de Supabase
3. Revisa los logs de error en el SQL Editor
4. Verifica que tu proyecto tenga suficiente espacio/límites

---

**¡Listo!** Tu base de datos está configurada y lista para usar con CarreraGuía. 🎉