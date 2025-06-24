# Guía de Migración - CarreraGuía

## 📋 Sistema de Migraciones Modular

CarreraGuía utiliza un sistema de migraciones modular para mantener la base de datos organizada y facilitar el desarrollo colaborativo.

### 🔄 Convención de Nombrado

Todas las migraciones siguen este formato:
```
YYYYMMDD_HHMMSS_nombre_descriptivo.sql
```

### 📂 Organización de Archivos

Las migraciones se organizan en las siguientes categorías:

1. **Migraciones Completas**: Contienen el esquema completo para instalaciones nuevas
   - Ejemplo: `20250624_000000_complete_schema.sql`

2. **Migraciones Incrementales**: Añaden nuevas funcionalidades al esquema existente
   - Ejemplo: `20250624_000001_add_ai_metadata.sql`

## 🚀 Instrucciones de Ejecución

### Para Instalaciones Nuevas

**EJECUTAR ÚNICAMENTE:**
```sql
supabase/migrations/20250624_000000_complete_schema.sql
```

### Para Actualizaciones Incrementales

Si ya tienes la base de datos instalada y solo necesitas aplicar nuevas funcionalidades, ejecuta las migraciones incrementales en orden:

```sql
supabase/migrations/20250624_000001_add_ai_metadata.sql
supabase/migrations/20250624_000002_add_user_preferences.sql
```

## ❌ Migraciones Obsoletas (NO EJECUTAR)

Las siguientes migraciones están obsoletas y NO deben ejecutarse:
- `20250610204914_maroon_recipe.sql`
- `20250618003004_frosty_frog.sql` 
- `20250618191740_summer_king.sql`
- `20250618192705_noisy_bridge.sql`
- `20250624181258_tiny_term.sql`
- `20250624182149_late_hall.sql`

## 🔍 Verificación Post-Migración

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

### Error: "policy already exists"
Este error ocurre cuando intentas crear una política que ya existe. Nuestras migraciones usan bloques `DO` para verificar si las políticas ya existen antes de crearlas.

### Error: "function does not exist"
Ejecuta primero las funciones auxiliares antes que las tablas que las usan.

## 📝 Creación de Nuevas Migraciones

Para crear una nueva migración:

1. **Nombra el archivo** siguiendo la convención:
   ```
   YYYYMMDD_HHMMSS_nombre_descriptivo.sql
   ```

2. **Estructura el contenido**:
   ```sql
   /*
     # Título descriptivo
     
     Descripción detallada de lo que hace esta migración.
     
     1. Cambios:
       - Cambio 1
       - Cambio 2
     
     2. Propósito:
       - Razón 1
       - Razón 2
   */
   
   -- Código SQL aquí
   
   -- Verificación final
   DO $$
   BEGIN
     RAISE NOTICE '✅ Migración completada';
   END $$;
   ```

3. **Usa verificaciones de existencia**:
   ```sql
   -- Para tablas
   CREATE TABLE IF NOT EXISTS mi_tabla (...);
   
   -- Para políticas
   DO $$
   BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_policies 
       WHERE tablename = 'mi_tabla' 
       AND policyname = 'Mi política'
     ) THEN
       CREATE POLICY "Mi política" ON mi_tabla ...;
     END IF;
   END $$;
   ```

## 📞 Soporte

Si encuentras problemas:
1. Verifica que copiaste **todo** el contenido del archivo
2. Asegúrate de estar en el proyecto correcto de Supabase
3. Revisa los logs de error en el SQL Editor
4. Verifica que tu proyecto tenga suficiente espacio/límites