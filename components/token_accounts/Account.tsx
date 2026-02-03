"use client";

import { Connection, GetProgramAccountsFilter, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useEffect, useMemo, useState } from "react";
import { Metaplex } from "@metaplex-foundation/js";

export default function TokenAccount({
  publicKey,
  isMainnet,
}: {
  publicKey: string;
  isMainnet: boolean;
}) {
  const [tokens, setTokens] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const rpcEndpoint = isMainnet
    ? process.env.NEXT_PUBLIC_MAINNET_URL
    : process.env.NEXT_PUBLIC_DEVNET_URL;
    console.log("rpc Endpoint",rpcEndpoint);
  if(!rpcEndpoint) return null;
  const connection = useMemo(
  () => new Connection(rpcEndpoint),
  [rpcEndpoint]
);


  const fetchBalance = async () => {
    try {
      const walletPubkey = new PublicKey(publicKey);
      
      // const walletPubkey = new PublicKey('AgBiB9AorgWcyVCiTdWvwt4UQDfFJUJgUrqib3sp88Td');

      const lamports = await connection.getBalance(walletPubkey);
      const sol = lamports / 1e9;
      setBalance(sol);
    } catch (err) {
      console.error("Error fetching balance:", err);
      setError("Failed to fetch SOL balance");
    }
  };

  useEffect(() => {
    if (!publicKey) return;

    const metaplex = Metaplex.make(connection);
    const wallet = publicKey;

    async function getTokenAccounts() {
      try {
        setError("");

        const filters: GetProgramAccountsFilter[] = [
          { dataSize: 165 },
          {
            memcmp: {
              offset: 32,
              bytes: wallet,
            },
          },
        ];

        const accounts = await connection.getParsedProgramAccounts(
          TOKEN_PROGRAM_ID,
          { filters }
        );

        await fetchBalance();
        console.log("account is ",accounts);
        const result = await Promise.all(
          accounts.map(async (acc) => {
            
            const data = acc.account.data;

          if (!("parsed" in data)) return null;

const info = data.parsed.info;
            // const info = acc.account.data.parsed.info;
            const mint = new PublicKey(info.mint);
            const amount = info.tokenAmount.uiAmount;
            console.log("this is acc",acc);
            try {
              const metadata = await metaplex.nfts().findByMint({
                mintAddress: mint,
              });

              let image = "";
              try {
                const res = await fetch(metadata.uri);
                const json = await res.json();
                image = json.image;
              } catch (imgErr) {
                console.warn("Failed to load token image:", imgErr);
              }

              return {
                mint: mint.toBase58(),
                name: metadata.name,
                symbol: metadata.symbol,
                amount,
                image,
              };
            } catch (metaErr) {
              console.warn("Metadata fetch failed for mint:", mint.toBase58());
              return {
                mint: mint.toBase58(),
                name: "Unknown",
                symbol: "N/A",
                amount,
                image: "",
              };
            }
          })
        );

        setTokens(result);
      } catch (err) {
        console.error("Error fetching token accounts:", err);
        setError("Failed to fetch token accounts");
      }
    }

    getTokenAccounts();
  }, [publicKey, isMainnet]);

  return (
    <div className="text-white w-full">
      {/* Balance */}
      <h2 className="text-sm font-semibold mb-3">
        Balance:{" "}
        <span className="text-emerald-400">{balance.toFixed(4)} SOL</span>
      </h2>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 mb-2 text-center">
          {error}
        </p>
      )}

      {/* Token List */}
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {tokens.map((token, index) => (
          <div
            key={index}
            className="flex items-center justify-between
              bg-white/5 border border-white/10 rounded-xl
              px-3 py-2 hover:bg-white/10 transition"
          >
            {/* Left */}
            <div className="flex items-center gap-3">
              {token.image ? (
                <img
                  src={token.image}
                  alt={token.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                  ?
                </div>
              )}

              <div>
                <p className="text-sm font-medium leading-none">
                  {token.name}
                </p>
                <p className="text-[10px] text-white/40">
                  {token.symbol}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="text-sm font-semibold text-emerald-400">
              {token.amount}
            </div>
          </div>
        ))}

        {tokens.length === 0 && !error && (
          <p className="text-xs text-white/40 text-center">
            No tokens found
          </p>
        )}
      </div>
    </div>
  );
}
