# 🌐 Universal NFT Bridge - ZetaChain Hackathon Submission

## 🎯 Project Overview

Universal NFT Bridge is a cross-chain NFT marketplace that enables seamless minting and transferring of NFTs across multiple blockchain ecosystems (Solana, Sui, and TON) using ZetaChain's omnichain infrastructure.

## ✨ Key Features

- **🎨 Universal NFT Minting**: Create NFTs directly on ZetaChain
- **🌉 Cross-Chain Transfers**: Transfer NFTs to Solana, Sui, or TON ecosystems
- **🛡️ Secure & Reliable**: Built with ZetaChain's Universal Contract standards
- **⚡ Fast & Efficient**: Optimized gas usage and transaction speed
- **🎯 User-Friendly**: Clean, intuitive interface with MetaMask integration

## 🏗️ Architecture

### Smart Contracts
- **ZetaUniversalNFT.sol**: ERC721-based NFT contract with full ZetaChain standards compliance
- Implements UniversalContract interface (onCall, onRevert)
- Gateway integration for true cross-chain functionality
- Message replay protection and security features
- Burns NFTs on source chain during transfer
- Supports multiple destination chains (Solana, Sui, TON)

### Frontend
- **React + Vite**: Fast, modern development experience
- **Ethers.js v6**: Blockchain interaction
- **Responsive Design**: Works on desktop and mobile
- **Real-time Status**: Transaction feedback and error handling

## 🚀 Live Demo

- **Frontend**: http://localhost:3000
- **Contract**: [0x6Fde11615C80251d394586CD185bb56449d74569](https://athens.explorer.zetachain.com/address/0x6Fde11615C80251d394586CD185bb56449d74569)
- **Network**: ZetaChain Athens Testnet

## 📋 Technical Implementation

### ZetaChain Integration
✅ Universal Contract interface implementation (onCall, onRevert)
✅ Official Gateway integration (0x6c533f7fe93fae114d0954697069df33c9b74fd7)
✅ Cross-chain message handling with context tracking
✅ Event-driven architecture for omnichain communication
✅ Proper error handling with revert protection
✅ Message replay attack prevention
✅ Full compliance with ZetaChain NFT standards

### Smart Contract Features
- ERC721URIStorage for metadata
- Token chain ID tracking
- Transfer status management
- Owner-only operations
- Gas-optimized functions

### Frontend Features
- MetaMask auto-configuration
- Network switching automation
- Address format validation
- Transaction status tracking
- Multi-chain address support

## 🎬 How It Works

1. **Connect Wallet**: Users connect MetaMask to ZetaChain testnet
2. **Mint NFT**: Create a new NFT with custom metadata
3. **Select Destination**: Choose target blockchain (Solana/Sui/TON)
4. **Transfer**: Initiate cross-chain transfer
5. **Confirmation**: NFT is burned on source and emitted to destination

## 🔧 Technology Stack

- **Blockchain**: ZetaChain (EVM-compatible)
- **Smart Contracts**: Solidity 0.8.26
- **Development**: Hardhat
- **Frontend**: React 18, Vite 5
- **Web3**: Ethers.js 6
- **Styling**: Custom CSS with gradients

## 📊 Test Results

✅ NFT Minting: SUCCESS
✅ Ownership Verification: SUCCESS  
✅ Cross-Chain Transfer: SUCCESS
✅ NFT Burning: SUCCESS
✅ Event Emission: SUCCESS

## 🌟 Hackathon Highlights

1. **Full ZetaChain Integration**: Proper use of Universal Contracts
2. **Multi-Chain Support**: Solana, Sui, and TON connectivity
3. **Production-Ready**: Error handling, validation, and security
4. **Great UX**: Intuitive interface with helpful guidance
5. **Well-Documented**: Clear code and comprehensive README

## 🚀 Future Enhancements

- [ ] NFT Gallery view
- [ ] Transaction history
- [ ] Batch transfers
- [ ] NFT marketplace features
- [ ] Mobile app
- [ ] Additional chain support

## 📝 Contract Addresses

- **ZetaUniversalNFT**: `0x6Fde11615C80251d394586CD185bb56449d74569`
- **Network**: ZetaChain Athens Testnet (Chain ID: 7001)
- **Gateway**: `0x6c533f7fe93fae114d0954697069df33c9b74fd7`
- **Standards**: ✅ Full ZetaChain Universal Contract Compliance

## 🎥 Demo Video

[Add your demo video link here]

## 👥 Team

Built with ❤️ for ZetaChain Hackathon 2025

## 📄 License

MIT License
