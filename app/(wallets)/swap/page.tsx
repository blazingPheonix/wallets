// "use client";

// import { TOKEN_ADDRESS } from "@/config/WalletSupport";
// import { useState } from "react";

// export default function Swap() {
//     const [amount,setAmount] = useState<string>();
//     const handleClick = async() => {
//         const curr_amount = Number(amount);
//         const orderResponse = await (
//   await fetch(
//     'https://api.jup.ag/ultra/v1/order' +
//     '?inputMint=So11111111111111111111111111111111111111112' +
//     '&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' +
//     `&amount=${curr_amount*1e9}` +
//     '&taker=BdyAHBjopiicPzesrPda6GYCoSokZf31LAyXuY7PzQpS',
//     {
//       headers: {
//         'x-api-key': '82644fb1-7ae0-47e7-aea4-ee2887d839b9',
//       },
//     }
//   )
// ).json();
//     }

//     return <div>
//         <div>
//             <input type="number" placeholder="enter amount" className="bg-white text-black p-3" onChange={(e)=>setAmount(e.target.value)}></input>
//             <button onClick={handleClick}>start</button>
//         </div>
//     </div>
// }

"use client";

import { useEffect, useState } from "react";
import bs58 from 'bs58';
import { Keypair, VersionedTransaction } from "@solana/web3.js";



const TOKENS = [
  { symbol: "SOL", mint: "So11111111111111111111111111111111111111112", decimals: 9 },
  { symbol: "USDC", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
  { symbol: "USDT", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6 },
];

export default function Swap({privateKey}:{privateKey:string}) {
  const [sellToken, setSellToken] = useState(TOKENS[0]);
  const [buyToken, setBuyToken] = useState(TOKENS[1]);
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Prevent same token in both dropdowns
  const handleSellTokenChange = (symbol: string) => {
    const newSell = TOKENS.find(t => t.symbol === symbol)!;
    setSellToken(newSell);

    if (newSell.symbol === buyToken.symbol) {
      const fallback = TOKENS.find(t => t.symbol !== symbol)!;
      setBuyToken(fallback);
    }
  };

  const handleBuyTokenChange = (symbol: string) => {
    const newBuy = TOKENS.find(t => t.symbol === symbol)!;
    setBuyToken(newBuy);

    if (newBuy.symbol === sellToken.symbol) {
      const fallback = TOKENS.find(t => t.symbol !== symbol)!;
      setSellToken(fallback);
    }
  };

  // Debounced quote fetch
  useEffect(() => {
    if (!sellAmount || Number(sellAmount) <= 0) {
      setBuyAmount("");
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const lamports = Number(sellAmount) * 10 ** sellToken.decimals;

        const res = await fetch(
          `https://api.jup.ag/ultra/v1/order?inputMint=${sellToken.mint}&outputMint=${buyToken.mint}&amount=${lamports}&taker=BdyAHBjopiicPzesrPda6GYCoSokZf31LAyXuY7PzQpS`,
          {
            headers: {
              "x-api-key": "82644fb1-7ae0-47e7-aea4-ee2887d839b9",
            },
          }
        );

        const data = await res.json();

        if (data?.outAmount) {
          const out =
            Number(data.outAmount) / 10 ** buyToken.decimals;
          setBuyAmount(out.toFixed(6));
        }
      } catch (err) {
        console.error(err);
        setBuyAmount("");
      } finally {
        setLoading(false);
      }
    }, 500); // ⏱ debounce delay


    return () => clearTimeout(timeout);
  }, [sellAmount, sellToken, buyToken]);

  const swapToken = async() => {
    console.log('inside swap token ',sellToken);
    try{
    setLoading(true);

    const lamports = Number(sellAmount) * 10 ** sellToken.decimals;
    const res = await fetch(
          `https://api.jup.ag/ultra/v1/order?inputMint=${sellToken.mint}&outputMint=${buyToken.mint}&amount=${lamports}&taker=BdyAHBjopiicPzesrPda6GYCoSokZf31LAyXuY7PzQpS`,
          {
            headers: {
              "x-api-key": "82644fb1-7ae0-47e7-aea4-ee2887d839b9",
            },
          }
        );

        const data = await res.json();
        console.log("swap order data ",data);
        if(!privateKey) return ; 
        const wallet = Keypair.fromSecretKey(bs58.decode(privateKey));

        const transactionBase64 = data.transaction;
        if(!transactionBase64 || transactionBase64.length<=0) return ;
        const transaction = VersionedTransaction.deserialize(Buffer.from(transactionBase64,'base64'));
        transaction.sign([wallet]);
        const signedTransaction = Buffer.from(transaction.serialize()).toString('base64');

        //executing the order finaaalllyyyyyyyyyy

                const executeResponse = await (
            await fetch('https://api.jup.ag/ultra/v1/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': '82644fb1-7ae0-47e7-aea4-ee2887d839b9',
                },
                body: JSON.stringify({
                    signedTransaction: signedTransaction,
                    requestId: data.requestId,
                }),
            })
        ).json();
    }catch(error){
        console.error(error);
    }finally{
        setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-slate-900">
      <div className="bg-slate-800 p-6 rounded-2xl w-[360px] shadow-xl">
        <h2 className="text-white text-xl font-bold mb-4">Swap</h2>

        {/* SELL */}
        <div className="bg-slate-700 p-3 rounded-xl mb-3">
          <label className="text-gray-400 text-sm">You sell</label>
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              placeholder="0.0"
              className="flex-1 bg-transparent text-white outline-none text-lg"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
            />

            <select
              className="bg-slate-600 text-white rounded-lg px-2"
              value={sellToken.symbol}
              onChange={(e) => handleSellTokenChange(e.target.value)}
            >
              {TOKENS.filter(t => t.symbol !== buyToken.symbol).map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* BUY */}
        <div className="bg-slate-700 p-3 rounded-xl mb-4">
          <label className="text-gray-400 text-sm">You buy</label>
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              placeholder="0.0"
              className="flex-1 bg-transparent text-white outline-none text-lg"
              value={buyAmount}
              readOnly
            />

            <select
              className="bg-slate-600 text-white rounded-lg px-2"
              value={buyToken.symbol}
              onChange={(e) => handleBuyTokenChange(e.target.value)}
            >
              {TOKENS.filter(t => t.symbol !== sellToken.symbol).map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          disabled={!loading}
          className="w-fit mb-4 bg-blue-400 hover:bg-purple-700 disabled:opacity-0 text-white py-1 px-2 rounded-xl font-semibold transition"
        >
          {loading ? "Fetching price..." : ""}
        </button>
              <br />
        <button className="bg-emerald-600 outine p-2 font-bold text-white/70 rounded-sm hover:cursor-pointer" onClick={swapToken}>Swap Token </button>
      </div>
    </div>
  );
}


