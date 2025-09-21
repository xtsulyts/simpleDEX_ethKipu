"use client";

import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { 
  Address, 
  Balance, 
  IntegerInput 
} from "~~/components/scaffold-eth";
import { 
  ArrowsRightLeftIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { 
  useScaffoldWriteContract, 
  useScaffoldReadContract 
} from "~~/hooks/scaffold-eth";
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from "viem";

/**
 * Dirección del contrato SimpleDEX (debes reemplazarla con la dirección real)
 * Puedes obtenerla después de desplegar el contrato SimpleDEX
 */
const SIMPLE_DEX_ADDRESS = "0x..."; // ← REEMPLAZA CON TU DIRECCIÓN

/**
 * Componente principal para el Swap de tokens
 * Maneja la interfaz para intercambiar TokenA por TokenB y viceversa
 * Incluye aprobaciones necesarias y manejo de errores
 */
const SimpleDEXSwap: NextPage = () => {
  // Estados para los amounts de swap
  const [amountAIn, setAmountAIn] = useState<string>("");
  const [amountBIn, setAmountBIn] = useState<string>("");
  
  // Estados para control de UI
  const [isApprovingA, setIsApprovingA] = useState(false);
  const [isApprovingB, setIsApprovingB] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Hook para obtener la cuenta conectada
  const { address: connectedAddress } = useAccount();

  /**
   * Hook de lectura para obtener el balance de TokenA del usuario
   */
  const { data: tokenBalanceA, refetch: refetchBalanceA } = useScaffoldReadContract({
    contractName: "TokenA",
    functionName: "balanceOf",
    args: [connectedAddress ?? "0x"],
  });

  /**
   * Hook de lectura para obtener el balance de TokenB del usuario
   */
  const { data: tokenBalanceB, refetch: refetchBalanceB } = useScaffoldReadContract({
    contractName: "TokenB",
    functionName: "balanceOf",
    args: [connectedAddress ?? "0x"],
  });

  /**
   * Hook de lectura para obtener las reservas del pool
   */
  const { data: reserveA, refetch: refetchReserveA } = useScaffoldReadContract({
    contractName: "SimpleDEX",
    functionName: "reserveA",
  });

  const { data: reserveB, refetch: refetchReserveB } = useScaffoldReadContract({
    contractName: "SimpleDEX",
    functionName: "reserveB",
  });

  /**
   * Hook de lectura para obtener la asignación (allowance) de TokenA
   * Esto determina cuánto puede gastar SimpleDEX en nombre del usuario
   */
  const { data: allowanceA, refetch: refetchAllowanceA } = useScaffoldReadContract({
    contractName: "TokenA",
    functionName: "allowance",
    args: [connectedAddress ?? "0x", SIMPLE_DEX_ADDRESS],
  });

  /**
   * Hook de lectura para obtener la asignación (allowance) de TokenB
   */
  const { data: allowanceB, refetch: refetchAllowanceB } = useScaffoldReadContract({
    contractName: "TokenB",
    functionName: "allowance",
    args: [connectedAddress ?? "0x", SIMPLE_DEX_ADDRESS],
  });

  // Hooks para escritura de transacciones
  const { writeContractAsync: swapAforB } = useScaffoldWriteContract("SimpleDEX");
  const { writeContractAsync: swapBforA } = useScaffoldWriteContract("SimpleDEX");
  const { writeContractAsync: approveTokenA } = useScaffoldWriteContract("TokenA");
  const { writeContractAsync: approveTokenB } = useScaffoldWriteContract("TokenB");

  /**
   * Función para aprobar el gasto de TokenA por SimpleDEX
   * CADA USUARIO debe ejecutar esta aprobación antes de poder hacer swap
   */
  const handleApproveTokenA = async () => {
    if (!amountAIn || parseFloat(amountAIn) <= 0) {
      alert("Ingresa una cantidad válida de TokenA primero");
      return;
    }

    setIsApprovingA(true);
    try {
      const amountInWei = parseEther(amountAIn);
      
      console.log("Aprobando TokenA:", {
        amount: amountAIn,
        amountWei: amountInWei.toString(),
        spender: SIMPLE_DEX_ADDRESS
      });

      await approveTokenA({
        functionName: "approve",
        args: [SIMPLE_DEX_ADDRESS, amountInWei],
      });

      // Actualizar el allowance después de la aprobación
      await refetchAllowanceA();
      
      alert("✅ Aprobación exitosa! Ahora puedes hacer swap de TokenA");
    } catch (error: any) {
      console.error("Error en aprobación TokenA:", error);
      alert(`❌ Error en aprobación: ${error?.shortMessage || error.message}`);
    } finally {
      setIsApprovingA(false);
    }
  };

  /**
   * Función para aprobar el gasto de TokenB por SimpleDEX
   */
  const handleApproveTokenB = async () => {
    if (!amountBIn || parseFloat(amountBIn) <= 0) {
      alert("Ingresa una cantidad válida de TokenB primero");
      return;
    }

    setIsApprovingB(true);
    try {
      const amountInWei = parseEther(amountBIn);
      
      await approveTokenB({
        functionName: "approve",
        args: [SIMPLE_DEX_ADDRESS, amountInWei],
      });

      await refetchAllowanceB();
      alert("✅ Aprobación exitosa! Ahora puedes hacer swap de TokenB");
    } catch (error: any) {
      console.error("Error en aprobación TokenB:", error);
      alert(`❌ Error en aprobación: ${error?.shortMessage || error.message}`);
    } finally {
      setIsApprovingB(false);
    }
  };

  /**
   * Función para realizar swap de TokenA por TokenB
   * Solo se ejecuta si el usuario tiene suficiente allowance
   */
  const handleSwapAforB = async () => {
    if (!amountAIn || parseFloat(amountAIn) <= 0) {
      alert("Ingresa una cantidad válida de TokenA");
      return;
    }

    // Verificar si necesita aprobación primero
    const amountInWei = parseEther(amountAIn);
    const hasEnoughAllowance = allowanceA && allowanceA >= amountInWei;

    if (!hasEnoughAllowance) {
      alert("Primero debes aprobar el gasto de TokenA");
      return;
    }

    setIsSwapping(true);
    try {
      console.log("Ejecutando swap A->B:", {
        amountAIn,
        amountInWei: amountInWei.toString()
      });

      const tx = await swapAforB({
        functionName: "swapAforB",
        args: [amountInWei],
      });

      console.log("Transacción enviada:", tx);
      
      // Esperar confirmación y actualizar datos
      setAmountAIn("");
      await Promise.all([
        refetchBalanceA(),
        refetchBalanceB(),
        refetchReserveA(),
        refetchReserveB()
      ]);
      
      alert("✅ Swap realizado exitosamente!");
    } catch (error: any) {
      console.error("Error en swap A->B:", error);
      
      // Mensajes de error específicos
      if (error?.message?.includes("insufficient")) {
        alert("❌ Saldo insuficiente para realizar el swap");
      } else if (error?.message?.includes("reserve")) {
        alert("❌ Liquidez insuficiente en el pool");
      } else if (error?.message?.includes("allowance")) {
        alert("❌ Aprobación insuficiente. Aprueba más tokens.");
      } else {
        alert(`❌ Error en el swap: ${error?.shortMessage || error.message}`);
      }
    } finally {
      setIsSwapping(false);
    }
  };

  /**
   * Función para realizar swap de TokenB por TokenA
   */
  const handleSwapBforA = async () => {
    if (!amountBIn || parseFloat(amountBIn) <= 0) {
      alert("Ingresa una cantidad válida de TokenB");
      return;
    }

    const amountInWei = parseEther(amountBIn);
    const hasEnoughAllowance = allowanceB && allowanceB >= amountInWei;

    if (!hasEnoughAllowance) {
      alert("Primero debes aprobar el gasto de TokenB");
      return;
    }

    setIsSwapping(true);
    try {
      await swapBforA({
        functionName: "swapBforA",
        args: [amountInWei],
      });

      setAmountBIn("");
      await Promise.all([
        refetchBalanceA(),
        refetchBalanceB(),
        refetchReserveA(),
        refetchReserveB()
      ]);
      
      alert("✅ Swap realizado exitosamente!");
    } catch (error: any) {
      console.error("Error en swap B->A:", error);
      
      if (error?.message?.includes("insufficient")) {
        alert("❌ Saldo insuficiente para realizar el swap");
      } else if (error?.message?.includes("reserve")) {
        alert("❌ Liquidez insuficiente en el pool");
      } else {
        alert(`❌ Error en el swap: ${error?.shortMessage || error.message}`);
      }
    } finally {
      setIsSwapping(false);
    }
  };

  // Efecto para recargar datos periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      refetchBalanceA();
      refetchBalanceB();
      refetchReserveA();
      refetchReserveB();
      refetchAllowanceA();
      refetchAllowanceB();
    }, 15000); // Recargar cada 15 segundos

    return () => clearInterval(interval);
  }, []);

  /**
   * Calcula si el usuario tiene suficiente allowance para el swap
   */
  const hasEnoughAllowanceA = allowanceA && amountAIn 
    ? allowanceA >= parseEther(amountAIn)
    : false;

  const hasEnoughAllowanceB = allowanceB && amountBIn 
    ? allowanceB >= parseEther(amountBIn)
    : false;

  return (
    <div className="flex items-center flex-col text-center mt-8 p-10">
      <h1 className="text-4xl my-0 mb-8">SimpleDEX Swap</h1>
      
      {/* Panel de Información */}
      <div className="card bg-base-100 w-full max-w-2xl shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title justify-center">Información del Usuario</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="stat">
              <div className="stat-title">Balance TokenA</div>
              <div className="stat-value text-primary text-lg">
                {tokenBalanceA ? formatEther(tokenBalanceA) : "0"} TKA
              </div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Balance TokenB</div>
              <div className="stat-value text-secondary text-lg">
                {tokenBalanceB ? formatEther(tokenBalanceB) : "0"} TKB
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

      {/* Sección de Swaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        {/* Swap A -> B */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">
              <ArrowsRightLeftIcon className="h-6 w-6" />
              Swap TokenA → TokenB
            </h2>
            
            <IntegerInput
              value={amountAIn}
              onChange={setAmountAIn}
              placeholder="Cantidad TokenA"
              disabled={isSwapping}
            />
            
            {/* Información de aprobación */}
            {amountAIn && !hasEnoughAllowanceA && (
              <div className="alert alert-warning mt-2">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>Necesitas aprobar primero</span>
              </div>
            )}
            
            {amountAIn && hasEnoughAllowanceA && (
              <div className="alert alert-success mt-2">
                <CheckBadgeIcon className="h-4 w-4" />
                <span>Aprobación suficiente</span>
              </div>
            )}

            {/* Botón condicional */}
            {!hasEnoughAllowanceA ? (
              <button 
                className="btn btn-warning w-full mt-4"
                onClick={handleApproveTokenA}
                disabled={!amountAIn || isApprovingA}
              >
                {isApprovingA ? "Aprobando..." : "🔓 Aprobar TokenA"}
              </button>
            ) : (
              <button 
                className="btn btn-primary w-full mt-4"
                onClick={handleSwapAforB}
                disabled={!amountAIn || isSwapping}
              >
                {isSwapping ? "Procesando..." : "🔄 Ejecutar Swap A→B"}
              </button>
            )}
          </div>
        </div>

        {/* Swap B -> A */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">
              <ArrowsRightLeftIcon className="h-6 w-6" />
              Swap TokenB → TokenA
            </h2>
            
            <IntegerInput
              value={amountBIn}
              onChange={setAmountBIn}
              placeholder="Cantidad TokenB"
              disabled={isSwapping}
            />
            
            {/* Información de aprobación */}
            {amountBIn && !hasEnoughAllowanceB && (
              <div className="alert alert-warning mt-2">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>Necesitas aprobar primero</span>
              </div>
            )}
            
            {amountBIn && hasEnoughAllowanceB && (
              <div className="alert alert-success mt-2">
                <CheckBadgeIcon className="h-4 w-4" />
                <span>Aprobación suficiente</span>
              </div>
            )}

            {/* Botón condicional */}
            {!hasEnoughAllowanceB ? (
              <button 
                className="btn btn-warning w-full mt-4"
                onClick={handleApproveTokenB}
                disabled={!amountBIn || isApprovingB}
              >
                {isApprovingB ? "Aprobando..." : "🔓 Aprobar TokenB"}
              </button>
            ) : (
              <button 
                className="btn btn-secondary w-full mt-4"
                onClick={handleSwapBforA}
                disabled={!amountBIn || isSwapping}
              >
                {isSwapping ? "Procesando..." : "🔄 Ejecutar Swap B→A"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Información del Pool */}
      <div className="card bg-base-100 w-full max-w-2xl shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title justify-center">Estado del Pool</h2>
          
          <div className="grid grid-cols-2 gap-4">
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

          <div className="text-center mt-4 text-sm text-gray-500">
            <p>💡 Cada usuario debe aprobar el gasto antes de hacer swap</p>
            <p>La aprobación es por token y por usuario</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDEXSwap;