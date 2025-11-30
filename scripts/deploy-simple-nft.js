const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SimpleUniversalNFT to ZetaChain Testnet...\n");
  
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
  
  console.log("⏳ Deploying SimpleUniversalNFT contract...");
  const SimpleUniversalNFT = await hre.ethers.getContractFactory("SimpleUniversalNFT");
  const nft = await SimpleUniversalNFT.deploy(
    "Universal NFT Bridge",
    "UNFT"
  );
  
  await nft.waitForDeployment();
  const address = await nft.getAddress();
  
  console.log("\n✅ SimpleUniversalNFT deployed successfully!");
  console.log("📍 Contract Address:", address);
  console.log("🔍 View on Explorer: https://athens.explorer.zetachain.com/address/" + address);
  
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
