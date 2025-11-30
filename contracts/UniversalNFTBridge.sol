// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
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

struct AbortContext {
    address asset;
    uint64 amount;
}

struct CallOptions {
    uint256 gasLimit;
    bool isArbitraryCall;
}

struct RevertOptions {
    address revertAddress;
    bool callOnRevert;
    address abortAddress;
    bytes revertMessage;
    uint256 onRevertGasLimit;
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
    function call(
        bytes memory receiver,
        address zrc20,
        bytes calldata message,
        CallOptions calldata callOptions,
        RevertOptions calldata revertOptions
    ) external;
}

contract UniversalNFTBridge is ERC721, UniversalContract, Ownable {
    IGatewayZEVM public gateway;
    
    uint256 private _tokenIdCounter;
    
    struct NFTData {
        string name;
        string imageURI;
        address originalOwner;
        uint256 sourceChain;
    }
    
    mapping(uint256 => NFTData) public nftData;
    mapping(bytes32 => uint256) public pendingTransfers;
    
    event NFTMinted(uint256 indexed tokenId, address indexed owner, string name);
    event CrossChainTransferInitiated(uint256 indexed tokenId, address indexed from, bytes indexed destination);
    event TransferCompleted(uint256 indexed tokenId, address indexed to);
    event TransferReverted(uint256 indexed tokenId, string reason);
    event TransferAborted(uint256 indexed tokenId, string reason);
    
    constructor(address _gateway) ERC721("Universal NFT", "UNFT") Ownable(msg.sender) {
        gateway = IGatewayZEVM(_gateway);
    }

    function mintNFT(string memory name, string memory imageURI) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        
        nftData[tokenId] = NFTData({
            name: name,
            imageURI: imageURI,
            originalOwner: msg.sender,
            sourceChain: block.chainid
        });
        
        emit NFTMinted(tokenId, msg.sender, name);
        return tokenId;
    }
    
    function crossChainTransfer(
        uint256 tokenId,
        bytes memory destination,
        uint256 destinationChainId
    ) external payable {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        
        _burn(tokenId);
        
        bytes32 transferId = keccak256(abi.encodePacked(tokenId, msg.sender, block.timestamp));
        pendingTransfers[transferId] = tokenId;
        
        bytes memory message = abi.encode(
            tokenId,
            nftData[tokenId].name,
            nftData[tokenId].imageURI,
            destination
        );
        
        gateway.call(destination, address(0), message, CallOptions({gasLimit: 500000, isArbitraryCall: true}), RevertOptions({
            revertAddress: address(this),
            callOnRevert: true,
            abortAddress: address(0),
            revertMessage: abi.encode(transferId, msg.sender),
            onRevertGasLimit: 300000
        }));
        
        emit CrossChainTransferInitiated(tokenId, msg.sender, destination);
    }

    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override {
        require(msg.sender == address(gateway), "Unauthorized");
        
        (uint256 tokenId, string memory name, string memory imageURI, address recipient) = 
            abi.decode(message, (uint256, string, string, address));
        
        _safeMint(recipient, tokenId);
        
        nftData[tokenId] = NFTData({
            name: name,
            imageURI: imageURI,
            originalOwner: recipient,
            sourceChain: context.chainID
        });
        
        emit TransferCompleted(tokenId, recipient);
    }
    
    function onRevert(RevertContext calldata context) external override {
        require(msg.sender == address(gateway), "Unauthorized");
        
        (bytes32 transferId, address originalOwner) = abi.decode(context.revertMessage, (bytes32, address));
        uint256 tokenId = pendingTransfers[transferId];
        
        if (tokenId > 0) {
            _safeMint(originalOwner, tokenId);
            delete pendingTransfers[transferId];
            
            emit TransferReverted(tokenId, "Cross-chain transfer failed");
        }
    }
    
    function onAbort(AbortContext calldata context) external {
        require(msg.sender == address(gateway), "Unauthorized");
        
        emit TransferAborted(0, "Transfer aborted by system");
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return nftData[tokenId].imageURI;
    }
    
    function getNFTData(uint256 tokenId) external view returns (NFTData memory) {
        return nftData[tokenId];
    }
}
