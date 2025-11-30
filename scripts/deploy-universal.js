const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying UniversalNFT to ZetaChain Testnet...\n");
  
  const gatewayAddress = "0x6c533f7fe93fae114d0954697069df33c9b74fd7";
  
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
  console.log("🔍 View on Explorer: https://athens.explorer.zetachain.com/address/" + address);
  
  console.log("\n📝 Next Steps:");
  console.log("1. Update frontend/src/config.js:");
  console.log(`   export const CONTRACT_ADDRESS = "${address}";`);
  console.log("\n2. Update the ABI in frontend/src/App.jsx");
  console.log("\n3. Refresh your browser and start minting NFTs! 🎉");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  });
