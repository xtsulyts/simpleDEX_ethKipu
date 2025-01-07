"use client";
import type { NextPage } from "next";
import { Address, AddressInput, Balance } from "~~/components/scaffold-eth";
import { IntegerInput } from "~~/components/scaffold-eth";
import { InputBase } from "~~/components/scaffold-eth";

import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useAccount } from 'wagmi'
import { formatEther } from "viem";

const SimpleDEX: NextPage = () => {

  const { address: connectedAddress } = useAccount();
  const [address, setAddress] = useState("");
  const [atualAmount, setUrl] = useState<string>();
  const account = useAccount();
  const [_amountAIn, set_anmountAIn] = useState<string | bigint>("");
  const [_amountBIn, set_amountBIn] = useState<string | bigint>("");


  const { data: tokenBalanceA } = useScaffoldReadContract({
    contractName: "TokenA",
    functionName: "balanceOf",
    args: [account?.address ?? ""],
  });

  const { data: tokenBalanceB } = useScaffoldReadContract({
    contractName: "TokenB",
    functionName: "balanceOf",
    args: [account?.address ?? ""],
  });



  const { data: _amountA } = useScaffoldReadContract({
    contractName: "SimpleDEX",
    functionName: "reserveA",

  });
  const { data: _amountB } = useScaffoldReadContract({
    contractName: "SimpleDEX",
    functionName: "reserveB",

  });

  const { writeContractAsync: swapAforB } = useScaffoldWriteContract("SimpleDEX");

  const swapAxB = async () => {
    try {
      await swapAforB({
        functionName: "swapAforB",
        args: [_amountA],
      });
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };

  const { writeContractAsync: swapBforA } = useScaffoldWriteContract("SimpleDEX");

  const swapBxA = async () => {
    try {
      await swapBforA({
        functionName: "swapAforB",
        args: [_amountB],
      });
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };
  return (
    <>
      <div className="bg-base-300 p-6 rounded-lg max-w-md mx-auto mt-6">
      <h1 className="text-4xl my-0">ESTO ESTA   QUE EXPLOTAAAAAA</h1>
      </div>

      <div className="flex items-center flex-col text-center mt-8  p-10">
        <h1 className="text-4xl my-0">SimpleDEX</h1>
        <div className="card bg-base-100 w-96 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex-col text-center">Transacction</h2>
            <label>Reserve A</label>
            <InputBase name="actuAlamount" disabled placeholder="Actual Amount" value={formatEther(_amountA || BigInt(0))} onChange={setUrl} />
            <label>Reserve B</label>
            <InputBase name="actuAlamount" disabled placeholder="Actual Amount" value={formatEther(_amountB || BigInt(0))} onChange={setUrl} />
            <label>Swap A x B</label>
            <InputBase name="actuAlamount" placeholder="Ingrese Tokens A" value={_amountAIn} onChange={set_anmountAIn} />
            <label>Swap B x A</label>
            <InputBase name="actuAlamount" placeholder="Ingrese Tokens B" value={_amountBIn} onChange={set_amountBIn} />
            <div className="card-actions justify-end">
              <button className="btn btn-primary w-full mt-2" onClick={() => { swapAxB }}><CurrencyDollarIcon className="h-4 w-4" />Swap</button>
            </div>
            <h2 className="text-lg font-bold mb-2">Your Ethereum Balance</h2>

            <div className="text-sm font-semibold mb-2">
              Address: <Address address={connectedAddress} />
            </div>

            <div className="text-sm font-semibold">
              Balance ETH: <Balance address={connectedAddress} />
            </div>

            <div className="text-sm font-semibold">
              <label>Actual Ammount TKA</label>
              <InputBase name="actuAlamount" disabled placeholder="Actual Amount" value={formatEther(tokenBalanceA || BigInt(0))} onChange={setUrl} />
            </div>

            <div className="text-sm font-semibold">
              <label>Actual Ammount TKB</label>
              <InputBase name="actuAlamount" disabled placeholder="Actual Amount" value={formatEther(tokenBalanceB || BigInt(0))} onChange={setUrl} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SimpleDEX;
