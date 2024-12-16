"use client";
import type { NextPage } from "next";
import { AddressInput } from "~~/components/scaffold-eth";
import { IntegerInput } from "~~/components/scaffold-eth";
import { InputBase } from "~~/components/scaffold-eth";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useAccount } from 'wagmi'
import { formatEther } from "viem";

const TokenA: NextPage = () => {
  const [address, setAddress] = useState("");
  const [amountMint, setAmountMint] = useState<string | bigint>("");
  const [atualAmount, setUrl] = useState<string>();
  const account = useAccount();

  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "TokenB",
    functionName: "balanceOf",
    args: [account?.address ?? ""],
  });

  const { writeContractAsync: mintTokens } = useScaffoldWriteContract("TokenB");

  const handleMint = async () => {
    try {
      await mintTokens({
        functionName: "approve",
        args: [address, BigInt(amountMint)],
      });
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col text-center mt-8  p-10">
        <h1 className="text-4xl my-0">Token B</h1>
        <div className="card bg-base-100 w-96 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex-col text-center">Transacction</h2>
            <label>Actual Ammount</label>
            <InputBase name="actuAlamount" disabled placeholder="Actual Amount" value={formatEther(tokenBalance || BigInt(0))} onChange={setUrl} />
            <label>Amount to Mint</label>
            <IntegerInput
              value={amountMint}
              onChange={updatedAmount => {
                setAmountMint(updatedAmount);
              }}
              placeholder="value (wei)"
            />
            <label>To address</label>
            <AddressInput onChange={setAddress} value={address} placeholder="Input your address" />
            <div className="card-actions justify-end">
              <button className="btn btn-primary w-full mt-2" onClick={() => { handleMint }}><CurrencyDollarIcon className="h-4 w-4" />Approve Now</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TokenA;
