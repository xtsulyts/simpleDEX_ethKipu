import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys TokenA, TokenB, and SimpleDEX in a single script.
 * The addresses of TokenA and TokenB are passed to SimpleDEX during deployment.
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployAllContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying contracts with the deployer account:", deployer);

  // Deploy TokenA
  console.log("Deploying TokenA...");
  const tokenADeployment = await deploy("TokenA", {
    from: deployer,
    args: [100], // Pass constructor arguments here (e.g., initial supply)
    log: true,
    autoMine: true,
  });
  const tokenAAddress = tokenADeployment.address;
  console.log("TokenA deployed at:", tokenAAddress);

  // Deploy TokenB
  console.log("Deploying TokenB...");
  const tokenBDeployment = await deploy("TokenB", {
    from: deployer,
    args: [100], // Pass constructor arguments here (e.g., initial supply)
    log: true,
    autoMine: true,
  });
  const tokenBAddress = tokenBDeployment.address;
  console.log("TokenB deployed at:", tokenBAddress);

  // Deploy SimpleDEX, passing TokenA and TokenB addresses
  console.log("Deploying SimpleDEX...");
  const simpleDEXDeployment = await deploy("SimpleDEX", {
    from: deployer,
    args: [tokenAAddress, tokenBAddress], // Pass TokenA and TokenB addresses as constructor arguments
    log: true,
    autoMine: true,
  });
  const simpleDEXAddress = simpleDEXDeployment.address;
  console.log("SimpleDEX deployed at:", simpleDEXAddress);

  // Log all deployed contract addresses
  console.log("Deployment completed:");
  console.log("- TokenA Address:", tokenAAddress);
  console.log("- TokenB Address:", tokenBAddress);
  console.log("- SimpleDEX Address:", simpleDEXAddress);
};

export default deployAllContracts;

// Assign a tag to run this script specifically
deployAllContracts.tags = ["deployAll"];
