"use client";

import { wallets } from "@/config/WalletSupport";
import { useRouter } from "next/navigation";

export default function WalletOptions({ words }: { words: string[] }) {
  const router = useRouter();

  const handleClick = (wallet: string) => {
    const checkWords = words.every((w) => w.trim() === "");
    if (checkWords) {
      alert("empty wallet");
      return;
    }

    localStorage.setItem("wallet_mnemonics", JSON.stringify(words));

    if (wallet.toLowerCase() === "solana") {
      router.push("/solana");
    }

    if (wallet.toLowerCase() === "ethereum") {
      router.push("/eth");
    }
  };

  return (
    <div className="relative z-10 mt-6 w-full max-w-md mx-auto">
      <h2 className="text-center text-sm font-semibold text-purple-300 mb-4 tracking-wide">
        Select a Wallet
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {wallets.map((wallet, index) => (
          <button
            key={index}
            onClick={() => handleClick(wallet)}
            className="rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-sm font-medium text-white 
              backdrop-blur-md transition-all
              hover:border-purple-400 hover:bg-purple-500/10 hover:scale-[1.02]
              active:scale-95 shadow-[0_0_20px_rgba(153,69,255,0.15)]"
          >
            {wallet}
          </button>
        ))}
      </div>
    </div>
  );
}
