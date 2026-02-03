"use client";

import { HDNodeWallet, Wallet } from "ethers";
import { mnemonicToSeedSync } from "bip39";
import { useEffect, useState } from "react";

interface EthWalletType {
  index: number;
  address: string;
  privateKey: string;
}

export default function EthWallet() {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [wallets, setWallets] = useState<EthWalletType[]>([]);
  const [walletIndex, setWalletIndex] = useState<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem("wallet_mnemonics");
    if (!stored) return;
    const words = JSON.parse(stored);
    setMnemonic(words.join(" "));
  }, []);

  useEffect(() => {
    const storedWallets = localStorage.getItem("eth_wallets");
    const storedIndex = localStorage.getItem("eth_wallet_index");

    if (storedWallets) {
      setWallets(JSON.parse(storedWallets));
    }
    if (storedIndex) {
      setWalletIndex(JSON.parse(storedIndex));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("eth_wallets", JSON.stringify(wallets));
    localStorage.setItem("eth_wallet_index", JSON.stringify(walletIndex));
  }, [wallets, walletIndex]);

  const generateWallet = () => {
    const seed = mnemonicToSeedSync(mnemonic);
    const path = `m/44'/60'/0'/0/${walletIndex}`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(path);
    const w = new Wallet(child.privateKey);

    const newWallet: EthWalletType = {
      index: walletIndex,
      address: w.address,
      privateKey: w.privateKey,
    };

    setWallets((prev) => [...prev, newWallet]);
    setWalletIndex((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div
        className="relative w-full max-w-3xl rounded-3xl
        bg-white/10 backdrop-blur-2xl
        border border-white/20
        shadow-[0_0_120px_rgba(99,102,241,0.35)]
        p-8 space-y-6"
      >
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-600/30 blur-3xl rounded-full" />

        <h1 className="text-center text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">
          Ethereum HD Wallet
        </h1>

        <button
          onClick={generateWallet}
          className="w-full rounded-xl py-2.5 font-semibold
          bg-gradient-to-r from-purple-600 to-cyan-500
          hover:scale-[1.02] transition shadow-[0_0_25px_rgba(139,92,246,0.6)]"
        >
          + Add Wallet
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.map((w) => (
            <div
              key={w.index}
              className="rounded-2xl p-4
              bg-white/5 border border-white/20
              shadow-[0_0_30px_rgba(99,102,241,0.2)]
              hover:bg-white/10 transition"
            >
              <p className="text-xs text-purple-300 mb-1">
                Wallet {w.index + 1}
              </p>

              <p className="text-[10px] uppercase tracking-widest text-white/40">
                Address
              </p>
              <p className="text-xs font-mono break-all text-emerald-400 mb-2">
                {w.address}
              </p>

              <p className="text-[10px] uppercase tracking-widest text-white/40">
                Private Key
              </p>
              <p className="text-xs font-mono break-all text-red-400">
                {w.privateKey}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
