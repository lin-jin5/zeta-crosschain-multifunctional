const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying UniversalNFT to Local Network...\n");
  
  // For local testing, use a mock gateway address
  const gatewayAddress = "0x0000000000000000000000000000000000000001";
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  console.log("⏳ Deploying UniversalNFT contract...");
  const UniversalNFT = await hre.ethers.getContractFactory("UniversalNFT");
  const nft = await UniversalNFT.deploy(
    gatewayAddress,
    "Universal NFT Bridge",
    "UNFT"
  );
  
  await nft.waitForDeployment();
  const address = await nft.getAddress();
  
  console.log("\n✅ UniversalNFT deployed successfully!");
  console.log("📍 Contract Address:", address);
  
  console.log("\n📝 Next Steps:");
  console.log("1. Update frontend/src/config.js:");
  console.log(`   export const CONTRACT_ADDRESS = "${address}";`);
  console.log("\n2. You can now test minting NFTs locally!");
  console.log("   (Cross-chain transfers won't work on local network)");
  
  return address;
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("\n❌ Deployment failed:", error.message);
      process.exit(1);
    });
}

module.exports = main;
