"use client";

import { useState, useEffect } from "react";
import PracticeSession from "@/components/PracticeSession";
import Certificate from "@/components/Certificate";
import { loadProgress } from "@/lib/progress";
import { Language, Level } from "@/lib/types";
import { Star, Check, RotateCcw, User, LogOut, ShieldAlert } from "lucide-react";

// Forzamos la declaración global en este archivo también para que compile sin peros
declare global {
  interface Window {
    ethereum?: any;
  }
}

const LANGUAGES = [
  { code: "en", name: "Inglés",    flag: "🇬🇧", bg: "bg-blue-100",   border: "border-blue-300",   text: "text-blue-700"   },
  { code: "fr", name: "Francés",   flag: "🇫🇷", bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-700" },
  { code: "pt", name: "Português", flag: "🇧🇷", bg: "bg-green-100",  border: "border-green-300",  text: "text-green-700"  },
  { code: "it", name: "Italiano",  flag: "🇮🇹", bg: "bg-rose-100",   border: "border-rose-300",   text: "text-rose-700"   },
  { code: "de", name: "Alemán",    flag: "🇩🇪", bg: "bg-amber-100",  border: "border-amber-300",  text: "text-amber-700"  },
];

const LEVELS = [
  { id: "Básico",     emoji: "🌱", xp: 5,  bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-700" },
  { id: "Intermedio", emoji: "🔥", xp: 10, bg: "bg-orange-100",  border: "border-orange-300",  text: "text-orange-700"  },
  { id: "Avanzado",   emoji: "⚡", xp: 20, bg: "bg-violet-100",  border: "border-violet-300",  text: "text-violet-700"  },
];

const SESSION_STICKERS = ["⭐", "🌟", "💫", "✨", "🏅"];
const SESSIONS_NEEDED = 3;

function BlobBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-purple-200/50 blur-3xl" />
      <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 w-80 h-80 rounded-full bg-emerald-200/35 blur-3xl" />
      <div className="absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-yellow-200/45 blur-3xl" />
    </div>
  );
}

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [screen, setScreen] = useState<"setup" | "chat" | "results">("setup");
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [selectedLevel, setSelectedLevel] = useState(LEVELS[1]);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [loginError, setLoginError] = useState("");
  
  const [finalScore, setFinalScore] = useState<number>(0);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  useEffect(() => {
    const savedWallet = window.localStorage.getItem("linguacert_current_user");
    if (savedWallet) {
      setWalletAddress(savedWallet);
      setIsLoggedIn(true);
      const progress = loadProgress(savedWallet);
      setSessionsCompleted(Math.min(progress.approvedSessions, SESSIONS_NEEDED));
    }
  }, [screen]);

  async function connectMetaMask() {
    setLoginError("");
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask no está instalado en tu navegador.");
      }
      
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) throw new Error("No se seleccionó ninguna cuenta.");
      
      const account = accounts[0].toLowerCase();
      console.log("%c🔐 Autenticación Web3 Exitosa para Wallet:", "color: #10b981; font-weight: bold;", account);
      
      window.localStorage.setItem("linguacert_current_user", account);
      setWalletAddress(account);
      setIsLoggedIn(true);
      
      const progress = loadProgress(account);
      setSessionsCompleted(Math.min(progress.approvedSessions, SESSIONS_NEEDED));
    } catch (error: any) {
      console.error(error);
      setLoginError(error.message || "Error al conectar con tu identidad Blockchain.");
    }
  }

  function handleLogout() {
    window.localStorage.removeItem("linguacert_current_user");
    setWalletAddress("");
    setIsLoggedIn(false);
    setScreen("setup");
  }

  function handleStart() {
    setScreen("chat");
  }

  function handleSessionComplete(score: number, approved: boolean) {
    setFinalScore(score);
    setIsApproved(approved);
    
    const progress = loadProgress(walletAddress);
    setSessionsCompleted(Math.min(progress.approvedSessions, SESSIONS_NEEDED));
    setScreen("results");
  }

  const isReadyForCert = sessionsCompleted >= SESSIONS_NEEDED;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center text-[#2D1B4E]" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <BlobBg />
        <div className="max-w-md w-full px-4">
          <div className="flex flex-col items-center mb-6">
            <div className="inline-flex items-center gap-2">
              <span className="text-4xl">🌍</span>
              <h1 className="text-5xl font-black text-purple-600 tracking-tight" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                LinguaCert
              </h1>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border-2 border-purple-100 shadow-[0_8px_30px_rgba(192,132,252,0.15)] p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4">
              <User className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-purple-600 mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Portal de Identidad
            </h1>
            <p className="text-sm font-bold text-purple-400 mb-6">
              Para asegurar que tus certificados te pertenezcan únicamente a vos, iniciá sesión usando tu firma criptográfica.
            </p>
            
            <button
              onClick={connectMetaMask}
              className="w-full py-4 rounded-2xl font-black text-base shadow-[0_6px_0px_0px] transition-all bg-yellow-300 hover:bg-yellow-400 shadow-yellow-200 text-yellow-900 active:translate-y-1 active:shadow-none"
            >
              🦊 Conectar MetaMask (Web3 Auth)
            </button>

            {loginError && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold text-left">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "setup") {
    return (
      <div className="min-h-screen bg-[#FFF8F0] text-[#2D1B4E]" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <BlobBg />
        <div className="max-w-lg mx-auto px-4 py-10">
          
          <div className="flex justify-between items-center bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-purple-100 mb-6">
            <div className="flex items-center gap-2 overflow-hidden mr-2">
              <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-xs font-black text-purple-700 flex-shrink-0">
                🔗
              </div>
              <span className="text-xs font-black text-purple-700 truncate">
                Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
            <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 flex-shrink-0">
              <LogOut className="w-3.5 h-3.5" /> Desconectar
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-4xl">🌍</span>
              <h1 className="text-5xl font-black text-purple-600 tracking-tight" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                LinguaCert
              </h1>
            </div>
            <p className="text-purple-400 font-semibold text-base">Practicá · Aprendé · Certificá 🎓</p>

            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-yellow-100 border-2 border-yellow-200">
              <span className="text-base">⭐</span>
              <span className="text-sm font-black text-yellow-700">{sessionsCompleted} stickers ganados</span>
              <span className="text-xs font-bold text-yellow-500">· {Math.max(0, SESSIONS_NEEDED - sessionsCompleted)} para el cert</span>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border-2 border-purple-100 shadow-[0_8px_30px_rgba(192,132,252,0.15)] mb-5 p-5">
            <p className="text-sm font-black text-purple-700 mb-3">Tu colección hacia el certificado 🏆</p>
            <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-black text-purple-700">Stickers ganados</span>
                <span className="text-sm font-black text-purple-500">{sessionsCompleted}/{SESSIONS_NEEDED}</span>
              </div>
              <div className="flex gap-2 justify-center">
                {Array.from({ length: SESSIONS_NEEDED }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                      i < sessionsCompleted ? "bg-yellow-200 border-yellow-300 shadow-md shadow-yellow-100" : "bg-white border-purple-100"
                    }`}
                    style={{ transform: i < sessionsCompleted ? "rotate(-4deg)" : "none" }}
                  >
                    <span className={`text-xl ${i >= sessionsCompleted ? "opacity-20" : ""}`}>{SESSION_STICKERS[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border-2 border-purple-100 shadow-[0_8px_30px_rgba(192,132,252,0.15)] p-6 mb-5">
            <p className="text-xs font-black uppercase tracking-widest text-purple-400 mb-3">Elegí tu idioma</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {LANGUAGES.map((lang) => {
                const active = selectedLang.name === lang.name;
                return (
                  <button
                    key={lang.name}
                    onClick={() => setSelectedLang(lang)}
                    className={`relative flex items-center gap-2.5 p-3 rounded-2xl border-2 transition-all duration-150 ${
                      active ? `${lang.bg} ${lang.border} shadow-md scale-104` : "bg-purple-50/60 border-transparent hover:border-purple-200"
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className={`text-sm font-black ${active ? lang.text : "text-purple-600"}`}>{lang.name}</span>
                    {active && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border-2 border-purple-300 flex items-center justify-center shadow">
                        <Check className="w-3 h-3 text-purple-600" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-black uppercase tracking-widest text-purple-400 mb-3">Elegí tu nivel</p>
            <div className="flex gap-2 mb-6">
              {LEVELS.map((lvl) => {
                const active = selectedLevel.id === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border-2 transition-all duration-150 ${
                      active ? `${lvl.bg} ${lvl.border} shadow-md scale-105` : "bg-purple-50/60 border-transparent hover:border-purple-200"
                    }`}
                  >
                    <span className="text-2xl">{lvl.emoji}</span>
                    <span className={`text-xs font-black ${active ? lvl.text : "text-purple-500"}`}>{lvl.id}</span>
                    <span className={`text-xs font-bold ${active ? lvl.text : "text-purple-300"}`}>+{lvl.xp} XP</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 rounded-2xl font-black text-base shadow-[0_6px_0px_0px] transition-all duration-100 active:translate-y-1 active:shadow-[0_2px_0px_0px] hover:-translate-y-0.5 hover:shadow-[0_8px_0px_0px] bg-purple-300 hover:bg-purple-400 shadow-purple-200 text-purple-900"
            >
              ¡Empezar sesión! 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "chat") {
    return (
      <div className="min-h-screen bg-[#FFF8F0]">
        <BlobBg />
        <PracticeSession
          language={selectedLang.name as Language}
          level={selectedLevel.id as Level}
          flag={selectedLang.flag}
          username={walletAddress}
          onCancel={() => setScreen("setup")}
          onSessionComplete={handleSessionComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] py-10" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <BlobBg />
      <div className="max-w-lg mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-purple-500 tracking-tight" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            LinguaCert 🌍
          </h1>
        </div>

        <div className="bg-white rounded-[2rem] border-2 border-purple-100 shadow-[0_8px_30px_rgba(192,132,252,0.15)] p-6 mb-4 text-center">
          <div className="flex justify-center gap-1 text-3xl mb-3 select-none">
            {["🎊", "🎉", "🥳"].map((e, i) => <span key={i} className="animate-bounce">{e}</span>)}
          </div>

          <h2 className="text-2xl font-black text-purple-700 mb-1" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {isApproved ? "¡Sesión aprobada!" : "Sesión Finalizada"}
          </h2>
          <p className="text-sm font-bold text-purple-400 mb-6">
            {selectedLang.flag} {selectedLang.name} · {selectedLevel.id}
          </p>

          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-purple-100 border-4 border-purple-200" />
              <div className="absolute inset-2 rounded-full bg-yellow-200 border-4 border-yellow-300 flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-black text-yellow-800 leading-none" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  {finalScore}
                </span>
                <span className="text-xs font-black text-yellow-600">/100</span>
              </div>
              <Star className="absolute -top-1 -right-1 w-7 h-7 text-yellow-400 fill-yellow-400" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: "Gramática", score: Math.min(100, finalScore + 3), bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
              { label: "Vocabulario", score: finalScore, bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
              { label: "Fluidez", score: Math.max(0, finalScore - 2), bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} ${item.border} border-2 rounded-2xl p-3`}>
                <div className={`text-xl font-black ${item.text}`} style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  {item.score}
                </div>
                <div className={`text-[11px] font-black ${item.text} opacity-70 mt-0.5`}>{item.label}</div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-100 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-purple-700">Stickers ganados</span>
              <span className="text-sm font-black text-purple-500">{sessionsCompleted}/{SESSIONS_NEEDED}</span>
            </div>
            <div className="flex gap-2 justify-center">
              {Array.from({ length: SESSIONS_NEEDED }).map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 ${
                    i < sessionsCompleted ? "bg-yellow-200 border-yellow-300 shadow-md" : "bg-white border-purple-100"
                  }`}
                >
                  <span className={`text-xl ${i >= sessionsCompleted ? "opacity-20" : ""}`}>{SESSION_STICKERS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isReadyForCert && (
          <Certificate
          language={selectedLang.name as Language}
          level={selectedLevel.id as Level}
          sessionsCompleted={sessionsCompleted}
          walletAddress={walletAddress}
        />
        )}

        <button
          onClick={() => setScreen("setup")}
          className="w-full py-4 mt-2 rounded-2xl font-black text-base shadow-[0_6px_0px_0px] transition-all duration-100 active:translate-y-1 active:shadow-[0_2px_0px_0px] hover:-translate-y-0.5 hover:shadow-[0_8px_0px_0px] bg-purple-300 hover:bg-purple-400 shadow-purple-200 text-purple-900 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Nueva sesión 🚀
        </button>
      </div>
    </div>
  );
}