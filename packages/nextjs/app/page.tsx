"use client";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
// import { abiA } from "./AbiTokenA.json"
// import { abiB } from "./AbiTokenB.json"
// import { abiD } from "./AbiSimpleDEX.json"
// import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();



  return (
    <div>
      <p>holaaaa</p>
    </div>
  )

}

export default Home;