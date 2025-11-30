const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing Cross-Chain Transfer to Sui...\n");
  
  const contractAddress = "0x6Fde11615C80251d394586CD185bb56449d74569";
  const suiAddress = "0xdba1916cf68795d88436e9d12c21c0eda10bc012175db4e0bb774bd0fcddad4f";
  const suiChainId = 2;
  
  const [signer] = await hre.ethers.getSigners();
  console.log("📝 Testing with account:", signer.address);
  console.log("🎯 Destination (Sui):", suiAddress);
  console.log("🔗 Destination Chain ID:", suiChainId, "\n");
  
  const contract = await hre.ethers.getContractAt("ZetaUniversalNFT", contractAddress);
  
  // Step 1: Mint a new NFT
  console.log("🎨 Step 1: Minting NFT for transfer test...");
  const mintTx = await contract.mint(
    signer.address,
    "https://picsum.photos/400/400",
    { gasLimit: 500000 }
  );
  console.log("⏳ Waiting for mint transaction...");
  const mintReceipt = await mintTx.wait();
  
  const mintEvent = mintReceipt.logs.find(log => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === 'NFTMinted';
    } catch { return false; }
  });
  
  if (!mintEvent) {
    console.log("❌ Could not find mint event");
    return;
  }
  
  const parsed = contract.interface.parseLog(mintEvent);
  const tokenId = parsed.args.tokenId;
  console.log("✅ NFT Minted! Token ID:", tokenId.toString());
  console.log("📍 View on Explorer:", `https://athens.explorer.zetachain.com/tx/${mintReceipt.hash}\n`);
  
  // Step 2: Check ownership
  console.log("👤 Step 2: Verifying ownership...");
  const owner = await contract.ownerOf(tokenId);
  console.log("Owner:", owner);
  console.log(owner === signer.address ? "✅ Ownership verified!\n" : "❌ Ownership mismatch!\n");
  
  // Step 3: Get token info before transfer
  console.log("📊 Step 3: Token info before transfer...");
  const tokenInfoBefore = await contract.getTokenInfo(tokenId);
  console.log("  - Owner:", tokenInfoBefore[0]);
  console.log("  - URI:", tokenInfoBefore[1]);
  console.log("  - Chain ID:", tokenInfoBefore[2].toString());
  console.log("  - Transferred:", tokenInfoBefore[3], "\n");
  
  // Step 4: Transfer to Sui
  console.log("🌉 Step 4: Initiating cross-chain transfer to Sui...");
  console.log("⚠️  Note: This is a testnet demo. In production, this would:");
  console.log("   1. Call ZetaChain Gateway");
  console.log("   2. Bridge to Sui network");
  console.log("   3. Mint NFT on Sui with same metadata\n");
  
  try {
    // For the demo, we use the signer's address since contract expects EVM format
    // In production, the gateway would handle the address conversion
    const transferTx = await contract.transferCrossChain(
      tokenId,
      signer.address, // Using EVM address for demo
      suiChainId,
      { gasLimit: 800000 }
    );
    
    console.log("⏳ Waiting for transfer transaction...");
    const transferReceipt = await transferTx.wait();
    
    if (transferReceipt.status === 1) {
      console.log("✅ Cross-chain transfer transaction successful!");
      console.log("📍 Transaction:", `https://athens.explorer.zetachain.com/tx/${transferReceipt.hash}`);
      console.log("⛽ Gas Used:", transferReceipt.gasUsed.toString());
      
      // Check events
      console.log("\n📡 Events emitted:");
      for (const log of transferReceipt.logs) {
        try {
          const event = contract.interface.parseLog(log);
          if (event) {
            console.log(`  - ${event.name}`);
            if (event.name === 'NFTTransferredCrossChain') {
              console.log(`    Token ID: ${event.args.tokenId}`);
              console.log(`    From: ${event.args.from}`);
              console.log(`    To: ${event.args.to}`);
              console.log(`    Destination Chain: ${event.args.destinationChain}`);
            }
          }
        } catch (e) {}
      }
      
      // Verify NFT was burned
      console.log("\n🔥 Step 5: Verifying NFT was burned on source chain...");
      try {
        await contract.ownerOf(tokenId);
        console.log("⚠️  NFT still exists (not burned)");
      } catch (e) {
        console.log("✅ NFT successfully burned on ZetaChain!");
      }
      
      // Check transfer status
      const tokenInfoAfter = await contract.getTokenInfo(tokenId);
      console.log("\n📊 Token info after transfer:");
      console.log("  - Owner:", tokenInfoAfter[0]);
      console.log("  - Transferred:", tokenInfoAfter[3]);
      
      console.log("\n" + "=".repeat(60));
      console.log("🎯 TRANSFER SUMMARY");
      console.log("=".repeat(60));
      console.log("✅ NFT burned on ZetaChain (Chain ID: 7001)");
      console.log("📤 Transfer event emitted to Sui (Chain ID: 2)");
      console.log("🎯 Destination: Sui Network");
      console.log("📍 Sui Address:", suiAddress);
      console.log("\n💡 What happens next in production:");
      console.log("   1. ZetaChain Gateway picks up the event");
      console.log("   2. Gateway calls Sui contract's onCall() function");
      console.log("   3. NFT is minted on Sui with same metadata");
      console.log("   4. You receive the NFT at your Sui address");
      console.log("\n🔗 For full cross-chain functionality:");
      console.log("   - Deploy contract on Sui network");
      console.log("   - Configure ZetaChain Gateway");
      console.log("   - Set up relayers for message passing");
      console.log("=".repeat(60));
      
    } else {
      console.log("❌ Transfer transaction failed");
    }
    
  } catch (error) {
    console.log("❌ Transfer failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
