// Tipos compartidos del proyecto LinguaCert
export type Language = "Inglés" | "Francés" | "Portugués" | "Italiano" | "Alemán";
export type Level = "Básico" | "Intermedio" | "Avanzado";

// Respuesta de GET /api/chat (al pedir un tema nuevo)
export interface TopicResponse {
  topic: string;
  topicEs: string;
}

// Respuesta de POST /api/chat (al evaluar un mensaje del usuario)
export interface EvaluationResponse {
  feedback: string;
  score: number;
  corrected: string;
  reply?: string;
}

// Mensaje dentro del historial de la conversación
export interface ChatMessage {
  role: "ai" | "user";
  content: string;
  feedback?: string;
  score?: number;
  corrected?: string;
}

// Umbral mínimo de score para que una sesión cuente como aprobada
export const PASSING_SCORE = 60;

// Lo que guardamos en localStorage
export interface ProgressRecord {
  approvedSessions: number;
  totalSessions: number;
  lastLanguage: Language | "";
  lastLevel: Level | "";
}

// Resumen de una sesión aprobada que se persiste para luego hashear
export interface SessionRecord {
  timestamp: number;
  language: Language;
  level: Level;
  score: number;
  messages: ChatMessage[];   // conversación completa
  topic: string;
}