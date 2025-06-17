// Tipos TypeScript para todas las integraciones de AI

export interface AIServiceConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface AIUsageMetrics {
  service: string;
  operation: string;
  timestamp: Date;
  tokens?: number;
  cost?: number;
  duration?: number;
  success: boolean;
  error?: string;
}

export interface VoiceSettings {
  voiceId?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
  language?: string;
  stability?: number;
  similarityBoost?: number;
}

export interface VideoSettings {
  replicaId?: string;
  background?: string;
  resolution?: '720p' | '1080p' | '4k';
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export interface ChatSettings {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  context?: string[];
}

export interface EmotionDetection {
  primary: string;
  secondary: string[];
  intensity: number;
  confidence: number;
  valence: number; // -1 (negative) to 1 (positive)
  arousal: number; // 0 (calm) to 1 (excited)
}

export interface AIPersonality {
  name: string;
  traits: string[];
  communicationStyle: 'formal' | 'casual' | 'empathetic' | 'professional';
  expertise: string[];
  responseLength: 'short' | 'medium' | 'long';
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  history: ChatMessage[];
  userProfile?: {
    age?: number;
    interests: string[];
    goals: string[];
    emotionalState?: EmotionDetection;
  };
  currentTopic?: string;
  lastInteraction: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  emotion?: EmotionDetection;
  metadata?: {
    tokens?: number;
    model?: string;
    confidence?: number;
  };
}

export interface AIRecommendation {
  type: 'career' | 'resource' | 'activity' | 'mentor';
  title: string;
  description: string;
  confidence: number;
  reasoning: string[];
  actionItems: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface VocationalAnalysis {
  personalityType: string;
  interests: string[];
  skills: string[];
  values: string[];
  careerMatches: {
    career: string;
    matchPercentage: number;
    reasons: string[];
    requirements: string[];
    outlook: string;
  }[];
  recommendations: AIRecommendation[];
  nextSteps: string[];
}

export interface MentorProfile {
  id: string;
  name: string;
  specialty: string[];
  experience: number;
  personality: AIPersonality;
  availability: {
    timezone: string;
    schedule: string[];
  };
  videoReplicaId?: string;
  voiceId?: string;
}

export interface AIServiceStatus {
  service: string;
  status: 'available' | 'unavailable' | 'limited' | 'maintenance';
  lastCheck: Date;
  responseTime?: number;
  errorRate?: number;
  quotaUsed?: number;
  quotaLimit?: number;
}

export interface AIIntegrationEvent {
  type: 'service_call' | 'error' | 'quota_warning' | 'rate_limit';
  service: string;
  timestamp: Date;
  data: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
}