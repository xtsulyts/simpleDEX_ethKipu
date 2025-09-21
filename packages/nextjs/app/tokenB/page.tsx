"use client";

import type { NextPage } from "next";
import { useState } from "react";
import { 
  AddressInput, 
  IntegerInput, 
  InputBase 
} from "~~/components/scaffold-eth";
import { 
  CurrencyDollarIcon, 
  ArrowRightIcon, 
  FireIcon,
  CheckBadgeIcon 
} from "@heroicons/react/24/outline";
import { 
  useScaffoldWriteContract, 
  useScaffoldReadContract 
} from "~~/hooks/scaffold-eth";
import { formatEther, parseEther } from "viem";
import { useAccount } from 'wagmi';

/**
 * Página principal para interactuar con el contrato TokenB
 * Proporciona interfaz para todas las operaciones del ERC20:
 * - Consulta de balance
 * - Transferencias
 * - Aprobaciones y transferencias delegadas
 * - Quema de tokens
 */
const TokenB: NextPage = () => {
  // Estados para formularios
  const [transferAddress, setTransferAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  
  const [approveSpender, setApproveSpender] = useState("");
  const [approveAmount, setApproveAmount] = useState<string>("");
  
  const [burnAmount, setBurnAmount] = useState<string>("");
  
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [transferFromAmount, setTransferFromAmount] = useState<string>("");

  // Hook para obtener la cuenta conectada
  const account = useAccount();

  /**
   * Hook de lectura para obtener el balance del usuario conectado
   * Usa la función balanceOf del contrato TokenB
   */
  const { data: tokenBalance, refetch: refetchBalance } = useScaffoldReadContract({
    contractName: "TokenB",
    functionName: "balanceOf",
    args: [account?.address ?? "0x"],
  });

  /**
   * Hook de lectura para obtener la asignación (allowance) aprobada
   * Útil para ver cuánto puede gastar un spender en nombre del usuario
   */
  const { data: currentAllowance, refetch: refetchAllowance } = useScaffoldReadContract({
    contractName: "TokenB",
    functionName: "allowance",
    args: [account?.address ?? "0x", approveSpender],
  });

  // Hooks para escritura (transacciones)
  const { writeContractAsync: transfer } = useScaffoldWriteContract("TokenB");
  const { writeContractAsync: approve } = useScaffoldWriteContract("TokenB");
  const { writeContractAsync: burn } = useScaffoldWriteContract("TokenB");
  const { writeContractAsync: transferFrom } = useScaffoldWriteContract("TokenB");

  /**
   * Maneja la transferencia directa de tokens
   * Usa la función transfer del contrato ERC20
   */
  const handleTransfer = async () => {
    try {
      if (!transferAddress || !transferAmount) {
        alert("Por favor completa todos los campos");
        return;
      }

      await transfer({
        functionName: "transfer",
        args: [transferAddress, parseEther(transferAmount)],
      });

      // Resetear formulario y actualizar datos
      setTransferAddress("");
      setTransferAmount("");
      await refetchBalance();
      
      alert("Transferencia exitosa!");
    } catch (error) {
      console.error("Error en transferencia:", error);
      alert("Error en la transferencia. Revisa la consola para más detalles.");
    }
  };

  /**
   * Maneja la aprobación de tokens para un spender
   * Permite a otra dirección gastar tokens en nombre del usuario
   */
  const handleApprove = async () => {
    try {
      if (!approveSpender || !approveAmount) {
        alert("Por favor completa todos los campos");
        return;
      }

      await approve({
        functionName: "approve",
        args: [approveSpender, parseEther(approveAmount)],
      });

      // Resetear formulario y actualizar allowance
      setApproveSpender("");
      setApproveAmount("");
      await refetchAllowance();
      
      alert("Aprobación exitosa!");
    } catch (error) {
      console.error("Error en aprobación:", error);
      alert("Error en la aprobación. Revisa la consola para más detalles.");
    }
  };

  /**
   * Maneja la quema (burn) de tokens
   * Reduce el supply total eliminando tokens del circulación
   */
  const handleBurn = async () => {
    try {
      if (!burnAmount) {
        alert("Por favor ingresa la cantidad a quemar");
        return;
      }

      await burn({
        functionName: "burn",
        args: [parseEther(burnAmount)],
      });

      // Resetear formulario y actualizar balance
      setBurnAmount("");
      await refetchBalance();
      
      alert("Tokens quemados exitosamente!");
    } catch (error) {
      console.error("Error quemando tokens:", error);
      alert("Error al quemar tokens. Revisa la consola para más detalles.");
    }
  };

  /**
   * Maneja transferencia desde otra dirección (transferFrom)
   * Para cuando se tiene aprobación para gastar tokens de otro usuario
   */
  const handleTransferFrom = async () => {
    try {
      if (!fromAddress || !toAddress || !transferFromAmount) {
        alert("Por favor completa todos los campos");
        return;
      }

      await transferFrom({
        functionName: "transferFrom",
        args: [fromAddress, toAddress, parseEther(transferFromAmount)],
      });

      // Resetear formulario
      setFromAddress("");
      setToAddress("");
      setTransferFromAmount("");
      
      alert("Transferencia delegada exitosa!");
    } catch (error) {
      console.error("Error en transferFrom:", error);
      alert("Error en la transferencia delegada. Revisa la consola para más detalles.");
    }
  };

  return (
    <>
      <div className="flex items-center flex-col text-center mt-8 p-10">
        
        {/* Tarjeta de Balance */}
        <div className="card bg-base-100 w-96 shadow-xl mb-6">
          <div className="card-body">
            <h1 className="text-4xl my-0">Token B (TKB)</h1>
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Tu Balance</div>
                <div className="stat-value text-primary">
                  {tokenBalance ? formatEther(tokenBalance) : "0"}
                </div>
                <div className="stat-desc">Tokens TKB</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Transferencia */}
        <div className="card bg-base-100 w-96 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">
              <ArrowRightIcon className="h-6 w-6" />
              Transferir Tokens
            </h2>
            
            <AddressInput 
              value={transferAddress}
              onChange={setTransferAddress}
              placeholder="Dirección destino"
            />
            
            <IntegerInput
              value={transferAmount}
              onChange={setTransferAmount}
              placeholder="Cantidad TKB"
            />
            
            <div className="card-actions justify-end">
              <button className="btn btn-primary w-full" onClick={handleTransfer}>
                <CurrencyDollarIcon className="h-4 w-4" />
                Transferir
              </button>
            </div>
          </div>
        </div>

        {/* Sección de Aprobación */}
        <div className="card bg-base-100 w-96 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">
              <CheckBadgeIcon className="h-6 w-6" />
              Aprobar Tokens
            </h2>
            
            <AddressInput 
              value={approveSpender}
              onChange={setApproveSpender}
              placeholder="Dirección autorizada"
            />
            
            <IntegerInput
              value={approveAmount}
              onChange={setApproveAmount}
              placeholder="Cantidad a aprobar"
            />
            
            {currentAllowance && (
              <div className="text-sm text-gray-600">
                Allowance actual: {formatEther(currentAllowance)} TKB
              </div>
            )}
            
            <div className="card-actions justify-end">
              <button className="btn btn-secondary w-full" onClick={handleApprove}>
                <CheckBadgeIcon className="h-4 w-4" />
                Aprobar
              </button>
            </div>
          </div>
        </div>

        {/* Sección de Quema */}
        <div className="card bg-base-100 w-96 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">
              <FireIcon className="h-6 w-6" />
              Quemar Tokens
            </h2>
            
            <IntegerInput
              value={burnAmount}
              onChange={setBurnAmount}
              placeholder="Cantidad a quemar"
            />
            
            <div className="card-actions justify-end">
              <button className="btn btn-error w-full" onClick={handleBurn}>
                <FireIcon className="h-4 w-4" />
                Quemar Tokens
              </button>
            </div>
          </div>
        </div>

        {/* Sección Transfer From (para spending aprobado) */}
        <div className="card bg-base-100 w-96 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">
              <ArrowRightIcon className="h-6 w-6" />
              Transferencia Delegada
            </h2>
            
            <AddressInput 
              value={fromAddress}
              onChange={setFromAddress}
              placeholder="Dirección origen (owner)"
            />
            
            <AddressInput 
              value={toAddress}
              onChange={setToAddress}
              placeholder="Dirección destino"
            />
            
            <IntegerInput
              value={transferFromAmount}
              onChange={setTransferFromAmount}
              placeholder="Cantidad TKB"
            />
            
            <div className="card-actions justify-end">
              <button className="btn btn-warning w-full" onClick={handleTransferFrom}>
                <ArrowRightIcon className="h-4 w-4" />
                Transferir From
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default TokenB;      