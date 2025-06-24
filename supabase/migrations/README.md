# Sistema de Migraciones de CarreraGuía

## Estructura de Migraciones

Este proyecto utiliza un sistema de migraciones modular para mantener la base de datos organizada y facilitar el desarrollo colaborativo.

### Convenciones de Nombrado

Todas las migraciones siguen este formato:
```
YYYYMMDD_HHMMSS_nombre_descriptivo.sql
```

Donde:
- `YYYYMMDD_HHMMSS` es la marca de tiempo (timestamp) que garantiza el orden correcto
- `nombre_descriptivo` es un nombre que describe claramente el propósito de la migración

### Organización de Archivos

Las migraciones se organizan en las siguientes categorías:

1. **Migraciones Completas**: Contienen el esquema completo para instalaciones nuevas
   - Ejemplo: `20250624_000000_complete_schema.sql`

2. **Migraciones Incrementales**: Añaden nuevas funcionalidades al esquema existente
   - Ejemplo: `20250624_000001_add_notifications.sql`

3. **Migraciones de Datos**: Solo insertan o modifican datos, no el esquema
   - Ejemplo: `20250624_000002_seed_example_data.sql`

4. **Migraciones de Corrección**: Corrigen problemas en migraciones anteriores
   - Ejemplo: `20250624_000003_fix_foreign_keys.sql`

## Ejecución de Migraciones

### Para Instalaciones Nuevas

Ejecutar **únicamente** la migración completa más reciente:

```sql
supabase/migrations/20250624_000000_complete_schema.sql
```

### Para Actualizaciones Incrementales

Ejecutar solo las migraciones incrementales posteriores a la última migración aplicada:

```sql
supabase/migrations/20250624_000001_add_notifications.sql
supabase/migrations/20250624_000002_seed_example_data.sql
```

## Buenas Prácticas

1. **Nunca modificar** migraciones ya aplicadas
2. **Siempre crear** nuevas migraciones para cambios adicionales
3. **Documentar** cada migración con comentarios descriptivos
4. **Verificar** compatibilidad con migraciones anteriores
5. **Incluir** instrucciones de rollback cuando sea posible

## Manejo de Errores Comunes

### Error: "relation already exists"
Indica que la tabla ya existe. Usar `CREATE TABLE IF NOT EXISTS` para evitarlo.

### Error: "policy already exists"
Usar bloques `DO` para verificar si la política ya existe antes de crearla:

```sql
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

### Error: "function does not exist"
Asegurarse de que las funciones se crean antes de ser utilizadas por triggers o políticas.