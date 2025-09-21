"use client";

import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { 
  Address, 
  AddressInput, 
  Balance, 
  IntegerInput, 
  InputBase 
} from "~~/components/scaffold-eth";
import { 
  CurrencyDollarIcon, 
  ArrowsRightLeftIcon,
  PlusIcon,
  MinusIcon
} from "@heroicons/react/24/outline";
import { 
  useScaffoldWriteContract, 
  useScaffoldReadContract 
} from "~~/hooks/scaffold-eth";
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from "viem";

const SimpleDEX: NextPage = () => {
  // [Estados y hooks保持不变...]
  const [amountAIn, setAmountAIn] = useState<string>("");
  const [amountBIn, setAmountBIn] = useState<string>("");
  const [liquidityAmountA, setLiquidityAmountA] = useState<string>("");
  const [liquidityAmountB, setLiquidityAmountB] = useState<string>("");
  const [removeAmountA, setRemoveAmountA] = useState<string>("");
  const [removeAmountB, setRemoveAmountB] = useState<string>("");
  const [priceToken, setPriceToken] = useState<string>("");
  const [priceResult, setPriceResult] = useState<string>("");

  const { address: connectedAddress } = useAccount();

  const { data: tokenBalanceA, refetch: refetchBalanceA } = useScaffoldReadContract({
    contractName: "TokenA",
    functionName: "balanceOf",
    args: [connectedAddress ?? "0x"],
  });

  const { data: tokenBalanceB, refetch: refetchBalanceB } = useScaffoldReadContract({
    contractName: "TokenB",
    functionName: "balanceOf",
    args: [connectedAddress ?? "0x"],
  });

  const { data: reserveA, refetch: refetchReserveA } = useScaffoldReadContract({
    contractName: "SimpleDEX",
    functionName: "reserveA",
  });

  const { data: reserveB, refetch: refetchReserveB } = useScaffoldReadContract({
    contractName: "SimpleDEX",
    functionName: "reserveB",
  });

  const { writeContractAsync: swapAforB } = useScaffoldWriteContract("SimpleDEX");
  const { writeContractAsync: swapBforA } = useScaffoldWriteContract("SimpleDEX");
  const { writeContractAsync: addLiquidity } = useScaffoldWriteContract("SimpleDEX");
  const { writeContractAsync: removeLiquidity } = useScaffoldWriteContract("SimpleDEX");

  // [Funciones de handle保持不变...]
  const handleSwapAforB = async () => {
    try {
      if (!amountAIn || parseFloat(amountAIn) <= 0) {
        alert("Ingresa una cantidad válida de TokenA");
        return;
      }

      await swapAforB({
        functionName: "swapAforB",
        args: [parseEther(amountAIn)],
      });

      setAmountAIn("");
      await Promise.all([refetchBalanceA(), refetchBalanceB(), refetchReserveA(), refetchReserveB()]);
      alert("Swap realizado exitosamente!");
    } catch (error) {
      console.error("Error en swap A->B:", error);
      alert("Error en el swap. Revisa la consola para detalles.");
    }
  };

  const handleSwapBforA = async () => {
    try {
      if (!amountBIn || parseFloat(amountBIn) <= 0) {
        alert("Ingresa una cantidad válida de TokenB");
        return;
      }

      await swapBforA({
        functionName: "swapBforA",
        args: [parseEther(amountBIn)],
      });

      setAmountBIn("");
      await Promise.all([refetchBalanceA(), refetchBalanceB(), refetchReserveA(), refetchReserveB()]);
      alert("Swap realizado exitosamente!");
    } catch (error) {
      console.error("Error en swap B->A:", error);
      alert("Error en el swap. Revisa la consola para detalles.");
    }
  };

  const handleAddLiquidity = async () => {
    try {
      if (!liquidityAmountA || !liquidityAmountB || 
          parseFloat(liquidityAmountA) <= 0 || parseFloat(liquidityAmountB) <= 0) {
        alert("Ingresa cantidades válidas para ambos tokens");
        return;
      }

      await addLiquidity({
        functionName: "addLiquidity",
        args: [parseEther(liquidityAmountA), parseEther(liquidityAmountB)],
      });

      setLiquidityAmountA("");
      setLiquidityAmountB("");
      await Promise.all([refetchBalanceA(), refetchBalanceB(), refetchReserveA(), refetchReserveB()]);
      alert("Liquidez agregada exitosamente!");
    } catch (error) {
      console.error("Error agregando liquidez:", error);
      alert("Error al agregar liquidez. ¿Aprobaste los tokens?");
    }
  };

  const handleRemoveLiquidity = async () => {
    try {
      if (!removeAmountA || !removeAmountB || 
          parseFloat(removeAmountA) <= 0 || parseFloat(removeAmountB) <= 0) {
        alert("Ingresa cantidades válidas para retirar");
        return;
      }

      await removeLiquidity({
        functionName: "removeLiquidity",
        args: [parseEther(removeAmountA), parseEther(removeAmountB)],
      });

      setRemoveAmountA("");
      setRemoveAmountB("");
      await Promise.all([refetchBalanceA(), refetchBalanceB(), refetchReserveA(), refetchReserveB()]);
      alert("Liquidez removida exitosamente!");
    } catch (error) {
      console.error("Error removiendo liquidez:", error);
      alert("Error al remover liquidez. Revisa la consola para detalles.");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refetchBalanceA();
      refetchBalanceB();
      refetchReserveA();
      refetchReserveB();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* CONTENEDOR PRINCIPAL AL 80% */}
      <div className="flex items-center flex-col text-center mt-8 p-10 mx-auto w-4/5">
        <h1 className="text-4xl my-0 mb-8">SimpleDEX</h1>
        
        {/* 🔽 PRIMERA TARJETA (OCUPA ANCHO COMPLETO) */}
        <div className="card bg-base-100 w-full shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title justify-center">Información del Pool</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="stat">
                <div className="stat-title">Reserva TokenA</div>
                <div className="stat-value text-primary">
                  {reserveA ? formatEther(reserveA) : "0"}
                </div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Reserva TokenB</div>
                <div className="stat-value text-secondary">
                  {reserveB ? formatEther(reserveB) : "0"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="stat">
                <div className="stat-title">Tu Balance TokenA</div>
                <div className="stat-value">
                  {tokenBalanceA ? formatEther(tokenBalanceA) : "0"}
                </div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Tu Balance TokenB</div>
                <div className="stat-value">
                  {tokenBalanceB ? formatEther(tokenBalanceB) : "0"}
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <div className="text-sm font-semibold">
                Address: <Address address={connectedAddress} />
              </div>
              <div className="text-sm font-semibold mt-2">
                Balance ETH: <Balance address={connectedAddress} />
              </div>
            </div>
          </div>
        </div>

        {/* 🔽 SEGUNDA FILA: 2 TARJETAS (SWAPS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
          {/* Swap A -> B */}
          <div className="card bg-base-100 shadow-xl h-full">
            <div className="card-body">
              <h2 className="card-title">
                <ArrowsRightLeftIcon className="h-6 w-6" />
                Swap TokenA → TokenB
              </h2>
              
              <IntegerInput
                value={amountAIn}
                onChange={setAmountAIn}
                placeholder="Cantidad TokenA"
              />
              
              <button 
                className="btn btn-primary w-full mt-4"
                onClick={handleSwapAforB}
              >
                <ArrowsRightLeftIcon className="h-4 w-4" />
                Ejecutar Swap A→B
              </button>
            </div>
          </div>

          {/* Swap B -> A */}
          <div className="card bg-base-100 shadow-xl h-full">
            <div className="card-body">
              <h2 className="card-title">
                <ArrowsRightLeftIcon className="h-6 w-6" />
                Swap TokenB → TokenA
              </h2>
              
              <IntegerInput
                value={amountBIn}
                onChange={setAmountBIn}
                placeholder="Cantidad TokenB"
              />
              
              <button 
                className="btn btn-secondary w-full mt-4"
                onClick={handleSwapBforA}
              >
                <ArrowsRightLeftIcon className="h-4 w-4" />
                Ejecutar Swap B→A
              </button>
            </div>
          </div>
        </div>

        {/* 🔽 TERCERA FILA: 2 TARJETAS (LIQUIDEZ) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
          {/* Agregar Liquidez */}
          <div className="card bg-base-100 shadow-xl h-full">
            <div className="card-body">
              <h2 className="card-title">
                <PlusIcon className="h-6 w-6" />
                Agregar Liquidez
              </h2>
              
              <IntegerInput
                value={liquidityAmountA}
                onChange={setLiquidityAmountA}
                placeholder="TokenA a agregar"
              />
              
              <IntegerInput
                value={liquidityAmountB}
                onChange={setLiquidityAmountB}
                placeholder="TokenB a agregar"
              />
              
              <button 
                className="btn btn-success w-full mt-4"
                onClick={handleAddLiquidity}
              >
                <PlusIcon className="h-4 w-4" />
                Agregar Liquidez
              </button>
            </div>
          </div>

          {/* Remover Liquidez */}
          <div className="card bg-base-100 shadow-xl h-full">
            <div className="card-body">
              <h2 className="card-title">
                <MinusIcon className="h-6 w-6" />
                Remover Liquidez
              </h2>
              
              <IntegerInput
                value={removeAmountA}
                onChange={setRemoveAmountA}
                placeholder="TokenA a retirar"
              />
              
              <IntegerInput
                value={removeAmountB}
                onChange={setRemoveAmountB}
                placeholder="TokenB a retirar"
              />
              
              <button 
                className="btn btn-error w-full mt-4"
                onClick={handleRemoveLiquidity}
              >
                <MinusIcon className="h-4 w-4" />
                Remover Liquidez
              </button>
            </div>
          </div>
        </div>

        {/* 🔽 ÚLTIMA TARJETA (OCUPA ANCHO COMPLETO COMO LA PRIMERA) */}
        <div className="card bg-base-100 w-full shadow-xl">
          <div className="card-body">
            <h2 className="card-title justify-center">Consultar Precios</h2>
            
            <AddressInput
              value={priceToken}
              onChange={setPriceToken}
              placeholder="Dirección del token (TokenA o TokenB)"
            />
            
            <button className="btn btn-info w-full mt-4">
              <CurrencyDollarIcon className="h-4 w-4" />
              Consultar Precio
            </button>
            
            {priceResult && (
              <div className="mt-4 p-4 bg-info text-info-content rounded-lg">
                Precio: {priceResult}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default SimpleDEX;