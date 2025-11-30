const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing ZetaUniversalNFT Contract...\n");
  
  const contractAddress = "0x6Fde11615C80251d394586CD185bb56449d74569";
  const [signer] = await hre.ethers.getSigners();
  
  console.log("📝 Testing with account:", signer.address);
  
  const contract = await hre.ethers.getContractAt("ZetaUniversalNFT", contractAddress);
  
  // Test 1: Mint an NFT
  console.log("\n🎨 Test 1: Minting NFT...");
  try {
    const mintTx = await contract.mint(
      signer.address,
      "https://picsum.photos/400/400",
      { gasLimit: 500000 }
    );
    console.log("⏳ Waiting for mint transaction...");
    const mintReceipt = await mintTx.wait();
    
    // Get the token ID from the event
    const event = mintReceipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'NFTMinted';
      } catch { return false; }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      const tokenId = parsed.args.tokenId;
      console.log("✅ NFT Minted! Token ID:", tokenId.toString());
      
      // Test 2: Check ownership
      console.log("\n👤 Test 2: Checking ownership...");
      const owner = await contract.ownerOf(tokenId);
      console.log("Owner:", owner);
      console.log(owner === signer.address ? "✅ Ownership verified!" : "❌ Ownership mismatch!");
      
      // Test 3: Get token info
      console.log("\n📊 Test 3: Getting token info...");
      const tokenInfo = await contract.getTokenInfo(tokenId);
      console.log("Token Info:");
      console.log("  - Owner:", tokenInfo[0]);
      console.log("  - URI:", tokenInfo[1]);
      console.log("  - Chain ID:", tokenInfo[2].toString());
      console.log("  - Transferred:", tokenInfo[3]);
      
      // Test 4: Cross-chain transfer
      console.log("\n🌉 Test 4: Testing cross-chain transfer...");
      const destinationAddress = "0xdba1916cf68795d88436e9d12c21c0eda10bc012175db4e0bb774bd0fcddad4f";
      const suiChainId = 2;
      
      try {
        const transferTx = await contract.transferCrossChain(
          tokenId,
          signer.address, // Using signer address since contract expects EVM format
          suiChainId,
          { gasLimit: 800000 }
        );
        console.log("⏳ Waiting for transfer transaction...");
        const transferReceipt = await transferTx.wait();
        
        if (transferReceipt.status === 1) {
          console.log("✅ Cross-chain transfer successful!");
          console.log("Transaction hash:", transferReceipt.hash);
          
          // Check if NFT was burned
          try {
            await contract.ownerOf(tokenId);
            console.log("⚠️ NFT still exists (not burned)");
          } catch (e) {
            console.log("✅ NFT burned successfully!");
          }
        } else {
          console.log("❌ Transfer transaction failed");
        }
      } catch (error) {
        console.log("❌ Transfer failed:", error.message);
      }
      
    } else {
      console.log("❌ Could not find NFTMinted event");
    }
    
  } catch (error) {
    console.log("❌ Mint failed:", error.message);
    if (error.data) {
      console.log("Error data:", error.data);
    }
  }
  
  // Test 5: Check total minted
  console.log("\n📈 Test 5: Checking total minted...");
  const totalMinted = await contract.totalMinted();
  console.log("Total NFTs minted:", totalMinted.toString());
  
  console.log("\n✅ All tests completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
