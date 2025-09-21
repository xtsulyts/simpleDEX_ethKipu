"use client";
//import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address, Balance, InputBase, IntegerInput } from "~~/components/scaffold-eth";
import { AddressInput } from "~~/components/scaffold-eth";
import { CurrencyDollarIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { formatEther } from "viem";
import TokenB from "./tokenB/page";


const Home: NextPage = () => {

  const { address: connectedAddress } = useAccount();
  //const [address, setAddress] = useState("");
  const [amountMint, setAmountMint] = useState<string | bigint>("");
  const [atualAmount, setUrl] = useState<string>();
  const account = useAccount();

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


  return (
    <div className="bg-base-300 p-6 rounded-lg max-w-md mx-auto mt-6">
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
        <InputBase  name="actuAlamount" disabled placeholder="Actual Amount" value={formatEther(tokenBalanceB || BigInt(0))} onChange={setUrl} />
      </div>
    </div>

    //Boton



  );
};


export default Home;