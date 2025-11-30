// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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

interface IGatewayZEVM {
    function withdrawAndCall(
        bytes memory receiver,
        uint256 amount,
        address zrc20,
        bytes calldata message,
        uint256 gasLimit,
        RevertOptions calldata revertOptions
    ) external;
}

struct RevertOptions {
    address revertAddress;
    bool callOnRevert;
    address abortAddress;
    bytes revertMessage;
    uint256 onRevertGasLimit;
}

contract UniversalNFT is ERC721URIStorage, UniversalContract, Ownable {
    IGatewayZEVM public gateway;
    uint256 private _tokenIdCounter;
    
    mapping(uint256 => uint256) public tokenChainId;
    mapping(bytes32 => bool) public processedMessages;
    
    event NFTMinted(uint256 indexed tokenId, address indexed to, string tokenURI);
    event NFTTransferred(uint256 indexed tokenId, address indexed from, uint256 destinationChain);
    event NFTReceived(uint256 indexed tokenId, address indexed to, uint256 sourceChain);
    
    error Unauthorized();
    error InvalidTokenId();
    error AlreadyProcessed();
    
    constructor(
        address _gateway,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
        gateway = IGatewayZEVM(_gateway);
    }

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
        
        string memory uri = tokenURI(tokenId);
        _burn(tokenId);
        
        bytes memory message = abi.encode(tokenId, receiver, uri, msg.sender);
        bytes memory receiverBytes = abi.encodePacked(receiver);
        
        // For demo purposes - in production you'd use actual ZRC20 tokens
        gateway.withdrawAndCall(
            receiverBytes,
            0,
            address(0),
            message,
            500000,
            RevertOptions({
                revertAddress: address(this),
                callOnRevert: true,
                abortAddress: address(0),
                revertMessage: message,
                onRevertGasLimit: 300000
            })
        );
        
        emit NFTTransferred(tokenId, msg.sender, destinationChainId);
    }
    
    function onCall(
        MessageContext calldata context,
        address,
        uint256,
        bytes calldata message
    ) external override {
        if (msg.sender != address(gateway)) revert Unauthorized();
        
        bytes32 messageHash = keccak256(abi.encodePacked(context.origin, message));
        if (processedMessages[messageHash]) revert AlreadyProcessed();
        processedMessages[messageHash] = true;
        
        (uint256 tokenId, address receiver, string memory uri, ) = 
            abi.decode(message, (uint256, address, string, address));
        
        _safeMint(receiver, tokenId);
        _setTokenURI(tokenId, uri);
        tokenChainId[tokenId] = context.chainID;
        
        emit NFTReceived(tokenId, receiver, context.chainID);
    }
    
    function onRevert(RevertContext calldata context) external override {
        if (msg.sender != address(gateway)) revert Unauthorized();
        
        (uint256 tokenId, address receiver, string memory uri, address originalOwner) = 
            abi.decode(context.revertMessage, (uint256, address, string, address));
        
        _safeMint(originalOwner, tokenId);
        _setTokenURI(tokenId, uri);
        tokenChainId[tokenId] = block.chainid;
    }
    
    function getTokenInfo(uint256 tokenId) external view returns (
        address owner,
        string memory uri,
        uint256 chainId
    ) {
        if (_ownerOf(tokenId) == address(0)) revert InvalidTokenId();
        return (ownerOf(tokenId), tokenURI(tokenId), tokenChainId[tokenId]);
    }
}
