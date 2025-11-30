// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ZetaChain Universal Contract Interfaces
struct MessageContext {
    bytes origin;
    address sender;
    uint256 chainID;
}

struct RevertContext {
    address asset;
    uint64 amount;
    bytes revertMessage;
}

interface UniversalContract {
    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external;

    function onRevert(RevertContext calldata context) external;
}

/**
 * @title ZetaUniversalNFT
 * @notice Universal NFT following ZetaChain standards with onCall, onRevert, and cross-chain capabilities
 * @dev Implements ZetaChain's Universal Contract interface for omnichain NFT transfers
 */
contract ZetaUniversalNFT is ERC721URIStorage, UniversalContract, Ownable {
    address public gateway;
    uint256 private _tokenIdCounter;
    
    // Track which chain each token originated from
    mapping(uint256 => uint256) public tokenChainId;
    
    // Prevent replay attacks
    mapping(bytes32 => bool) public processedMessages;
    
    // Track transferred tokens
    mapping(uint256 => bool) public isTransferred;
    
    event NFTMinted(uint256 indexed tokenId, address indexed to, string tokenURI);
    event NFTTransferredCrossChain(uint256 indexed tokenId, address indexed from, address indexed to, uint256 destinationChain);
    event NFTReceived(uint256 indexed tokenId, address indexed to, uint256 sourceChain);
    event NFTReverted(uint256 indexed tokenId, address indexed to, string reason);
    
    error Unauthorized();
    error InvalidTokenId();
    error AlreadyTransferred();
    error AlreadyProcessed();
    
    constructor(
        address _gateway,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
        gateway = _gateway;
    }

    /**
     * @notice Mint a new NFT
     * @param to Address to mint to
     * @param uri Token metadata URI
     */
    function mint(address to, string memory uri) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        tokenChainId[tokenId] = block.chainid;
        
        emit NFTMinted(tokenId, to, uri);
        return tokenId;
    }
    
    /**
     * @notice Transfer NFT to another chain
     * @param tokenId Token ID to transfer
     * @param receiver Receiver address on destination chain
     * @param destinationChainId Destination chain ID
     */
    function transferCrossChain(
        uint256 tokenId,
        address receiver,
        uint256 destinationChainId
    ) external {
        if (ownerOf(tokenId) != msg.sender) revert Unauthorized();
        if (isTransferred[tokenId]) revert AlreadyTransferred();
        
        string memory uri = tokenURI(tokenId);
        
        // Mark as transferred and burn
        isTransferred[tokenId] = true;
        _burn(tokenId);
        
        // Emit event for cross-chain tracking
        emit NFTTransferredCrossChain(tokenId, msg.sender, receiver, destinationChainId);
        
        // In production, this would call gateway.withdrawAndCall()
        // For hackathon demo, we emit events that can be picked up by relayers
    }
    
    /**
     * @notice Handle incoming cross-chain messages (ZetaChain Standard)
     * @param context Message context with origin chain info
     * @param message Encoded NFT data
     */
    function onCall(
        MessageContext calldata context,
        address,
        uint256,
        bytes calldata message
    ) external override {
        // In production, verify msg.sender is gateway
        // For demo, we allow any caller for testing
        
        // Prevent replay attacks
        bytes32 messageHash = keccak256(abi.encodePacked(context.origin, message));
        if (processedMessages[messageHash]) revert AlreadyProcessed();
        processedMessages[messageHash] = true;
        
        // Decode the message
        (uint256 tokenId, address receiver, string memory uri) = 
            abi.decode(message, (uint256, address, string));
        
        // Mint the NFT on this chain
        _safeMint(receiver, tokenId);
        _setTokenURI(tokenId, uri);
        tokenChainId[tokenId] = context.chainID;
        
        emit NFTReceived(tokenId, receiver, context.chainID);
    }
    
    /**
     * @notice Handle reverted cross-chain transactions (ZetaChain Standard)
     * @param context Revert context with original message
     */
    function onRevert(RevertContext calldata context) external override {
        // In production, verify msg.sender is gateway
        
        // Decode the original message
        (uint256 tokenId, address originalOwner, string memory uri) = 
            abi.decode(context.revertMessage, (uint256, address, string));
        
        // Re-mint the NFT to original owner
        _safeMint(originalOwner, tokenId);
        _setTokenURI(tokenId, uri);
        tokenChainId[tokenId] = block.chainid;
        isTransferred[tokenId] = false;
        
        emit NFTReverted(tokenId, originalOwner, "Cross-chain transfer reverted");
    }
    
    /**
     * @notice Get comprehensive token information
     */
    function getTokenInfo(uint256 tokenId) external view returns (
        address owner,
        string memory uri,
        uint256 chainId,
        bool transferred
    ) {
        if (_ownerOf(tokenId) == address(0) && !isTransferred[tokenId]) revert InvalidTokenId();
        
        address tokenOwner = _ownerOf(tokenId) != address(0) ? ownerOf(tokenId) : address(0);
        string memory tokenUri = _ownerOf(tokenId) != address(0) ? tokenURI(tokenId) : "";
        
        return (tokenOwner, tokenUri, tokenChainId[tokenId], isTransferred[tokenId]);
    }
    
    /**
     * @notice Get total number of NFTs minted
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @notice Update gateway address (owner only)
     */
    function setGateway(address _gateway) external onlyOwner {
        gateway = _gateway;
    }
}
