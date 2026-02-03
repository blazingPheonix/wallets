"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as bip39 from "bip39";
import { toast } from "react-toastify";
import CryptoLoader from "@/components/hero_components/CryptoLoader";
import WalletOptions from "@/components/models/WalletOptions";
import CryptoScene from "@/components/CryptoScene";

export default function Home() {
  const [words, setWords] = useState<string[]>(Array(12).fill(""));
  const [loading, setLoading] = useState(false);
  const [walletSelection, setWalletSelection] = useState(false);

  const isComplete = words.every((w) => w.trim() !== "");

  useEffect(() => {
    document.body.style.overflow = walletSelection ? "hidden" : "auto";
  }, [walletSelection]);

  const generateMnemonic = async () => {
    setLoading(true);
    setWords(Array(12).fill(""));
    await new Promise((r) => setTimeout(r, 1500));
    const mnemonic = bip39.generateMnemonic().split(" ");
    setWords(mnemonic);
    setLoading(false);
  };

  const handleWordChange = (value: string, index: number) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black/10 text-white">
      <CryptoScene />

      {/* overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70 z-0" />

      {/* UI */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-4"
      >
        {/* CARD */}
        <div
          className="relative w-full max-w-md rounded-3xl 
          bg-gradient-to-br from-purple-900/40 via-black/50 to-black/70
          backdrop-blur-2xl border border-purple-500/20
          shadow-[0_0_120px_rgba(168,85,247,0.35)]
          p-8 space-y-6 overflow-hidden"
        >
          {/* glow blobs */}
          <div className="absolute pointer-events-none -top-24 -left-24 w-72 h-72 bg-purple-600/30 blur-3xl rounded-full" />
          <div className="absolute pointer-events-none -bottom-24 -right-24 w-72 h-72 bg-pink-600/30 blur-3xl rounded-full" />

          <h1 className="text-center text-xl font-semibold tracking-wide text-purple-300 relative">
            Create or Import Wallet
          </h1>

          <p className="text-center text-xs text-white/50 relative">
            Securely store your 12-word recovery phrase.
          </p>

          {/* MNEMONIC GRID */}
         <div className="grid grid-cols-3 gap-3 relative">
  {words.map((word, i) => (
    <input
      key={i}
      value={word}
      onChange={(e) => handleWordChange(e.target.value, i)}
      onPaste={(e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text");
        const pastedWords = paste.trim().split(/\s+/);

        const newWords = [...words];
        for (let j = 0; j < 12; j++) {
          newWords[j] = pastedWords[j] || "";
        }
        setWords(newWords);
      }}
      placeholder={`${i + 1}`}
      className="h-11 rounded-lg bg-purple-500/20 border border-white/10
      text-center text-sm font-mono text-white
      outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40"
    />
  ))}
</div>

          {/* BUTTON */}
          <button
            onClick={generateMnemonic}
            className="w-full rounded-xl py-2.5 font-semibold text-white
            bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600
            shadow-[0_0_30px_rgba(217,70,239,0.6)]
            transition hover:scale-[1.02] active:scale-95"
          >
            Generate Seed Phrase
          </button>

          <div className="flex gap-3">
            <button
              disabled={!isComplete}
              onClick={() => {
                navigator.clipboard.writeText(words.join(" "));
                toast.success("Seed phrase copied");
              }}
              className="w-full rounded-xl py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30"
            >
              Copy
            </button>

            <button
          onClick={() => {
            setWords(Array(12).fill(""));
          }}
  className="w-full rounded-xl py-2 bg-red-500/80 hover:bg-red-500 hover:cursor-pointer"
>
  Clear
</button>


          </div>

          <AnimatePresence>
            {loading && (
              <motion.div className="flex justify-center">
                <CryptoLoader />
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-white/40 relative">
            Never share your recovery phrase with anyone.
          </p>
        </div>

        {isComplete && (
          <button
            onClick={() => setWalletSelection(true)}
            className="bg-purple-700/80 px-6 py-2 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:scale-105 transition"
          >
            Next
          </button>
        )}

        {/* MODAL */}
        <AnimatePresence>
          {walletSelection && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                onClick={() => setWalletSelection(false)}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative z-10 w-full max-w-md rounded-2xl
                bg-gradient-to-br from-purple-900/80 to-black
                border border-purple-500/20 p-8 shadow-[0_0_80px_rgba(168,85,247,0.5)]"
              >
                <WalletOptions words={words} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}


const SelectWallet = ({ mnemonic }: { mnemonic: string[] }) => {
  if (!mnemonic || mnemonic.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* BACKDROP */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

        {/* MODAL */}
        <motion.div
          initial={{ scale: 0.9, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          className="relative z-10 w-full max-w-md rounded-2xl
                     bg-gradient-to-br from-purple-900/80 to-black
                     border border-purple-500/20
                     shadow-[0_0_80px_rgba(168,85,247,0.4)]
                     p-8"
        >
          <WalletOptions words={mnemonic} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
