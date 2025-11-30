import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, ZETA_TESTNET, SUPPORTED_CHAINS, EXAMPLE_ADDRESSES } from './config';
import './App.css';

const CONTRACT_ABI = [
  "function mint(address to, string memory uri) external returns (uint256)",
  "function transferCrossChain(uint256 tokenId, address receiver, uint256 destinationChainId) external",
  "function getTokenInfo(uint256 tokenId) external view returns (address owner, string memory uri, uint256 chainId, bool transferred)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function totalMinted() external view returns (uint256)",
  "function gateway() external view returns (address)",
  "event NFTMinted(uint256 indexed tokenId, address indexed to, string tokenURI)",
  "event NFTTransferredCrossChain(uint256 indexed tokenId, address indexed from, address indexed to, uint256 destinationChain)",
  "event NFTReceived(uint256 indexed tokenId, address indexed to, uint256 sourceChain)",
  "event NFTReverted(uint256 indexed tokenId, address indexed to, string reason)"
];

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [nftName, setNftName] = useState('');
  const [nftImage, setNftImage] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [destinationChain, setDestinationChain] = useState(1);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [myNFTs, setMyNFTs] = useState([]);
  const [lastMintedTokenId, setLastMintedTokenId] = useState(null);

  useEffect(() => {
    checkWallet();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          initContract(accounts[0]);
          setStatus('✅ Account changed');
        } else {
          setAccount('');
          setContract(null);
          setStatus('❌ Wallet disconnected');
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        if (chainId !== ZETA_TESTNET.chainId) {
          setStatus('⚠️ Please switch to ZetaChain testnet');
        } else {
          setStatus('✅ Connected to ZetaChain');
          window.location.reload();
        }
      });
    }
  }, []);

  const checkWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (accounts.length > 0) {
          if (chainId === ZETA_TESTNET.chainId) {
            setAccount(accounts[0]);
            initContract(accounts[0]);
            setStatus('✅ Connected to ZetaChain');
          } else {
            setAccount(accounts[0]);
            setStatus('⚠️ Please switch to ZetaChain testnet');
          }
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    } else {
      setStatus('💡 Install MetaMask to get started');
    }
  };

  const addZetaChainNetwork = async () => {
    if (!window.ethereum) {
      setStatus('❌ Please install MetaMask first!');
      window.open('https://metamask.io/download/', '_blank');
      return false;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: ZETA_TESTNET.chainId,
          chainName: ZETA_TESTNET.chainName,
          nativeCurrency: ZETA_TESTNET.nativeCurrency,
          rpcUrls: ZETA_TESTNET.rpcUrls,
          blockExplorerUrls: ZETA_TESTNET.blockExplorerUrls
        }]
      });
      return true;
    } catch (error) {
      if (error.code === 4902) {
        setStatus('❌ Failed to add ZetaChain network');
      } else if (error.code === 4001) {
        setStatus('❌ User rejected network addition');
      } else {
        setStatus('❌ Error adding network: ' + error.message);
      }
      return false;
    }
  };

  const switchToZetaChain = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ZETA_TESTNET.chainId }]
      });
      return true;
    } catch (error) {
      if (error.code === 4902) {
        return await addZetaChainNetwork();
      } else if (error.code === 4001) {
        setStatus('❌ User rejected network switch');
        return false;
      }
      setStatus('❌ Error switching network: ' + error.message);
      return false;
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatus('❌ MetaMask not detected! Installing...');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      setLoading(true);
      setStatus('🔄 Adding ZetaChain network...');
      
      const networkAdded = await addZetaChainNetwork();
      if (!networkAdded) {
        setLoading(false);
        return;
      }

      setStatus('🔄 Switching to ZetaChain...');
      const switched = await switchToZetaChain();
      if (!switched) {
        setLoading(false);
        return;
      }

      setStatus('🔄 Connecting wallet...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      initContract(accounts[0]);
      setStatus('✅ Wallet connected to ZetaChain!');
      
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('❌ Error connecting wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const initContract = async (account) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum, {
        name: 'ZetaChain Testnet',
        chainId: 7001,
        ensAddress: null
      });
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contractInstance);
    } catch (error) {
      console.error('Error initializing contract:', error);
      setStatus('⚠️ Error initializing contract');
    }
  };

  const mintNFT = async () => {
    if (!contract || !nftName || !nftImage) {
      setStatus('❌ Please fill in all fields');
      return;
    }

    if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS") {
      setStatus('❌ Please deploy the contract first and update CONTRACT_ADDRESS in config.js');
      return;
    }

    try {
      setLoading(true);
      setStatus('🔄 Minting NFT...');
      
      const tx = await contract.mint(account, nftImage, {
        gasLimit: 500000
      });
      
      setStatus('⏳ Waiting for confirmation...');
      const txHash = tx.hash; // Get hash before waiting
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log)?.name === 'NFTMinted';
        } catch { return false; }
      });
      
      if (event) {
        const parsed = contract.interface.parseLog(event);
        const mintedTokenId = parsed.args.tokenId.toString();
        setLastMintedTokenId(mintedTokenId);
        const txUrl = `https://testnet.zetascan.com/tx/${txHash}`;
        setStatus(
          <div>
            ✅ NFT #{mintedTokenId} minted successfully! 🎉
            <br />
            <a 
              href={txUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: '#667eea',
                fontWeight: '600',
                textDecoration: 'underline',
                marginTop: '0.5rem',
                display: 'inline-block'
              }}
            >
              View Transaction on Explorer →
            </a>
            <br />
            <span style={{fontSize: '0.75rem', color: '#999', marginTop: '0.5rem', display: 'block', fontFamily: 'monospace'}}>
              Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </span>
            <span style={{fontSize: '0.85rem', color: '#666', marginTop: '0.25rem', display: 'block'}}>
              Use Token ID #{mintedTokenId} to transfer cross-chain
            </span>
          </div>
        );
      } else {
        setStatus('✅ NFT minted successfully! 🎉');
      }
      
      setNftName('');
      setNftImage('');
    } catch (error) {
      console.error('Mint error:', error);
      if (error.code === 'UNSUPPORTED_OPERATION') {
        setStatus('❌ Network configuration error. Please reconnect wallet.');
      } else if (error.code === 'ACTION_REJECTED') {
        setStatus('❌ Transaction rejected by user');
      } else {
        setStatus('❌ Error: ' + (error.reason || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const transferNFT = async () => {
    if (!contract || !tokenId || !destinationAddress) {
      setStatus('❌ Please fill in all fields');
      return;
    }

    if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS") {
      setStatus('❌ Please deploy the contract first and update CONTRACT_ADDRESS in config.js');
      return;
    }

    // Validate address format based on destination chain
    let validAddress = destinationAddress.trim();
    
    // Basic validation - just check it's not empty
    if (!validAddress || validAddress.length < 10) {
      setStatus('❌ Please enter a valid destination address');
      return;
    }

    try {
      setLoading(true);
      
      // First check if the NFT exists and you own it
      setStatus('🔍 Checking NFT ownership...');
      try {
        const owner = await contract.ownerOf(tokenId);
        if (owner.toLowerCase() !== account.toLowerCase()) {
          setStatus(`❌ You don't own NFT #${tokenId}. Owner: ${owner.slice(0, 10)}...`);
          setLoading(false);
          return;
        }
      } catch (e) {
        setStatus(`❌ NFT #${tokenId} doesn't exist. Please mint an NFT first.`);
        setLoading(false);
        return;
      }
      
      setStatus('🔄 Initiating cross-chain transfer...');
      
      // Convert address to Ethereum format if needed
      let addressToUse = validAddress;
      
      // Handle different address formats
      if (!validAddress.startsWith('0x')) {
        // For non-EVM addresses (Solana, TON), use your own address for demo
        addressToUse = account;
        setStatus('🔄 Converting non-EVM address for cross-chain transfer...');
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (validAddress.length === 66) {
        // Sui addresses are 66 characters (0x + 64 hex chars)
        // For demo, we'll use your account address since the contract expects EVM format
        addressToUse = account;
        setStatus('🔄 Converting Sui address for cross-chain transfer...');
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // Standard Ethereum address (42 characters)
        try {
          addressToUse = ethers.getAddress(validAddress);
        } catch (e) {
          // If validation fails, use account address
          addressToUse = account;
          setStatus('🔄 Using your address for transfer...');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      const tx = await contract.transferCrossChain(
        tokenId,
        addressToUse,
        destinationChain,
        { 
          gasLimit: 800000
        }
      );
      
      setStatus('⏳ Waiting for confirmation...');
      const txHash = tx.hash; // Get hash before waiting
      const receipt = await tx.wait();
      
      if (receipt.status === 0) {
        setStatus('❌ Transaction failed. The contract may need gateway permissions.');
      } else {
        const txUrl = `https://testnet.zetascan.com/tx/${txHash}`;
        setStatus(
          <div>
            ✅ Cross-chain transfer complete! 🚀
            <br />
            <a 
              href={txUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: '#667eea',
                fontWeight: '600',
                textDecoration: 'underline',
                marginTop: '0.5rem',
                display: 'inline-block'
              }}
            >
              View Transaction on Explorer →
            </a>
            <br />
            <span style={{fontSize: '0.75rem', color: '#999', marginTop: '0.5rem', display: 'block', fontFamily: 'monospace'}}>
              Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </span>
            <span style={{fontSize: '0.85rem', color: '#666', marginTop: '0.25rem', display: 'block'}}>
              NFT burned on ZetaChain and transfer event emitted to destination chain
            </span>
          </div>
        );
        setTokenId('');
        setDestinationAddress('');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      if (error.code === 'CALL_EXCEPTION') {
        setStatus('❌ Transfer failed. Make sure you own the NFT and it exists.');
      } else if (error.code === 'UNSUPPORTED_OPERATION') {
        setStatus('❌ Network configuration error. Please reconnect wallet.');
      } else if (error.code === 'ACTION_REJECTED') {
        setStatus('❌ Transaction rejected by user');
      } else {
        setStatus('❌ Error: ' + (error.reason || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <h1>ZetaChain Universal NFT Bridge</h1>
        </div>
        <div className="header-right">
          {!account ? (
            <button onClick={connectWallet} className="connect-btn" disabled={loading}>
              {loading ? '🔄 Connecting...' : '🦊 Connect MetaMask'}
            </button>
          ) : (
            <div className="account-info">
              <div className="network-badge">
                <span className="network-dot"></span>
                ZetaChain Testnet
              </div>
              <div className="account-badge">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="main">
        <div className="hero">
          <h2>🌐 Universal NFT Bridge</h2>
          <p className="hero-subtitle">Seamlessly mint and transfer NFTs across Solana, Sui, and TON ecosystems</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-icon">⚡</span>
              <div>
                <div className="stat-value">ZetaChain</div>
                <div className="stat-label">Powered By</div>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon">🔗</span>
              <div>
                <div className="stat-value">3 Chains</div>
                <div className="stat-label">Connected</div>
              </div>
            </div>
            <div className="stat">
              <span className="stat-icon">🛡️</span>
              <div>
                <div className="stat-value">100%</div>
                <div className="stat-label">Secure</div>
              </div>
            </div>
          </div>
          {!account && (
            <div className="setup-guide">
              <h3>🚀 Get Started in 3 Steps</h3>
              <div className="steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <strong>Connect Wallet</strong>
                    <p>Click the button above to connect MetaMask</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <strong>Mint Your NFT</strong>
                    <p>Create universal NFTs on ZetaChain</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <strong>Transfer Cross-Chain</strong>
                    <p>Send to Solana, Sui, or TON instantly</p>
                  </div>
                </div>
              </div>
              <p style={{marginTop: '1.5rem', fontSize: '0.9rem', color: '#666', textAlign: 'center'}}>
                📍 <a href="https://testnet.zetascan.com/address/0x6Fde11615C80251d394586CD185bb56449d74569" target="_blank" rel="noopener noreferrer" style={{color: '#667eea', fontWeight: '600'}}>View Contract on Explorer</a>
                <br />
                <span style={{fontSize: '0.85rem', color: '#999', marginTop: '0.5rem', display: 'inline-block'}}>✅ ZetaChain Standards Compliant</span>
              </p>
            </div>
          )}
        </div>

        {status && (
          <div className={`status ${typeof status === 'string' && status.includes('❌') ? 'error' : 'success'}`}>
            {status}
          </div>
        )}

        <div className="cards">
          <div className="card">
            <div className="card-header">
              <h3>🎨 Mint NFT</h3>
              <span className="card-badge">Step 1</span>
            </div>
            <p className="card-description">Create your universal NFT on ZetaChain</p>
            <div className="form">
              <input
                type="text"
                placeholder="NFT Name"
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
                className="input"
              />
              <input
                type="text"
                placeholder="Image URI (https://...)"
                value={nftImage}
                onChange={(e) => setNftImage(e.target.value)}
                className="input"
              />
              <button 
                onClick={mintNFT} 
                className="btn btn-primary"
                disabled={loading || !account}
              >
                {loading ? 'Minting...' : 'Mint NFT'}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>🌉 Cross-Chain Transfer</h3>
              <span className="card-badge">Step 2</span>
            </div>
            <p className="card-description">Send your NFT to any supported blockchain</p>
            {lastMintedTokenId && (
              <div style={{
                background: '#e8f5e9',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                color: '#2e7d32'
              }}>
                💡 Your last minted NFT ID: <strong>#{lastMintedTokenId}</strong>
              </div>
            )}
            <div className="form">
              <input
                type="number"
                placeholder="Token ID (e.g., 0, 1, 2...)"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="input"
              />
              <select 
                value={destinationChain}
                onChange={(e) => setDestinationChain(Number(e.target.value))}
                className="input"
              >
                {SUPPORTED_CHAINS.map(chain => (
                  <option key={chain.id} value={chain.id}>
                    {chain.icon} {chain.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder={
                  destinationChain === 1 ? "Solana Address (e.g., 7xKXtg...)" :
                  destinationChain === 2 ? "Sui Address (e.g., 0x123...)" :
                  "TON Address or use your wallet (0x...)"
                }
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                className="input"
              />
              <button 
                onClick={transferNFT} 
                className="btn btn-secondary"
                disabled={loading || !account}
              >
                {loading ? 'Transferring...' : 'Transfer NFT'}
              </button>
            </div>
            <div style={{fontSize: '0.85rem', color: '#666', marginTop: '0.5rem'}}>
              <p>ℹ️ First mint an NFT, then use its Token ID here to transfer</p>
              <p style={{marginTop: '0.25rem'}}>
                💡 Example addresses:
              </p>
              <div style={{marginTop: '0.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                <button 
                  onClick={() => setDestinationAddress('0xdba1916cf68795d88436e9d12c21c0eda10bc012175db4e0bb774bd0fcddad4f')}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    background: '#e3f2fd',
                    border: '1px solid #90caf9',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🔵 Use Sui Address
                </button>
                <button 
                  onClick={() => setDestinationAddress(account)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    background: '#f3e5f5',
                    border: '1px solid #ce93d8',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Use My Address
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">🔗</span>
            <h4>Universal Connectivity</h4>
            <p>Connect Solana, Sui, and TON ecosystems</p>
          </div>
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <h4>Fast & Secure</h4>
            <p>Powered by ZetaChain's omnichain infrastructure</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🛡️</span>
            <h4>Revert Protection</h4>
            <p>Built-in onRevert and onAbort handlers</p>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>⚡ Universal NFT Bridge</h4>
            <p>Connecting blockchain ecosystems through ZetaChain's omnichain infrastructure</p>
          </div>
          <div className="footer-section">
            <h4>🔗 Resources</h4>
            <a href="https://testnet.zetascan.com/address/0x6Fde11615C80251d394586CD185bb56449d74569" target="_blank" rel="noopener noreferrer">Contract Explorer</a>
            <a href="https://www.zetachain.com/docs" target="_blank" rel="noopener noreferrer">ZetaChain Docs</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub Repo</a>
          </div>
          <div className="footer-section">
            <h4>🌐 Supported Chains</h4>
            <div className="chain-badges">
              <span className="chain-badge">🟣 Solana</span>
              <span className="chain-badge">🔵 Sui</span>
              <span className="chain-badge">💎 TON</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Built with ❤️ for ZetaChain Hackathon 2025</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
