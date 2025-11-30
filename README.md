# ⚡ Universal NFT Bridge - ZetaChain Hackathon

A cross-chain NFT marketplace that enables seamless minting and transferring of NFTs across Solana, Sui, and TON ecosystems using ZetaChain's omnichain infrastructure.

![ZetaChain](https://img.shields.io/badge/ZetaChain-Testnet-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.26-green)
![React](https://img.shields.io/badge/React-18.2-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Features

- 🎨 **Universal NFT Minting** - Create NFTs directly on ZetaChain
- 🌉 **Cross-Chain Transfers** - Transfer NFTs to Solana, Sui, or TON
- 🛡️ **ZetaChain Standards Compliant** - Full implementation of Universal Contract interface
- ⚡ **Fast & Efficient** - Optimized gas usage (~400k gas per transfer)
- 🎯 **User-Friendly** - Clean, intuitive interface with MetaMask integration

## 🚀 Live Demo

- **Contract**: [0x6Fde11615C80251d394586CD185bb56449d74569](https://testnet.zetascan.com/address/0x6Fde11615C80251d394586CD185bb56449d74569)
- **Network**: ZetaChain Athens Testnet (Chain ID: 7001)
- **Gateway**: 0x6c533f7fe93fae114d0954697069df33c9b74fd7

## 📋 Prerequisites

- Node.js v16+
- MetaMask wallet
- ZetaChain testnet ZETA tokens ([Get from faucet](https://labs.zetachain.com/get-zeta))

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/universal-nft-bridge.git
cd universal-nft-bridge

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## ⚙️ Configuration

1. Create a `.env` file in the root directory:

```env
PRIVATE_KEY=your_private_key_here
GATEWAY_ADDRESS=0x6c533f7fe93fae114d0954697069df33c9b74fd7
```

2. Update `frontend/src/config.js` with your contract address (if deploying new contract)

## 🚀 Usage

### Deploy Smart Contract

```bash
# Compile contracts
npx hardhat compile

# Deploy to ZetaChain testnet
npx hardhat run scripts/deploy-zeta-nft.js --network zeta_testnet

# Test the contract
npx hardhat run scripts/test-contract.js --network zeta_testnet
```

### Run Frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 in your browser.

## 📖 How It Works

1. **Connect Wallet** - Connect MetaMask to ZetaChain testnet
2. **Mint NFT** - Create a new NFT with custom metadata
3. **Select Destination** - Choose target blockchain (Solana/Sui/TON)
4. **Transfer** - Initiate cross-chain transfer
5. **Confirmation** - NFT is burned on source and event emitted to destination

## 🏗️ Architecture

### Smart Contract (`ZetaUniversalNFT.sol`)

- ✅ ERC721URIStorage for NFT metadata
- ✅ UniversalContract interface (onCall, onRevert)
- ✅ Gateway integration for cross-chain messaging
- ✅ Message replay protection
- ✅ Token chain tracking

### Frontend (React + Vite)

- ✅ MetaMask integration with auto-configuration
- ✅ Real-time transaction status
- ✅ Multi-chain address support
- ✅ Responsive design

## 🎯 ZetaChain Standards Compliance

This project fully implements ZetaChain's Universal NFT standards:

- ✅ `onCall()` - Receives cross-chain NFT transfers
- ✅ `onRevert()` - Handles failed transfers
- ✅ Gateway integration
- ✅ Message context tracking
- ✅ Replay attack prevention

See [STANDARDS_COMPLIANCE.md](./STANDARDS_COMPLIANCE.md) for details.

## 📊 Test Results

```
✅ NFT Minting: SUCCESS
✅ Ownership Verification: SUCCESS
✅ Cross-Chain Transfer: SUCCESS
✅ NFT Burning: SUCCESS
✅ Event Emission: SUCCESS
```

## 🌐 Supported Chains

- 🟣 **Solana** (Chain ID: 1)
- 🔵 **Sui** (Chain ID: 2)
- 💎 **TON** (Chain ID: 3)

## 📁 Project Structure

```
├── contracts/
│   └── ZetaUniversalNFT.sol       # Main contract
├── scripts/
│   ├── deploy-zeta-nft.js         # Deployment script
│   ├── test-contract.js           # Testing script
│   └── check-transfer-status.js   # Status checker
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Main component
│   │   ├── App.css                # Styling
│   │   └── config.js              # Configuration
│   └── index.html
├── hardhat.config.js
└── README.md
```

## 🔧 Commands

```bash
# Compile contracts
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deploy-zeta-nft.js --network zeta_testnet

# Test contract
npx hardhat run scripts/test-contract.js --network zeta_testnet

# Check transfer status
npx hardhat run scripts/check-transfer-status.js --network zeta_testnet

# Run frontend
cd frontend && npm run dev
```

## 🎥 Demo Video

[Add your demo video link here]

## 📸 Screenshots

[Add screenshots of your application]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [ZetaChain](https://www.zetachain.com/) for the omnichain infrastructure
- [OpenZeppelin](https://www.openzeppelin.com/) for secure smart contract libraries
- ZetaChain community for support and guidance

## 📞 Contact

For questions or support, please open an issue or reach out on [Discord](https://discord.gg/zetachain).

---

Built with ❤️ for ZetaChain Hackathon 2025
