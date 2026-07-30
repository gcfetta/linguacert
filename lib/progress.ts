import { ProgressRecord, SessionRecord } from "./types";

const STORAGE_PREFIX = "linguacert_progress_";
const SESSIONS_PREFIX = "linguacert_sessions_";

function getKey(walletAddress: string | null): string {
  return STORAGE_PREFIX + (walletAddress ? walletAddress.toLowerCase() : "guest");
}

function getSessionsKey(walletAddress: string | null): string {
  return SESSIONS_PREFIX + (walletAddress ? walletAddress.toLowerCase() : "guest");
}

const EMPTY_PROGRESS: ProgressRecord = {
  approvedSessions: 0,
  totalSessions: 0,
  lastLanguage: "",
  lastLevel: "",
};

export function loadProgress(walletAddress: string | null): ProgressRecord {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(getKey(walletAddress));
    if (!raw) return EMPTY_PROGRESS;
    return JSON.parse(raw) as ProgressRecord;
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(
  walletAddress: string | null,
  progress: ProgressRecord
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getKey(walletAddress), JSON.stringify(progress));
}

// Guarda el registro de una sesión aprobada
export function saveSessionRecord(
  walletAddress: string | null,
  session: SessionRecord
): void {
  if (typeof window === "undefined") return;
  const existing = loadSessionRecords(walletAddress);
  existing.push(session);
  window.localStorage.setItem(getSessionsKey(walletAddress), JSON.stringify(existing));
}

// Carga todos los registros de sesiones aprobadas
export function loadSessionRecords(walletAddress: string | null): SessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(getSessionsKey(walletAddress));
    if (!raw) return [];
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
}

// Genera un hash combinado de todas las sesiones aprobadas.
// Este hash es el que va al contrato: si alguien quiere verificar,
// vos le mostrás los SessionRecord guardados y pueden recalcularlo.
export async function computeSessionsHash(sessions: SessionRecord[]): Promise<string> {
  const data = JSON.stringify(sessions.map(s => ({
    ts: s.timestamp,
    lang: s.language,
    lvl: s.level,
    score: s.score,
    topic: s.topic,
    messages: s.messages,
  })));

  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}