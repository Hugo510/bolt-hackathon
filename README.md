# CarreraGuía - Aplicación de Orientación Vocacional

Una aplicación completa de orientación vocacional con IA, mentorías y apoyo emocional.

## 🚀 Configuración Inicial

### 1. Configurar Supabase

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea una cuenta y un nuevo proyecto
   - Copia la URL del proyecto y la clave anónima

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con tus credenciales:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
   ```

3. **Ejecutar migraciones:**
   - Ve al SQL Editor en tu dashboard de Supabase
   - Ejecuta el contenido de `supabase/migrations/20250618200000_complete_schema_with_data.sql`
   - Esto creará todas las tablas y datos de ejemplo

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Ejecutar la Aplicación

```bash
npm start
```

## 🔧 Verificación de Conexión

La aplicación incluye un debugger de conexión que se activa automáticamente en desarrollo si hay problemas con Supabase.

**Para mostrar el debugger manualmente:**
- En desarrollo: Haz triple clic en cualquier parte de la pantalla
- Verifica el estado de conexión y configuración

## 📊 Datos de Ejemplo Incluidos

La migración incluye datos de prueba:

### Usuarios de Ejemplo:
- **María González** (maria.gonzalez@email.com) - Estudiante interesada en tecnología
- **Carlos Ruiz** (carlos.mentor@email.com) - Mentor en tecnología
- **Ana García** (ana.doctora@email.com) - Mentora en medicina
- **Luis Martínez** (luis.estudiante@email.com) - Estudiante de arte
- **Sofía López** (sofia.creativa@email.com) - Estudiante de diseño

### Datos Incluidos:
- ✅ **5 usuarios** con perfiles completos
- ✅ **2 mentores** con especialidades y disponibilidad
- ✅ **5 carreras** con información detallada
- ✅ **5 recursos educativos** variados
- ✅ **Tests vocacionales** completados
- ✅ **Posts de comunidad** con interacciones
- ✅ **Logs emocionales** con análisis
- ✅ **Mensajes de chat** de ejemplo
- ✅ **Progreso de usuarios** con puntos y badges

## 🏗️ Arquitectura Modular

### Hooks Especializados:
- `useUser` - Gestión de usuarios
- `useMentorships` - Sistema de mentorías
- `useEmotionalLogs` - Análisis emocional
- `useNotifications` - Sistema de notificaciones
- `useAnalytics` - Tracking y métricas
- `useOfflineSync` - Sincronización offline

### Componentes Organizados:
- `/components/ui` - Componentes de interfaz
- `/components/animations` - Animaciones y transiciones
- `/components/graphics` - Gráficos y visualizaciones
- `/components/forms` - Formularios especializados
- `/components/debug` - Herramientas de desarrollo

## 🎯 Funcionalidades Principales

### ✅ Implementadas:
- **Sistema de autenticación** completo con Supabase
- **Dashboard personalizado** con métricas
- **Tests vocacionales** adaptativos
- **Sistema de mentorías** con sesiones
- **Chat de apoyo emocional** con IA
- **Recursos educativos** con filtros
- **Comunidad gamificada** con posts y comentarios
- **Sistema de notificaciones** en tiempo real
- **Análisis emocional** con insights
- **Progreso y gamificación** con badges
- **Sincronización offline** automática

### 🔮 Preparado para Futuras Integraciones:
- **ElevenLabs** - Síntesis de voz
- **Tavus** - Videos personalizados con IA
- **OpenAI** - Chat avanzado con GPT
- **Analytics** - Tracking detallado
- **Notificaciones Push** - Engagement

## 🛠️ Desarrollo

### Comandos Útiles:
```bash
# Desarrollo
npm start

# Limpiar caché
npx expo start --clear

# Verificar tipos
npx tsc --noEmit

# Testing (cuando se implemente)
npm test
```

### Estructura de Archivos:
```
app/
├── (auth)/          # Autenticación
├── (tabs)/          # Navegación principal
├── _layout.tsx      # Layout raíz
└── index.tsx        # Splash screen

components/          # Componentes reutilizables
├── ui/             # Componentes de interfaz
├── animations/     # Animaciones
├── graphics/       # Gráficos y charts
├── forms/          # Formularios
└── debug/          # Herramientas de desarrollo

hooks/              # Hooks personalizados
contexts/           # Contextos de React
lib/               # Configuración de librerías
supabase/          # Migraciones y esquemas
types/             # Definiciones TypeScript
utils/             # Utilidades
```

## 🔒 Seguridad

- **RLS (Row Level Security)** habilitado en todas las tablas
- **Políticas de acceso** granulares por usuario
- **Validación** en frontend y backend
- **Variables de entorno** para credenciales sensibles

## 📱 Plataformas Soportadas

- ✅ **Web** (principal)
- ✅ **iOS** (con Expo Go)
- ✅ **Android** (con Expo Go)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.