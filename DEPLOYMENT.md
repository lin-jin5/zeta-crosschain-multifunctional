# Deployment Guide

## Quick Deploy to ZetaChain Testnet

### Step 1: Get Testnet ZETA Tokens

1. Go to https://labs.zetachain.com/get-zeta
2. Connect your MetaMask wallet
3. Request testnet ZETA tokens

### Step 2: Export Your Private Key

1. Open MetaMask
2. Click the 3 dots menu → Account Details
3. Click "Show Private Key"
4. Enter your password
5. Copy the private key

### Step 3: Update .env File

```bash
PRIVATE_KEY=your_private_key_here
GATEWAY_ADDRESS=0x6c533f7fe93fae114d0954697069df33c9b74fd7
```

### Step 4: Deploy Contract

```bash
npx hardhat run scripts/deploy-simple.js --network zeta_testnet
```

### Step 5: Update Frontend

Copy the deployed contract address and update `frontend/src/config.js`:

```javascript
export const CONTRACT_ADDRESS = "0xYourContractAddress";
```

### Step 6: Test the App

Refresh your browser at http://localhost:3000 and start minting NFTs!

## Troubleshooting

**Error: insufficient funds**
- Get more testnet ZETA from the faucet

**Error: network does not support ENS**
- This is already fixed in the code

**Contract not responding**
- Make sure you updated the CONTRACT_ADDRESS in config.js
- Check the contract on explorer: https://athens.explorer.zetachain.com/
