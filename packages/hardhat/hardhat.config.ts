import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import { task } from "hardhat/config";
import generateTsAbis from "./scripts/generateTsAbis";

// =============================================================================
// CONFIGURACIÓN DE CLAVES API Y LLAVES PRIVADAS
// =============================================================================

/**
 * Clave API de Alchemy para conectar a nodos de blockchain.
 * Por defecto usa una clave pública de demostración (puede tener limitaciones).
 * Obtén tu propia clave en: https://dashboard.alchemyapi.io
 */
const providerApiKey = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

/**
 * Llave privada de la cuenta deployer para desplegar contratos.
 * Por defecto usa la primera cuenta de Hardhat (solo para desarrollo local).
 * Para producción: Usa variable de entorno DEPLOYER_PRIVATE_KEY
 * Para generar: `yarn generate` o importar con `yarn account:import`
 */
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

/**
 * Claves API para verificación de contratos en exploradores de bloque.
 * - etherscanApiKey: Para Ethereum Mainnet y Sepolia
 * - etherscanOptimisticApiKey: Para redes Optimism
 * - basescanApiKey: Para redes Base
 */
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";
const etherscanOptimisticApiKey = process.env.ETHERSCAN_OPTIMISTIC_API_KEY || "RM62RDISS1RH448ZY379NX625ASG1N633R";
const basescanApiKey = process.env.BASESCAN_API_KEY || "ZZZEIPMT1MNJ8526VV2Y744CA7TNZR64G6";

// =============================================================================
// CONFIGURACIÓN PRINCIPAL DE HARDHAT
// =============================================================================

const config: HardhatUserConfig = {
  /**
   * Configuración del compilador de Solidity
   * - Versión 0.8.20 con optimizador habilitado para reducir costos de gas
   * - 200 runs: Balance entre tamaño de bytecode y optimización
   */
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },

  /**
   * Red por defecto para comandos de Hardhat
   * ⚠️  REDUNDANTE: Hardhat ya usa 'hardhat' como red por defecto
   * ✅ RECOMENDADO: Cambiar a "sepolia" o usar --network sepolia en comandos
   */
  defaultNetwork: "localhost",

  /**
   * Configuración de cuentas con nombre para despliegues
   * - deployer: Usa la primera cuenta de Hardhat (índice 0) por defecto
   */
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },

  /**
   * Configuración de redes blockchain disponibles
   * Sepolia está configurada correctamente para despliegue
   */
  networks: {
    // Red local de desarrollo Hardhat
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },

    // Redes principales (Ethereum, Arbitrum, Optimism, Polygon, etc.)
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },

    // 🔽 RED SEPOLIA (TU RED DE DESPLIEGUE) - CONFIGURADA CORRECTAMENTE
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },

    // Otras redes de prueba (redundantes si solo usas Sepolia)
    arbitrumSepolia: {
      url: `https://arb-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    optimismSepolia: {
      url: `https://opt-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia-optimistic.etherscan.io",
          apiKey: etherscanOptimisticApiKey,
        },
      },
    },
    polygonMumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },

  },

  /**
   * Configuración para verificación de contratos en Etherscan
   * ⚠️  REDUNDANTE: La configuración de verify ya está duplicada abajo
   */
  etherscan: {
    apiKey: `${etherscanApiKey}`,
  },

  /**
   * Configuración para hardhat-deploy verification
   * ✅ Suficiente con esta configuración
   */
  verify: {
    etherscan: {
      apiKey: `${etherscanApiKey}`,
    },
  },

  /**
   * Verificación via Sourcify (deshabilitada)
   */
  sourcify: {
    enabled: false,
  },
};

// =============================================================================
// TAREA PERSONALIZADA PARA DEPLOY
// =============================================================================

/**
 * Tarea personalizada que extiende el comando `hardhat deploy`
 * - Ejecuta el deploy normal
 * - Genera automáticamente los ABIs en TypeScript
 */
task("deploy").setAction(async (args, hre, runSuper) => {
  // Ejecutar el deploy original
  await runSuper(args);
  // Generar ABIs después del deploy
  await generateTsAbis(hre);
});

export default config;