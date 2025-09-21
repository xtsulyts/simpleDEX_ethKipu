"use client";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { formatEther } from "viem";
import { 
  ArrowTopRightOnSquareIcon, 
  CurrencyDollarIcon, 
  ArrowsRightLeftIcon,
  WalletIcon,
  ChartBarIcon 
} from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: tokenBalanceA } = useScaffoldReadContract({
    contractName: "TokenA",
    functionName: "balanceOf",
    args: [connectedAddress ?? ""],
  });

  const { data: tokenBalanceB } = useScaffoldReadContract({
    contractName: "TokenB",
    functionName: "balanceOf",
    args: [connectedAddress ?? ""],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SimpleDEX Dashboard
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Intercambia tokens, provee liquidez y gestiona tus activos en un solo lugar
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Sidebar - Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Wallet Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <WalletIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Tu Wallet</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Dirección:</span>
                <Address address={connectedAddress} className="text-sm" />
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Balance ETH:</span>
                <Balance address={connectedAddress} className="font-semibold" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105">
                <ArrowsRightLeftIcon className="h-5 w-5 inline mr-2" />
                Ir al Swap
              </button>
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105">
                <CurrencyDollarIcon className="h-5 w-5 inline mr-2" />
                Agregar Liquidez
              </button>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="lg:col-span-2">
          {/* Token Balances Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
            <div className="flex items-center mb-6">
              <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Balance de Tokens</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Token A Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-900">Token A (TKA)</h3>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-800 mb-2">
                  {tokenBalanceA ? formatEther(tokenBalanceA) : "0"}
                </div>
                <p className="text-blue-600 text-sm">≈ $0.00 USD</p>
                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                  Gestionar Token A
                </button>
              </div>

              {/* Token B Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-900">Token B (TKB)</h3>
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">B</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-purple-800 mb-2">
                  {tokenBalanceB ? formatEther(tokenBalanceB) : "0"}
                </div>
                <p className="text-purple-600 text-sm">≈ $0.00 USD</p>
                <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                  Gestionar Token B
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">TVL Total</h3>
              <p className="text-2xl font-bold text-green-600">$0.00</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ArrowsRightLeftIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Volumen 24h</h3>
              <p className="text-2xl font-bold text-blue-600">$0.00</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comisiones</h3>
              <p className="text-2xl font-bold text-purple-600">0%</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">🎯</div>
              <p className="text-gray-500">No hay actividad reciente</p>
              <p className="text-sm text-gray-400">Realiza tu primera transacción para comenzar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-12 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Necesitas ayuda?</h3>
          <div className="flex justify-center space-x-4">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
              Documentación
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
              Soporte
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
              Tutoriales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;    