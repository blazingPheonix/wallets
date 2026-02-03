"use client";

import {
  appendTransactionMessageInstructions,
  createSolanaRpc,
  createTransactionMessage,
  createKeyPairSignerFromBytes,
  getSignatureFromTransaction,
  lamports,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  address,
  createSolanaRpcSubscriptions,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import { useState } from "react";
import bs58 from "bs58";
import {toast} from 'react-toastify';

export default function SendSol({ privateKey,isMainnet }: { privateKey: string,isMainnet:boolean }) {
  console.log('private key ',privateKey);
  const [receiverAddress, setReceiverAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendSol = async () => {
    try {
      setLoading(true);
      setError(null)
      setTxSig(null);
      const url = isMainnet?process.env.NEXT_PUBLIC_MAINNET_URL:process.env.NEXT_PUBLIC_DEVNET_URL!;

      console.log("url is ",url);
      if(!url) return ;
      const rpc = createSolanaRpc(url);
      const wss_url = url.replace('https:',"wss:");
      console.log('this is wss_url',wss_url);
      const rpcSubscriptions = createSolanaRpcSubscriptions(
  wss_url
);

      // CORE LOGIC (unchanged)
      const secretKey = bs58.decode(privateKey);
      if(!secretKey) return ;
      console.log('secret key is ',secretKey);
      const sender = await createKeyPairSignerFromBytes(secretKey);

      const recipient = address(receiverAddress);

      const LAMPORTS_PER_SOL = 1_000_000_000n;
      const transferAmount = lamports(
        BigInt(Math.floor(Number(amount) * 1_000_000_000))
      );

      const transferInstruction = getTransferSolInstruction({
        source: sender,
        destination: recipient,
        amount: transferAmount,
      });

      const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

      const transactionMessage = pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayerSigner(sender, tx),
        (tx) => setTransactionMessageLifetimeUsingBlockhash(
          latestBlockhash,
          tx
        ),
        (tx) =>
          appendTransactionMessageInstructions([transferInstruction], tx)
      );

      const signedTransaction =
        await signTransactionMessageWithSigners(transactionMessage);

      await sendAndConfirmTransactionFactory({ rpc,rpcSubscriptions })(
        signedTransaction,
        { commitment: "confirmed" }
      );

      const transactionSignature =
        getSignatureFromTransaction(signedTransaction);

      setTxSig(transactionSignature);
      toast.success("transaction done ");
    } catch (err: any) {
      console.error("Send SOL error:", err);
      setError("Transaction failed");
      toast.error("transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Receiver */}
      <div>
        <label className="text-xs text-white/60">Recipient</label>
        <input
          value={receiverAddress}
          onChange={(e) => setReceiverAddress(e.target.value)}
          placeholder="Public address"
          className="w-full mt-1 px-3 py-2 rounded-xl
          bg-white/5 border border-white/10
          text-sm text-white outline-none
          focus:border-cyan-400/60"
        />
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs text-white/60">Amount (SOL)</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.01"
          type="number"
          className="w-full mt-1 px-3 py-2 rounded-xl
          bg-white/5 border border-white/10
          text-sm text-white outline-none
          focus:border-emerald-400/60"
        />
      </div>

      {/* Button */}
      <button
        onClick={sendSol}
        disabled={loading || !receiverAddress || !amount}
        className="w-full py-2.5 rounded-xl
        bg-gradient-to-r from-emerald-400 to-cyan-400
        text-black font-semibold text-sm
        shadow-[0_0_25px_rgba(52,211,153,0.6)]
        hover:scale-[1.02] transition
        disabled:opacity-40"
      >
        {loading ? "Sending..." : "Send SOL"}
      </button>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}

      {/* Success */}
      {txSig && (
        <p className="text-xs text-emerald-400 text-center break-all">
          Tx: {txSig}
        </p>
      )}
    </div>
  );
}
