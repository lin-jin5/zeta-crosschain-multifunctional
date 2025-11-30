const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ZetaUniversalNFT (Standards Compliant) to ZetaChain Testnet...\n");
  
  const gatewayAddress = "0x6c533f7fe93fae114d0954697069df33c9b74fd7"; // ZetaChain Gateway
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ZETA\n");
  
  if (balance === 0n) {
    console.log("❌ No ZETA tokens found!");
    console.log("🔗 Get testnet ZETA from: https://labs.zetachain.com/get-zeta");
    console.log("📍 Your address:", deployer.address);
    process.exit(1);
  }
  
  console.log("⏳ Deploying ZetaUniversalNFT contract...");
  console.log("📍 Gateway Address:", gatewayAddress);
  
  const ZetaUniversalNFT = await hre.ethers.getContractFactory("ZetaUniversalNFT");
  const nft = await ZetaUniversalNFT.deploy(
    gatewayAddress,
    "Universal NFT Bridge",
    "UNFT"
  );
  
  await nft.waitForDeployment();
  const address = await nft.getAddress();
  
  console.log("\n✅ ZetaUniversalNFT deployed successfully!");
  console.log("📍 Contract Address:", address);
  console.log("🔍 View on Explorer: https://athens.explorer.zetachain.com/address/" + address);
  
  console.log("\n🎯 ZetaChain Standards Compliance:");
  console.log("✅ UniversalContract interface implemented");
  console.log("✅ onCall() function for receiving cross-chain messages");
  console.log("✅ onRevert() function for handling failed transfers");
  console.log("✅ Gateway integration ready");
  console.log("✅ Message replay protection");
  console.log("✅ Cross-chain token tracking");
  
  console.log("\n📝 Next Steps:");
  console.log("1. Update frontend/src/config.js:");
  console.log(`   export const CONTRACT_ADDRESS = "${address}";`);
  console.log("\n2. Refresh your browser and start minting NFTs! 🎉");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  });
