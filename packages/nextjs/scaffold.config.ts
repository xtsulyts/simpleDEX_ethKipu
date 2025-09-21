import * as chains from "viem/chains";

/**
 * Tipo de configuración para Scaffold-ETH que define la estructura
 * de la configuración de la aplicación DApp
 */
export type ScaffoldConfig = {
  /** Redes blockchain objetivo donde la DApp está activa */
  targetNetworks: readonly chains.Chain[];
  /** Intervalo de sondeo (polling) para actualizar datos de la blockchain */
  pollingInterval: number;
  /** Clave API de Alchemy para servicios de nodos */
  alchemyApiKey: string;
  /** ID de proyecto de WalletConnect para conexión de wallets */
  walletConnectProjectId: string;
  /** Si solo mostrar la Burner Wallet en red local */
  onlyLocalBurnerWallet: boolean;
};

/**
 * Clave API por defecto de Alchemy para desarrollo
 * ⚠️ ADVERTENCIA: Para producción, usa tu propia API key
 */
export const DEFAULT_ALCHEMY_API_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

/**
 * Configuración principal de Scaffold-ETH para la DApp
 * Esta configuración controla el comportamiento de la aplicación
 * y su conexión con las redes blockchain
 */
const scaffoldConfig = {
  /**
   * Redes blockchain donde la DApp está desplegada y es funcional
   * Actualmente configurada para usar solo la testnet Sepolia de Ethereum
   * Para desarrollo local, agregar: chains.hardhat o chains.localhost
   */
  targetNetworks: [chains.sepolia],

  /**
   * Intervalo en milisegundos para el sondeo de datos de la blockchain
   * - 30000 = 30 segundos
   * - No tiene efecto si solo se usa red local
   * - Para actualizaciones más frecuentes, reducir este valor
   */
  pollingInterval: 30000,

  /**
   * Clave API de Alchemy para acceder a servicios de nodos blockchain
   * 📝 Recomendado: Almacenar en variable de entorno:
   * - .env.local para desarrollo local
   * - Configuración de Vercel/entorno para producción
   * - Obtener una clave en: https://dashboard.alchemyapi.io
   */
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  /**
   * ID de proyecto de WalletConnect para conexión de carteras móviles
   * 📝 Recomendado: Almacenar en variable de entorno
   * - Crear proyecto en: https://cloud.walletconnect.com
   * - Usar diferentes IDs para desarrollo y producción
   */
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  /**
   * Controla la visualización de la Burner Wallet (billetera temporal)
   * - true: Solo mostrar en red local (Hardhat)
   * - false: Mostrar en todas las redes
   * La Burner Wallet es útil para desarrollo pero no para producción
   */
  onlyLocalBurnerWallet: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;