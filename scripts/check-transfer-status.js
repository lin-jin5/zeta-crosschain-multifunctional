const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking Transfer Status...\n");
  
  const contractAddress = "0x6Fde11615C80251d394586CD185bb56449d74569";
  const [signer] = await hre.ethers.getSigners();
  
  console.log("📝 Checking account:", signer.address);
  console.log("📍 Contract:", contractAddress, "\n");
  
  const contract = await hre.ethers.getContractAt("ZetaUniversalNFT", contractAddress);
  
  // Check total minted
  console.log("📊 Contract Status:");
  const totalMinted = await contract.totalMinted();
  console.log("  Total NFTs minted:", totalMinted.toString());
  
  // Check each token
  console.log("\n🎨 Checking all tokens:");
  for (let i = 0; i < totalMinted; i++) {
    try {
      const tokenInfo = await contract.getTokenInfo(i);
      console.log(`\n  Token ID ${i}:`);
      console.log(`    Owner: ${tokenInfo[0]}`);
      console.log(`    URI: ${tokenInfo[1]}`);
      console.log(`    Chain ID: ${tokenInfo[2].toString()}`);
      console.log(`    Transferred: ${tokenInfo[3]}`);
      
      if (tokenInfo[3]) {
        console.log(`    ✅ Status: TRANSFERRED (Burned on ZetaChain)`);
      } else if (tokenInfo[0] === signer.address) {
        console.log(`    ✅ Status: OWNED BY YOU`);
      } else if (tokenInfo[0] === '0x0000000000000000000000000000000000000000') {
        console.log(`    ⚠️  Status: BURNED`);
      } else {
        console.log(`    ℹ️  Status: OWNED BY SOMEONE ELSE`);
      }
      
    } catch (error) {
      console.log(`\n  Token ID ${i}: ❌ Does not exist or error`);
    }
  }
  
  // Get recent events
  console.log("\n\n📡 Recent Events:");
  console.log("=".repeat(60));
  
  try {
    // Get latest block
    const latestBlock = await hre.ethers.provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 1000); // Last ~1000 blocks
    
    // Get NFTMinted events
    const mintFilter = contract.filters.NFTMinted();
    const mintEvents = await contract.queryFilter(mintFilter, fromBlock, latestBlock);
    
    console.log("\n🎨 Mint Events:");
    for (const event of mintEvents) {
      console.log(`  Token ID: ${event.args.tokenId}`);
      console.log(`  To: ${event.args.to}`);
      console.log(`  Block: ${event.blockNumber}`);
      console.log(`  Tx: https://athens.explorer.zetachain.com/tx/${event.transactionHash}`);
      console.log();
    }
    
    // Get NFTTransferredCrossChain events
    const transferFilter = contract.filters.NFTTransferredCrossChain();
    const transferEvents = await contract.queryFilter(transferFilter, fromBlock, latestBlock);
    
    console.log("🌉 Cross-Chain Transfer Events:");
    if (transferEvents.length === 0) {
      console.log("  No cross-chain transfers found");
    } else {
      for (const event of transferEvents) {
        console.log(`  Token ID: ${event.args.tokenId}`);
        console.log(`  From: ${event.args.from}`);
        console.log(`  To: ${event.args.to}`);
        console.log(`  Destination Chain: ${event.args.destinationChain}`);
        console.log(`  Block: ${event.blockNumber}`);
        console.log(`  Tx: https://athens.explorer.zetachain.com/tx/${event.transactionHash}`);
        console.log();
      }
    }
    
  } catch (error) {
    console.log("  Error fetching events:", error.message);
  }
  
  console.log("=".repeat(60));
  console.log("\n✅ Status check complete!");
  console.log("\n💡 Transfer Status Explanation:");
  console.log("  - If 'Transferred: true' → NFT burned on ZetaChain, event emitted");
  console.log("  - If 'Transferred: false' → NFT still on ZetaChain");
  console.log("  - Cross-chain events show the destination chain");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Check failed:", error);
    process.exit(1);
  });
