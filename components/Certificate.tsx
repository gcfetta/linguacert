"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI } from "@/lib/contractABI";
import { Language, Level } from "@/lib/types";
import { Trophy } from "lucide-react";
import { loadSessionRecords, computeSessionsHash } from "@/lib/progress";
import { uploadToIPFS } from "@/lib/ipfs";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Props {
  language: Language;
  level: Level;
  sessionsCompleted: number;
  walletAddress: string;
}

export default function Certificate({ language, level, sessionsCompleted, walletAddress }: Props) {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [sessionHash, setSessionHash] = useState("");
  const [ipfsCid, setIpfsCid] = useState("");
  const [error, setError] = useState("");

  async function mintCertificate() {
    setError("");
    setLoading(true);

    try {
      if (!window.ethereum) throw new Error("MetaMask no detectado.");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const sessions = loadSessionRecords(walletAddress);
      const hash = await computeSessionsHash(sessions);
      setSessionHash(hash);

      const cid = await uploadToIPFS(sessions);
      setIpfsCid(cid);

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
      if (!contractAddress) throw new Error("Contract address no configurado en .env.local");

      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      console.log(`%c⛓️ Minteando certificado para wallet: ${userAddress}`, "color: #eab308; font-weight: bold;");
      console.log(`%c📋 Session hash: ${hash}`, "color: #a855f7;");
      console.log(`%c📦 IPFS CID: ${cid}`, "color: #6366f1;");

      const tx = await contract.issueCertificate(
        language,
        level,
        sessionsCompleted,
        hash,
        cid
      );

      const receipt = await tx.wait();
      console.log("%c✅ Certificado registrado en blockchain:", "color: #10b981; font-weight: bold;", receipt);
      setTxHash(receipt.hash);
    } catch (err: any) {
      console.error("Error al mintear:", err);
      setError(err.reason || err.message || "Error al emitir el certificado.");
    }
    setLoading(false);
  }

  const etherscanUrl = "https://sepolia.etherscan.io/tx/" + txHash;
  const ipfsUrl = "https://ipfs.io/ipfs/" + ipfsCid;

  return (
    <div className="mb-4 rounded-[2rem] overflow-hidden border-4 border-yellow-300 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 p-5 shadow-xl shadow-yellow-100">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-yellow-300 border-2 border-yellow-400 flex items-center justify-center flex-shrink-0 shadow-[0_4px_0_rgba(234,179,8,0.5)]">
          <Trophy className="w-7 h-7 text-yellow-800" />
        </div>
        <div className="text-left">
          <div className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-0.5">
            NFT · Sepolia Testnet ⛓️
          </div>
          <div className="text-xl font-black text-orange-800 leading-tight" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            Certificado {language}
          </div>
          <div className="text-sm font-bold text-orange-500">
            {level} · LinguaCert 2026 · {sessionsCompleted} sesiones
          </div>
        </div>
      </div>

      {txHash ? (
        <div className="bg-emerald-100 text-emerald-900 p-4 rounded-2xl space-y-3 border-2 border-emerald-300 font-bold">
          <p className="text-center">{"🎉 ¡Certificado emitido con éxito!"}</p>

          <div className="bg-white/60 p-3 rounded-xl border border-emerald-200 space-y-2">
            <p className="font-mono text-[9px] break-all">
              <strong>{"Tx Hash: "}</strong>{txHash}
            </p>
            <p className="font-mono text-[9px] break-all">
              <strong>{"Session Hash: "}</strong>{sessionHash}
            </p>
            <p className="font-mono text-[9px] break-all">
              <strong>{"IPFS CID: "}</strong>{ipfsCid}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <a
              href={etherscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 underline hover:text-indigo-800"
            >
              {"🔎 Ver transacción en Etherscan"}
            </a>
            <a
              href={ipfsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 underline hover:text-indigo-800"
            >
              {"📦 Ver conversación completa en IPFS"}
            </a>
            <button
              onClick={() => {
                const sessions = loadSessionRecords(walletAddress);
                const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "linguacert-sessions-" + walletAddress.slice(0, 6) + ".json";
                a.click();
              }}
              className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 underline hover:text-emerald-900"
            >
              {"🛡️ Descargar prueba de sesiones (JSON)"}
            </button>
          </div>

          <p className="text-[10px] text-center text-emerald-700 font-normal leading-relaxed">
            {"El session hash en el contrato es el SHA-256 del JSON completo (con las conversaciones) subido a IPFS. Cualquiera puede bajar el contenido del CID y recalcular el hash para verificarlo."}
          </p>
        </div>
      ) : (
        <button
          onClick={mintCertificate}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-base shadow-[0_6px_0px_0px] transition-all duration-100 active:translate-y-1 active:shadow-[0_2px_0px_0px] hover:-translate-y-0.5 hover:shadow-[0_8px_0px_0px] bg-yellow-300 hover:bg-yellow-400 shadow-yellow-200 text-yellow-900"
        >
          {loading ? "Subiendo prueba y confirmando firma... ⛓️" : "⛓️ Emitir Certificado en Blockchain"}
        </button>
      )}

      {error && (
        <p className="text-red-500 text-[11px] font-bold mt-3 bg-red-50 p-3 rounded-xl border-2 border-red-200 text-center leading-relaxed">
          {error}
        </p>
      )}
    </div>
  );
}
