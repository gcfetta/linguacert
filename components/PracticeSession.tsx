"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage, EvaluationResponse, Language, Level, PASSING_SCORE } from "@/lib/types";
import { Send, Sparkles, Zap, XCircle } from "lucide-react";
import { loadProgress, saveProgress, saveSessionRecord } from "@/lib/progress";

interface Props {
  language: Language;
  level: Level;
  flag: string;
  username: string;
  onCancel: () => void;
  onSessionComplete: (score: number, approved: boolean) => void;
}

export default function PracticeSession({ language, level, flag, username, onCancel, onSessionComplete }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [turn, setTurn] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [showFinishButton, setShowFinishButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Flag de referencia para bloquear llamadas duplicadas por el StrictMode
  const hasFetched = useRef(false);
  const MAX_TURNS = 5;

  useEffect(() => {
    // Si ya se está ejecutando o ya se llamó una vez, cancelamos el segundo disparo
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchTopic() {
      setLoading(true);
      console.log("%c🔌 [LinguaCert] Generando sesión única y segura por IA...", "color: #9333ea; font-weight: bold;");
      
      try {
        const res = await fetch(`/api/chat?language=${encodeURIComponent(language)}&level=${encodeURIComponent(level)}`);
        if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);
        
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        console.log("%c✅ [IA CONECTADA] Tema único recibido exitosamente:", "color: #10b981; font-weight: bold;", data);
        
        setTopic(`${data.topic} (${data.topicEs})`);
        setMessages([
          {
            role: "ai",
            content: data.intro || `Hello! Let's talk about ${data.topic}.`
          }
        ]);
      } catch (error: any) {
        console.error("%c❌ [FALLO DE CONEXIÓN] Utilizando contingencia local.", "color: #ef4444; font-weight: bold;", error);
        setTopic("Travel Plans (Planes de Viaje)");
        setMessages([
          { 
            role: "ai", 
            content: "Hello! Let's talk about our dream vacations. If you could travel anywhere right now, what country would you choose and why?" 
          }
        ]);
      }
      setLoading(false);
    }
    fetchTopic();
  }, [language, level]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading || turn >= MAX_TURNS) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    console.log(`%c📨 [Giro ${turn + 1}/${MAX_TURNS}] Sincronizando corrección...`, "color: #2563eb;");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: currentInput, language, level, topic }),
      });

      if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      console.log("%c🎯 [IA RESPONDIDIÓ] Turno evaluado correctamente:", "color: #10b981; font-weight: bold;", data);

      const newTurn = turn + 1;
      const updatedScores = [...scores, data.score];

      setTurn(newTurn);
      setScores(updatedScores);

      setMessages((prev) => {
        const copy = [...prev];
        const lastUserIdx = copy.length - 1;
        if (copy[lastUserIdx] && copy[lastUserIdx].role === "user") {
          copy[lastUserIdx] = {
            ...copy[lastUserIdx],
            feedback: data.feedback,
            score: data.score,
            corrected: data.corrected
          };
        }
        return copy;
      });

      const isLast = newTurn >= MAX_TURNS;
      
      if (isLast) {
        const avgScore = Math.round(updatedScores.reduce((a, b) => a + b, 0) / newTurn);
        const approved = avgScore >= PASSING_SCORE;

        const progress = loadProgress(username);
        const updated = {
          approvedSessions: approved ? progress.approvedSessions + 1 : progress.approvedSessions,
          totalSessions: progress.totalSessions + 1,
          lastLanguage: language,
          lastLevel: level,
        };
        saveProgress(username, updated);

        // Si la sesión fue aprobada, guardamos su registro para el hash verificable
        if (approved) {
          saveSessionRecord(username, {
            timestamp: Date.now(),
            language,
            level,
            score: avgScore,
            messages: [...messages, userMsg], // conversación completa de la sesión
            topic,
          });
        }

        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "🏁 ¡Completaste los 5 giros obligatorios de la práctica! Podés revisar el feedback interactivo arriba." }
        ]);
        setShowFinishButton(true);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
      }
    } catch (error: any) {
      console.error("%c❌ [FALLO EN EVALUACIÓN]", "color: #ef4444; font-weight: bold;", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `⚠️ Error de comunicación en este turno: ${error.message}` }
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b-2 border-purple-100 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{flag}</span>
              <div>
                <span className="font-black text-sm text-purple-800">{language}</span>
                <span className="text-xs font-bold text-purple-400 ml-1.5">· {level}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100 border-2 border-yellow-200">
                <Zap className="w-3.5 h-3.5 text-yellow-600" />
                <span className="text-xs font-black text-yellow-700">{turn}/{MAX_TURNS}</span>
              </div>
              
              <button
                onClick={onCancel}
                className="p-1.5 text-purple-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                title="Cancelar sesión"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="h-3 rounded-full bg-purple-100 overflow-hidden border border-purple-200">
            <div className="h-full rounded-full bg-purple-300 transition-all duration-500" style={{ width: `${(turn / MAX_TURNS) * 100}%` }} />
          </div>
          <div className="text-[11px] text-purple-400 font-bold mt-1 text-center truncate">
            {topic || "Generando tema por IA..."}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.map((msg, i) =>
            msg.role === "ai" ? (
              <div key={i} className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="flex items-center gap-1.5 mb-1 ml-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-xs font-black text-purple-400">LinguaAI</span>
                  </div>
                  <div className="bg-white rounded-3xl rounded-tl-lg border-2 border-purple-100 px-4 py-3.5 shadow-[0_4px_12px_rgba(192,132,252,0.12)]">
                    <p className="text-sm font-semibold text-purple-900 leading-relaxed whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div key={i} className="flex flex-col items-end space-y-2">
                <div className="max-w-[75%] bg-purple-200 rounded-3xl rounded-tr-lg border-2 border-purple-300 px-4 py-3.5 shadow-[0_4px_12px_rgba(192,132,252,0.2)]">
                  <p className="text-sm font-bold text-purple-900 leading-relaxed">{msg.content}</p>
                </div>
                {msg.feedback && (
                  <div className="max-w-[85%] bg-orange-50 border-2 border-orange-200 text-purple-900 rounded-3xl p-4 shadow-sm text-left">
                    <p className="text-xs font-black text-orange-600 mb-1">✏️ Corrección Inteligente</p>
                    <p className="text-xs font-bold mb-2">
                      <span className="line-through text-red-400 mr-2">"{msg.content}"</span>
                      <span className="text-emerald-600">→ "{msg.corrected}"</span>
                    </p>
                    <p className="text-xs text-purple-700 leading-relaxed"><strong>Feedback:</strong> {msg.feedback}</p>
                    <p className="text-[11px] text-indigo-600 font-bold mt-1">Puntaje del giro: {msg.score}/100</p>
                  </div>
                )}
              </div>
            )
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-3xl rounded-tl-lg border-2 border-purple-100 px-5 py-4">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-300 animate-bounce" />
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-300 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-300 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t-2 border-purple-100 px-4 py-4">
        <div className="max-w-lg mx-auto">
          {!showFinishButton ? (
            <div className="flex gap-3 items-end">
              <div className="flex-1 bg-purple-50 rounded-2xl px-4 py-3 border-2 border-purple-200 focus-within:border-purple-400 focus-within:bg-white transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Escribí tu respuesta..."
                  disabled={loading}
                  className="w-full bg-transparent text-sm font-semibold text-purple-900 placeholder:text-purple-300 outline-none"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-12 h-12 rounded-2xl bg-purple-300 border-2 border-purple-400 flex items-center justify-center shadow-[0_4px_0px_rgba(192,132,252,0.5)] hover:bg-purple-400 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4 text-purple-900" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                const totalTurns = scores.length || 1;
                const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalTurns);
                onSessionComplete(avgScore, avgScore >= PASSING_SCORE);
              }}
              className="w-full py-4 rounded-2xl font-black text-base shadow-[0_6px_0px_0px] transition-all bg-emerald-300 hover:bg-emerald-400 shadow-emerald-200 text-emerald-900"
            >
              🏁 Ver Resultados Finales
            </button>
          )}
        </div>
      </div>
    </div>
  );
}