# Guía de Integración - CarreraGuía

## Configuración de Supabase

### 1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Copia la URL del proyecto y la clave anónima
4. Crea un archivo `.env` basado en `.env.example`

### 2. Configurar Base de Datos
1. Ve a la sección SQL Editor en tu dashboard de Supabase
2. Ejecuta el script `supabase/migrations/create_initial_schema.sql`
3. Verifica que todas las tablas se hayan creado correctamente

### 3. Configurar Autenticación
1. Ve a Authentication > Settings
2. Desactiva "Enable email confirmations" para desarrollo
3. Configura las URLs de redirección si es necesario

## Integraciones Futuras

### ElevenLabs (Síntesis de Voz)
```typescript
// Ejemplo de integración futura
import { ElevenLabsAPI } from '@elevenlabs/api';

const elevenlabs = new ElevenLabsAPI({
  apiKey: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY
});

// Convertir respuestas del chat a audio
const generateSpeech = async (text: string) => {
  const audio = await elevenlabs.generate({
    voice: "Rachel", // Voz femenina empática
    text: text,
    model_id: "eleven_multilingual_v2"
  });
  return audio;
};
```

### Tavus (Videos Personalizados)
```typescript
// Ejemplo de integración futura
import { TavusAPI } from '@tavus/api';

const tavus = new TavusAPI({
  apiKey: process.env.EXPO_PUBLIC_TAVUS_API_KEY
});

// Generar videos personalizados de mentores
const generateMentorVideo = async (mentorId: string, message: string) => {
  const video = await tavus.createVideo({
    replica_id: mentorId,
    script: message,
    background: "office"
  });
  return video;
};
```

## Estructura del Proyecto

```
app/
├── (auth)/          # Pantallas de autenticación
├── (tabs)/          # Navegación principal por pestañas
├── _layout.tsx      # Layout raíz
└── index.tsx        # Pantalla de bienvenida

components/          # Componentes reutilizables
contexts/           # Contextos de React (Auth, etc.)
lib/               # Configuración de librerías (Supabase)
types/             # Definiciones de TypeScript
supabase/          # Migraciones y esquemas
docs/              # Documentación
```

## Funcionalidades Implementadas

### ✅ Completadas
- Sistema de autenticación completo
- Dashboard personalizado
- Test vocacional adaptativo
- Listado de mentores con filtros
- Chat de apoyo emocional con detección de emociones
- Recursos educativos con búsqueda y filtros
- Base de datos completa con RLS

### 🚧 En Desarrollo
- Sistema de reserva de sesiones de mentoría
- Comunidad gamificada
- Notificaciones push
- Sistema de puntos y badges

### 🔮 Futuras
- Integración con ElevenLabs para respuestas de voz
- Videos personalizados con Tavus
- IA avanzada para recomendaciones
- Análisis de sentimientos mejorado

## Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Limpiar caché
npx expo start --clear

# Generar tipos de Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

## Consideraciones de Seguridad

1. **RLS (Row Level Security)**: Todas las tablas tienen RLS habilitado
2. **Políticas de acceso**: Los usuarios solo pueden acceder a sus propios datos
3. **Validación**: Validación tanto en frontend como backend
4. **Claves API**: Nunca exponer claves secretas en el frontend

## Deployment

### Web
```bash
npm run build:web
# Subir la carpeta dist/ a tu hosting preferido
```

### Mobile
1. Configurar EAS Build
2. Crear builds para iOS/Android
3. Subir a App Store/Google Play

## Soporte

Para preguntas o problemas:
1. Revisa la documentación de Expo
2. Consulta la documentación de Supabase
3. Revisa los issues en GitHub