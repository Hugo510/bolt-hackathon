// Servicio centralizado para manejar todas las integraciones de AI

export class AIIntegrationService {
  private static instance: AIIntegrationService;
  private configs: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): AIIntegrationService {
    if (!AIIntegrationService.instance) {
      AIIntegrationService.instance = new AIIntegrationService();
    }
    return AIIntegrationService.instance;
  }

  // Configuración de servicios
  configureService(serviceName: string, config: any) {
    this.configs.set(serviceName, config);
  }

  getServiceConfig(serviceName: string) {
    return this.configs.get(serviceName);
  }

  // Verificar disponibilidad de servicios
  isServiceAvailable(serviceName: string): boolean {
    const config = this.configs.get(serviceName);
    return config && config.apiKey;
  }

  // Obtener servicios disponibles
  getAvailableServices(): string[] {
    return Array.from(this.configs.keys()).filter(service => 
      this.isServiceAvailable(service)
    );
  }

  // Logging y analytics para uso de AI
  logAIUsage(service: string, operation: string, tokens?: number, cost?: number) {
    console.log(`AI Usage: ${service} - ${operation}`, {
      timestamp: new Date().toISOString(),
      tokens,
      cost,
    });
    
    // Aquí se podría integrar con un servicio de analytics
    // como Mixpanel, Amplitude, etc.
  }

  // Rate limiting básico
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  checkRateLimit(service: string, limit: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = service;
    const current = this.rateLimits.get(key);

    if (!current || now > current.resetTime) {
      this.rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (current.count >= limit) {
      return false;
    }

    current.count++;
    return true;
  }

  // Cache para respuestas de AI (opcional)
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  getCachedResponse(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCachedResponse(key: string, data: any, ttlMs: number = 300000) { // 5 minutos por defecto
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  // Cleanup de cache
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now >= value.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Instancia singleton
export const aiService = AIIntegrationService.getInstance();

// Configuración inicial (se puede llamar desde el App.tsx)
export function initializeAIServices() {
  // ElevenLabs
  if (process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY) {
    aiService.configureService('elevenlabs', {
      apiKey: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY,
      defaultVoice: 'rachel',
      model: 'eleven_multilingual_v2',
    });
  }

  // Tavus
  if (process.env.EXPO_PUBLIC_TAVUS_API_KEY) {
    aiService.configureService('tavus', {
      apiKey: process.env.EXPO_PUBLIC_TAVUS_API_KEY,
      defaultBackground: 'office',
      defaultResolution: '720p',
    });
  }

  // OpenAI
  if (process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
    aiService.configureService('openai', {
      apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
    });
  }

  // Cleanup cache cada 10 minutos
  setInterval(() => {
    aiService.cleanupCache();
  }, 600000);
}