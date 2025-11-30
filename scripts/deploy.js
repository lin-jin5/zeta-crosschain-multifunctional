const hre = require("hardhat");

async function main() {
  const gatewayAddress = process.env.GATEWAY_ADDRESS || "0x6c533f7fe93fae114d0954697069df33c9b74fd7";
  
  console.log("Deploying UniversalNFTBridge...");
  
  const UniversalNFTBridge = await hre.ethers.getContractFactory("UniversalNFTBridge");
  const bridge = await UniversalNFTBridge.deploy(gatewayAddress);
  
  await bridge.waitForDeployment();
  
  const address = await bridge.getAddress();
  console.log("UniversalNFTBridge deployed to:", address);
  console.log("\nSave this address for your frontend!");
  console.log("Update frontend/src/config.js with:");
  console.log(`export const CONTRACT_ADDRESS = "${address}";`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
