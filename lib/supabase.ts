import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Only import the polyfill for non-web platforms
if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'carrera-guia-app',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Función para verificar la conexión
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error de conexión a Supabase:', error);
      return false;
    }
    
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error);
    return false;
  }
};

// Función para verificar el estado de las tablas
export const checkDatabaseSchema = async () => {
  try {
    const tables = [
      'users',
      'profiles', 
      'vocational_tests',
      'mentors',
      'mentor_sessions',
      'chat_messages',
      'educational_resources',
      'community_posts',
      'user_progress',
      'notifications',
      'mentorships'
    ];

    const results = await Promise.allSettled(
      tables.map(async (table) => {
        const { error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });
        
        if (error) throw new Error(`Tabla ${table}: ${error.message}`);
        return table;
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected');

    console.log(`✅ ${successful}/${tables.length} tablas verificadas correctamente`);
    
    if (failed.length > 0) {
      console.warn('⚠️ Tablas con problemas:', failed.map(f => f.reason));
    }

    return { successful, failed: failed.length, total: tables.length };
  } catch (error) {
    console.error('❌ Error verificando esquema:', error);
    return { successful: 0, failed: 0, total: 0 };
  }
};

// Función para configuración inicial
export const initializeSupabase = async () => {
  console.log('🔄 Inicializando conexión a Supabase...');
  
  const isConnected = await testConnection();
  if (!isConnected) {
    throw new Error('No se pudo establecer conexión con Supabase');
  }

  const schemaStatus = await checkDatabaseSchema();
  console.log(`📊 Estado del esquema: ${schemaStatus.successful}/${schemaStatus.total} tablas`);

  return {
    connected: isConnected,
    schemaStatus,
  };
};