// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleUniversalNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    mapping(uint256 => uint256) public tokenChainId;
    mapping(uint256 => bool) public isTransferred;
    
    event NFTMinted(uint256 indexed tokenId, address indexed to, string tokenURI);
    event NFTTransferredCrossChain(uint256 indexed tokenId, address indexed from, address indexed to, uint256 destinationChain);
    event NFTReceived(uint256 indexed tokenId, address indexed to, uint256 sourceChain);
    
    error Unauthorized();
    error InvalidTokenId();
    error AlreadyTransferred();
    
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {}

    function mint(address to, string memory uri) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        tokenChainId[tokenId] = block.chainid;
        
        emit NFTMinted(tokenId, to, uri);
        return tokenId;
    }
    
    function transferCrossChain(
        uint256 tokenId,
        address receiver,
        uint256 destinationChainId
    ) external {
        if (ownerOf(tokenId) != msg.sender) revert Unauthorized();
        if (isTransferred[tokenId]) revert AlreadyTransferred();
        
        // Mark as transferred
        isTransferred[tokenId] = true;
        
        // In a real implementation, this would interact with ZetaChain gateway
        // For hackathon demo, we simulate the cross-chain transfer
        emit NFTTransferredCrossChain(tokenId, msg.sender, receiver, destinationChainId);
        
        // Burn the NFT on source chain
        _burn(tokenId);
    }
    
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
    
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
