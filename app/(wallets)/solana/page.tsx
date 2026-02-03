"use client";

import PluginComponent from "@/components/dex/Plugin";
import TokenAccount from "@/components/token_accounts/Account";
import SendSol from "@/components/token_accounts/SendSol";
import { createSolanaRpc, Address } from "@solana/kit";
import { Keypair } from "@solana/web3.js";
import { mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { useEffect, useState } from "react";
import nacl from "tweetnacl";
import bs58 from 'bs58'
import Swap from "@/components/token_accounts/SwapToken";

interface solWalletType {
  name: string;
  privateKey: Uint8Array<ArrayBufferLike>;
  publicKey: string;
}

export default function Solana() {
  // const checkIfIndex = localStorage.getItem("solIndex");
  // let index_ = 0 ;
  // if(checkIfIndex){
  //   index_ = JSON.parse(checkIfIndex);
  // }
  const [solIndex, setSolIndex] = useState<number>(0);
  const [solWallet, setSolWallet] = useState<solWalletType[]>([]);
  const [showPrivate, setShowPrivate] = useState<Record<number, boolean>>({});
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [panelView, setPanelView] = useState<"home" | "send" | "tokens" | "swap">("home");
  const [selectedPrivateKey, setSelectedPrivateKey] = useState<string>("");
  const [isMainnet, setIsMainnet] = useState<boolean>(true);
  const [swapOpen, setSwapOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);




const [showWallets, setShowWallets] = useState<boolean>(true);
const [walletPanelOpen, setWalletPanelOpen] = useState(false);



//   useEffect(() => {
//   localStorage.setItem("solWallets", JSON.stringify(solWallet));
// }, [solWallet]);
useEffect(() => {
  if (!hydrated) return;
  localStorage.setItem("solWallets", JSON.stringify(solWallet));
}, [solWallet, hydrated]);


useEffect(() => {
  const storedIndex = localStorage.getItem("solIndex");
  if (storedIndex) {
    setSolIndex(JSON.parse(storedIndex));
  }

  const storedWallets = localStorage.getItem("solWallets");
  if (storedWallets) {
    const parsed = JSON.parse(storedWallets).map((w: any) => ({
      ...w,
      privateKey: Uint8Array.from(w.privateKey.data ?? w.privateKey),
    }));
    setSolWallet(parsed);
  }

  const storedSelected = localStorage.getItem("selectedWallet");
  if (storedSelected) {
    setSelectedWallet(storedSelected);
  }

  const storedPrivate = localStorage.getItem("selectedPrivateKey");
  if (storedPrivate) {
    setSelectedPrivateKey(storedPrivate);
  }

  setHydrated(true);
}, []);

const clearAllWallets = () => {
  if (!confirm("Are you sure you want to delete all wallets?")) return;

  setSolWallet([]);
  setSelectedWallet("");
  setSelectedPrivateKey("");
  setSolIndex(0);
  setPanelView("home");
  setWalletPanelOpen(false);

  localStorage.removeItem("solWallets");
  localStorage.removeItem("selectedWallet");
  localStorage.removeItem("selectedPrivateKey");
  localStorage.removeItem("solIndex");
};




  const handleSolWallet = () => {
    // //console.log("sol wallet created ");
    const fetchMnemonic = localStorage.getItem("wallet_mnemonics");
    if (!fetchMnemonic) {
      alert("invalid mnemonic");
      return;
    }
    const mnemonic = JSON.parse(fetchMnemonic).join(" ");

    const newSeed = mnemonicToSeedSync(mnemonic);
    const path = `m/44'/501'/${solIndex}'/0'`;
    const derivedSeed = derivePath(path, newSeed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const pubKey = Keypair.fromSecretKey(secret).publicKey.toBase58();

    const new_wallet = {
      name: Math.random().toString(),
      privateKey: secret,
      publicKey: pubKey,
    };

    setSolWallet((item) => [...item, new_wallet]);
    // localStorage.setItem("solIndex",JSON.stringify(solIndex));
    // setSolIndex((solIndex) => solIndex + 1);

    setSolIndex((prev) => {
  const next = prev + 1;
  localStorage.setItem("solIndex", JSON.stringify(next));
  return next;
});

  };

  return (
  <div className="min-h-screen relative overflow-hidden 
bg-[oklch(27.4% 0.006 286.033)]
text-white px-6 py-10">


    {/* glow */}
    <div className="absolute -top-72 -left-62 w-[500px] h-[500px] bg-emerald-600/70 blur-3xl rounded-full pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

    {/* Header */}
    <div className="max-w-5xl mx-auto mb-10 text-center relative z-10">
      <h1 className="text-4xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">
        Solana HD Wallet
      </h1>
      <div className="flex items-center gap-2">
  <span className="text-[10px] uppercase tracking-widest text-white/40">
    Network
  </span>

  <select
    value={isMainnet ? "mainnet" : "devnet"}
    onChange={(e) => setIsMainnet(e.target.value === "mainnet")}
    className="bg-white/10 backdrop-blur-md
      border border-white/20
      rounded-lg px-3 py-1
      text-xs text-white
      focus:outline-none focus:ring-2 focus:ring-cyan-400/40
      hover:bg-white/20 transition"
  >
    <option value="mainnet" className="bg-black text-white">Mainnet</option>
    <option value="devnet" className="bg-black text-white">Devnet</option>
  </select>
</div>

      <p className="text-sm text-white/50 mt-2">
        Derive and manage multiple Solana accounts
      </p>
      <button
  onClick={clearAllWallets}
  className="rounded-xl px-5 mt-2 py-2 text-sm font-medium
  bg-red-500/20 text-red-300
  border border-red-400/30
  hover:bg-red-500/40 hover:text-white
  shadow-[0_0_20px_rgba(239,68,68,0.4)]
  transition"
>
  🗑 Clear All
</button>

      {selectedWallet && (
  <button
    onClick={() => setWalletPanelOpen(true)}
    className="absolute top-0 right-0 mt-2 mr-2 
    w-30 h-10 rounded-full p-3
    bg-gradient-to-br from-purple-500 to-cyan-400
    flex items-center justify-center
    shadow-[0_0_20px_rgba(34,211,238,0.6)]
    hover:scale-110 transition cursor-pointer"
  >
    wallet
  </button>
  )}

    </div>

    {/* Main Card */}
   <div className="relative z-10 max-w-5xl mx-auto rounded-3xl 
bg-white/10 backdrop-blur-2xl 
border border-white/20
shadow-[0_0_120px_rgba(99,102,241,0.25)]
p-8 space-y-6">


      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">

        <div className="flex gap-3">
          {/* <PluginComponent /> */}

          <button
            onClick={handleSolWallet}
            className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 
            px-5 py-2 text-black text-sm font-medium 
            shadow-[0_0_25px_rgba(52,211,153,0.6)]
            hover:scale-105 transition"
          >
            + Add Wallet
          </button>
        </div>

        {/* View + Filter */}
        <div className="flex items-center gap-3">
          <select
            onChange={(e) => setShowWallets(e.target.value === "show")}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-sm text-white/70"
          >
            <option value="show">All Wallets</option>
            <option value="hide">Hide Wallets</option>
          </select>

          <div className="flex bg-black/40 rounded-lg border border-white/10 overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 text-sm ${
                viewMode === "grid" ? "bg-purple-600/40" : "text-white/50"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-sm ${
                viewMode === "list" ? "bg-purple-600/40" : "text-white/50"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Wallets */}
      {showWallets && (
        <div
          className={`grid gap-5 ${
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {solWallet.map((s, index) => {
            const privateKey = Buffer.from(s.privateKey).toString("base64");
            const isVisible = showPrivate[index];

            return (
              <div
  key={index}
 onClick={() => {
  const pk = s.publicKey;
  const sk = bs58.encode(Buffer.from(s.privateKey));

  setSelectedWallet(pk);
  setSelectedPrivateKey(sk);

  localStorage.setItem("selectedWallet", pk);
  localStorage.setItem("selectedPrivateKey", sk);
}}
  className={`group rounded-2xl p-5 
  bg-white/5 backdrop-blur-xl
  border border-white/20
  shadow-[0_0_30px_rgba(99,102,241,0.2)]
  hover:scale-[1.02] hover:bg-white/10 transition cursor-pointer
  ${selectedWallet === s.publicKey ? "ring-2 ring-cyan-400/60" : ""}`}
>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-medium text-purple-300">
                    Wallet {index + 1}
                  </h2>
                  <span className="text-[10px] text-white/40">
                    m/44'/501'/{index}'/0'
                  </span>
                </div>

                <div className="mb-3">
                  <p className=" uppercase tracking-widest text-emerald-400 font-bold text-sm">
                    Public Key
                  </p>
                  <p className="text-xs font-mono text-white/80 break-all font-bold">
                    {s.publicKey.slice(0, 6)}...{s.publicKey.slice(-6)}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <p className=" uppercase tracking-widest text-red-400 font-bold text-sm">
                      Private Key
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPrivate((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }));
                      }}
                      className="text-white/50 hover:text-white transition"
                    >
                      {isVisible ? "🙈" : "👁"}
                    </button>
                  </div>

                  <p className="text-xs font-mono text-white/60 break-all">
                    {isVisible
                      ? privateKey
                      : "••••••••••••••••••••••••••••••"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

   
  {walletPanelOpen && 
<div
  className="absolute right-6 top-[25%] -translate-y-1/2
  w-[340px] max-h-[85vh]
  rounded-2xl
  bg-white/10 backdrop-blur-2xl
  border border-white/20
  shadow-[0_0_40px_rgba(0,255,200,0.25)]
  p-4 flex flex-col"
>

  
  <div className="flex justify-between items-center mb-3">
    <h3 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
      {panelView === "home" && "Active Wallet"}
      {panelView === "send" && "Send SOL"}
      {panelView === "tokens" && "Tokens"}
    </h3>

    <button
      onClick={() => {
        setWalletPanelOpen(false);
        setPanelView("home");
      }}
      className="text-white/50 hover:text-white"
    >
      ✕
    </button>
  </div>

  
  {panelView === "home" && (
    <>
      
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-widest text-white/40">
          Public Key
        </p>
        <p className="text-xs font-mono text-white break-all">
          {selectedWallet}
        </p>
      </div>

      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setPanelView("send")}
          className="py-2 rounded-xl 
          bg-purple-500/20 hover:bg-purple-500/40 
          transition text-xs"
        >
          Send
        </button>

        <button
          onClick={() => setPanelView("tokens")}
          className="py-2 rounded-xl 
          bg-cyan-500/20 hover:bg-cyan-500/40 
          transition text-xs"
        >
          Tokens
        </button>
        <button
    onClick={() => setPanelView("swap")}
    className="py-2 rounded-xl 
    bg-emerald-500/20 hover:bg-emerald-500/40 
    transition text-xs"
  >
    Swap
  </button>
      </div>
    </>
  )}

 
  {panelView === "send" && (
    <>
      <SendSol privateKey={selectedPrivateKey} isMainnet={isMainnet}/>

      <button
        onClick={() => setPanelView("home")}
        className="mt-3 text-xs text-white/50 hover:text-white"
      >
        ← Back
      </button>
    </>
  )}

 
  {panelView === "tokens" && (
    <>
      <TokenAccount publicKey={selectedWallet} isMainnet={isMainnet} />

      <button
        onClick={() => setPanelView("home")}
        className="mt-3 text-xs text-white/50 hover:text-white"
      >
        ← Back
      </button>
    </>
  )}
 
{panelView === "swap" && (
  <>
    <Swap
      privateKey={selectedPrivateKey}
      publicKey={selectedWallet}
    />

    <button
      onClick={() => setPanelView("home")}
      className="mt-3 text-xs text-white/50 hover:text-white"
    >
      ← Back
    </button>
  </>
)}

  {/* footer */}
  <p className="mt-4 text-[10px] text-white/30 text-center">
    Wallet Actions
  </p>
</div>

}
  </div>
  
);
}
