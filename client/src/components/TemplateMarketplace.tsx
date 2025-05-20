import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TemplateProps {
  projectId: number;
}

// Template categories
type TemplateCategory = 'all' | 'tokens' | 'nft' | 'defi' | 'dao' | 'marketplace' | 'gaming';

// Template types
type TemplateType = 'token' | 'contract';

// Template interface
interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  type: TemplateType;
  price: number | 'free';
  author: string;
  rating: number;
  downloads: number;
  tags: string[];
  content: string;
  image: string;
}

export function TemplateMarketplace({ projectId }: TemplateProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplateDetails, setShowTemplateDetails] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock templates data
  const templates: Template[] = [
    {
      id: 'erc20-standard',
      name: 'ERC20 Standard Token',
      description: 'A standard ERC20 token implementation with standard features like transfer, approve, and allowance.',
      category: 'tokens',
      type: 'token',
      price: 'free',
      author: 'OpenZeppelin',
      rating: 4.9,
      downloads: 12543,
      tags: ['erc20', 'token', 'standard'],
      content: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.17;\n\nimport "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n\ncontract StandardToken is ERC20 {\n    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {\n        _mint(msg.sender, initialSupply * 10 ** decimals());\n    }\n}',
      image: 'token-standard'
    },
    {
      id: 'erc20-mintable',
      name: 'ERC20 Mintable Token',
      description: 'An ERC20 token with minting capabilities for authorized accounts.',
      category: 'tokens',
      type: 'token',
      price: 'free',
      author: 'OpenZeppelin',
      rating: 4.7,
      downloads: 8765,
      tags: ['erc20', 'token', 'mintable'],
      content: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.17;\n\nimport "@openzeppelin/contracts/token/ERC20/ERC20.sol";\nimport "@openzeppelin/contracts/access/AccessControl.sol";\n\ncontract MintableToken is ERC20, AccessControl {\n    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");\n\n    constructor(string memory name, string memory symbol) ERC20(name, symbol) {\n        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);\n        _grantRole(MINTER_ROLE, msg.sender);\n    }\n\n    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {\n        _mint(to, amount);\n    }\n}',
      image: 'token-mintable'
    },
    {
      id: 'erc721-nft',
      name: 'ERC721 NFT Collection',
      description: 'A complete NFT collection with minting, metadata, and enumeration.',
      category: 'nft',
      type: 'contract',
      price: 'free',
      author: 'OpenZeppelin',
      rating: 4.8,
      downloads: 9821,
      tags: ['erc721', 'nft', 'collection'],
      content: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.17;\n\nimport "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";\nimport "@openzeppelin/contracts/access/Ownable.sol";\nimport "@openzeppelin/contracts/utils/Counters.sol";\n\ncontract NFTCollection is ERC721Enumerable, Ownable {\n    using Counters for Counters.Counter;\n    \n    Counters.Counter private _tokenIdCounter;\n    string private _baseTokenURI;\n    uint256 public maxSupply;\n    uint256 public price;\n    \n    constructor(string memory name, string memory symbol, string memory baseURI, uint256 _maxSupply, uint256 _price) ERC721(name, symbol) {\n        _baseTokenURI = baseURI;\n        maxSupply = _maxSupply;\n        price = _price;\n    }\n    \n    function mint() public payable {\n        require(_tokenIdCounter.current() < maxSupply, "Max supply reached");\n        require(msg.value >= price, "Insufficient payment");\n        \n        uint256 tokenId = _tokenIdCounter.current();\n        _tokenIdCounter.increment();\n        _safeMint(msg.sender, tokenId);\n    }\n    \n    function _baseURI() internal view override returns (string memory) {\n        return _baseTokenURI;\n    }\n    \n    function setBaseURI(string memory baseURI) external onlyOwner {\n        _baseTokenURI = baseURI;\n    }\n    \n    function withdraw() external onlyOwner {\n        payable(owner()).transfer(address(this).balance);\n    }\n}',
      image: 'nft-collection'
    },
    {
      id: 'erc1155-multi',
      name: 'ERC1155 Multi-Token',
      description: 'A multi-token standard for both fungible and non-fungible tokens in one contract.',
      category: 'nft',
      type: 'contract',
      price: 'free',
      author: 'OpenZeppelin',
      rating: 4.6,
      downloads: 5432,
      tags: ['erc1155', 'nft', 'multi-token'],
      content: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.17;\n\nimport "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";\nimport "@openzeppelin/contracts/access/Ownable.sol";\n\ncontract MultiToken is ERC1155, Ownable {\n    mapping(uint256 => string) private _uris;\n    \n    constructor(string memory uri) ERC1155(uri) {}\n    \n    function mint(address account, uint256 id, uint256 amount, bytes memory data) public onlyOwner {\n        _mint(account, id, amount, data);\n    }\n    \n    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {\n        _mintBatch(to, ids, amounts, data);\n    }\n    \n    function setTokenURI(uint256 tokenId, string memory newuri) public onlyOwner {\n        _uris[tokenId] = newuri;\n    }\n    \n    function uri(uint256 tokenId) public view override returns (string memory) {\n        string memory tokenURI = _uris[tokenId];\n        if (bytes(tokenURI).length > 0) {\n            return tokenURI;\n        }\n        return super.uri(tokenId);\n    }\n}',
      image: 'multi-token'
    },
    {
      id: 'liquidity-pool',
      name: 'Liquidity Pool',
      description: 'A simple liquidity pool for token swapping with automatic market making.',
      category: 'defi',
      type: 'contract',
      price: 'free',
      author: 'DeFiBuilder',
      rating: 4.5,
      downloads: 3211,
      tags: ['defi', 'amm', 'swap'],
      content: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.17;\n\nimport "@openzeppelin/contracts/token/ERC20/IERC20.sol";\nimport "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";\nimport "@openzeppelin/contracts/security/ReentrancyGuard.sol";\nimport "@openzeppelin/contracts/access/Ownable.sol";\n\ncontract LiquidityPool is ReentrancyGuard, Ownable {\n    using SafeERC20 for IERC20;\n    \n    IERC20 public tokenA;\n    IERC20 public tokenB;\n    uint256 public reserveA;\n    uint256 public reserveB;\n    uint256 public totalShares;\n    mapping(address => uint256) public shares;\n    uint256 public constant FEE_PERCENT = 3; // 0.3% fee\n    \n    constructor(address _tokenA, address _tokenB) {\n        tokenA = IERC20(_tokenA);\n        tokenB = IERC20(_tokenB);\n    }\n    \n    function addLiquidity(uint256 amountA, uint256 amountB) external nonReentrant {\n        tokenA.safeTransferFrom(msg.sender, address(this), amountA);\n        tokenB.safeTransferFrom(msg.sender, address(this), amountB);\n        \n        uint256 share;\n        if (totalShares == 0) {\n            share = 100 * 1e18;\n        } else {\n            share = (amountA * totalShares) / reserveA;\n        }\n        \n        reserveA += amountA;\n        reserveB += amountB;\n        totalShares += share;\n        shares[msg.sender] += share;\n    }\n    \n    function removeLiquidity(uint256 share) external nonReentrant {\n        require(shares[msg.sender] >= share, "Insufficient shares");\n        \n        uint256 amountA = (share * reserveA) / totalShares;\n        uint256 amountB = (share * reserveB) / totalShares;\n        \n        shares[msg.sender] -= share;\n        totalShares -= share;\n        reserveA -= amountA;\n        reserveB -= amountB;\n        \n        tokenA.safeTransfer(msg.sender, amountA);\n        tokenB.safeTransfer(msg.sender, amountB);\n    }\n    \n    function swapAForB(uint256 amountA) external nonReentrant {\n        uint256 amountB = getAmountOut(amountA, reserveA, reserveB);\n        require(amountB <= reserveB, "Insufficient liquidity");\n        \n        tokenA.safeTransferFrom(msg.sender, address(this), amountA);\n        tokenB.safeTransfer(msg.sender, amountB);\n        \n        reserveA += amountA;\n        reserveB -= amountB;\n    }\n    \n    function swapBForA(uint256 amountB) external nonReentrant {\n        uint256 amountA = getAmountOut(amountB, reserveB, reserveA);\n        require(amountA <= reserveA, "Insufficient liquidity");\n        \n        tokenB.safeTransferFrom(msg.sender, address(this), amountB);\n        tokenA.safeTransfer(msg.sender, amountA);\n        \n        reserveB += amountB;\n        reserveA -= amountA;\n    }\n    \n    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {\n        require(amountIn > 0, "Insufficient input amount");\n        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");\n        \n        uint256 amountInWithFee = amountIn * (1000 - FEE_PERCENT);\n        uint256 numerator = amountInWithFee * reserveOut;\n        uint256 denominator = (reserveIn * 1000) + amountInWithFee;\n        return numerator / denominator;\n    }\n}',
      image: 'liquidity-pool'
    },
    {
      id: 'staking-rewards',
      name: 'Staking Rewards',
      description: 'A staking contract that distributes rewards to stakers proportionally to their stake.',
      category: 'defi',
      type: 'contract',
      price: 'free',
      author: 'StakingPro',
      rating: 4.7,
      downloads: 2431,
      tags: ['defi', 'staking', 'rewards'],
      content: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.17;\n\nimport "@openzeppelin/contracts/token/ERC20/IERC20.sol";\nimport "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";\nimport "@openzeppelin/contracts/security/ReentrancyGuard.sol";\nimport "@openzeppelin/contracts/access/Ownable.sol";\n\ncontract StakingRewards is ReentrancyGuard, Ownable {\n    using SafeERC20 for IERC20;\n    \n    IERC20 public stakingToken;\n    IERC20 public rewardsToken;\n    uint256 public rewardRate = 100;\n    uint256 public lastUpdateTime;\n    uint256 public rewardPerTokenStored;\n    \n    mapping(address => uint256) public userRewardPerTokenPaid;\n    mapping(address => uint256) public rewards;\n    mapping(address => uint256) public stakes;\n    uint256 public totalStaked;\n    \n    constructor(address _stakingToken, address _rewardsToken) {\n        stakingToken = IERC20(_stakingToken);\n        rewardsToken = IERC20(_rewardsToken);\n    }\n    \n    function stake(uint256 amount) external nonReentrant {\n        updateReward(msg.sender);\n        stakingToken.safeTransferFrom(msg.sender, address(this), amount);\n        stakes[msg.sender] += amount;\n        totalStaked += amount;\n    }\n    \n    function withdraw(uint256 amount) external nonReentrant {\n        require(stakes[msg.sender] >= amount, "Insufficient stake");\n        updateReward(msg.sender);\n        stakes[msg.sender] -= amount;\n        totalStaked -= amount;\n        stakingToken.safeTransfer(msg.sender, amount);\n    }\n    \n    function getReward() external nonReentrant {\n        updateReward(msg.sender);\n        uint256 reward = rewards[msg.sender];\n        if (reward > 0) {\n            rewards[msg.sender] = 0;\n            rewardsToken.safeTransfer(msg.sender, reward);\n        }\n    }\n    \n    function updateReward(address account) internal {\n        rewardPerTokenStored = rewardPerToken();\n        lastUpdateTime = block.timestamp;\n        \n        if (account != address(0)) {\n            rewards[account] = earned(account);\n            userRewardPerTokenPaid[account] = rewardPerTokenStored;\n        }\n    }\n    \n    function rewardPerToken() public view returns (uint256) {\n        if (totalStaked == 0) {\n            return rewardPerTokenStored;\n        }\n        \n        return rewardPerTokenStored + (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalStaked);\n    }\n    \n    function earned(address account) public view returns (uint256) {\n        return ((stakes[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) + rewards[account];\n    }\n    \n    function setRewardRate(uint256 _rewardRate) external onlyOwner {\n        updateReward(address(0));\n        rewardRate = _rewardRate;\n    }\n}',
      image: 'staking-rewards'
    },
    {
      id: 'dao-voting',
      name: 'DAO Voting',
      description: 'A decentralized governance system with proposal creation and voting.',
      category: 'dao',
      type: 'contract',
      price: 'free',
      author: 'DAOmaster',
      rating: 4.6,
      downloads: 1876,
      tags: ['dao', 'governance', 'voting'],
      content: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.17;\n\nimport "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";\nimport "@openzeppelin/contracts/governance/Governor.sol";\nimport "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";\nimport "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";\nimport "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";\n\ncontract GovernanceToken is ERC20Votes {\n    constructor() ERC20("Governance Token", "GOV") ERC20Permit("Governance Token") {\n        _mint(msg.sender, 1000000 * 10 ** decimals());\n    }\n\n    function _afterTokenTransfer(address from, address to, uint256 amount) internal override {\n        super._afterTokenTransfer(from, to, amount);\n    }\n\n    function _mint(address to, uint256 amount) internal override {\n        super._mint(to, amount);\n    }\n\n    function _burn(address account, uint256 amount) internal override {\n        super._burn(account, amount);\n    }\n}\n\ncontract DAOGovernor is Governor, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction {\n    constructor(IVotes _token)\n        Governor("DAO Governor")\n        GovernorVotes(_token)\n        GovernorVotesQuorumFraction(4) // 4% quorum\n    {}\n\n    function votingDelay() public pure override returns (uint256) {\n        return 1; // 1 block\n    }\n\n    function votingPeriod() public pure override returns (uint256) {\n        return 45818; // 1 week (assuming 13s block time)\n    }\n\n    function propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description)\n        public\n        override(Governor)\n        returns (uint256)\n    {\n        return super.propose(targets, values, calldatas, description);\n    }\n}',
      image: 'dao-voting'
    },
    {
      id: 'nft-marketplace',
      name: 'NFT Marketplace',
      description: 'A marketplace for buying, selling, and auctioning NFTs with royalty support.',
      category: 'marketplace',
      type: 'contract',
      price: 'free',
      author: 'NFTMarket',
      rating: 4.8,
      downloads: 3254,
      tags: ['nft', 'marketplace', 'auction'],
      content: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.17;\n\nimport "@openzeppelin/contracts/token/ERC721/IERC721.sol";\nimport "@openzeppelin/contracts/token/ERC20/IERC20.sol";\nimport "@openzeppelin/contracts/security/ReentrancyGuard.sol";\nimport "@openzeppelin/contracts/utils/Counters.sol";\nimport "@openzeppelin/contracts/access/Ownable.sol";\n\ncontract NFTMarketplace is ReentrancyGuard, Ownable {\n    using Counters for Counters.Counter;\n    \n    Counters.Counter private _listingIds;\n    \n    struct Listing {\n        uint256 id;\n        address nftContract;\n        uint256 tokenId;\n        address seller;\n        address payable royaltyRecipient;\n        uint256 price;\n        uint256 royaltyPercentage; // Out of 1000 (e.g., 25 = 2.5%)\n        bool isActive;\n    }\n    \n    mapping(uint256 => Listing) public listings;\n    uint256 public platformFee = 25; // 2.5% fee\n    \n    event Listed(uint256 listingId, address nftContract, uint256 tokenId, address seller, uint256 price);\n    event Sale(uint256 listingId, address buyer, uint256 price);\n    event ListingCancelled(uint256 listingId);\n    \n    function createListing(\n        address nftContract,\n        uint256 tokenId,\n        uint256 price,\n        address royaltyRecipient,\n        uint256 royaltyPercentage\n    ) external nonReentrant {\n        require(price > 0, "Price must be greater than 0");\n        require(royaltyPercentage <= 100, "Royalty cannot exceed 10%"); // Max 10%\n        \n        IERC721 nft = IERC721(nftContract);\n        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");\n        require(nft.isApprovedForAll(msg.sender, address(this)), "Marketplace not approved");\n        \n        _listingIds.increment();\n        uint256 listingId = _listingIds.current();\n        \n        listings[listingId] = Listing({\n            id: listingId,\n            nftContract: nftContract,\n            tokenId: tokenId,\n            seller: msg.sender,\n            royaltyRecipient: payable(royaltyRecipient),\n            price: price,\n            royaltyPercentage: royaltyPercentage,\n            isActive: true\n        });\n        \n        emit Listed(listingId, nftContract, tokenId, msg.sender, price);\n    }\n    \n    function buyNFT(uint256 listingId) external payable nonReentrant {\n        Listing storage listing = listings[listingId];\n        require(listing.isActive, "Listing is not active");\n        require(msg.value >= listing.price, "Insufficient funds");\n        \n        listing.isActive = false;\n        \n        uint256 royaltyAmount = 0;\n        if (listing.royaltyPercentage > 0 && listing.royaltyRecipient != address(0)) {\n            royaltyAmount = (listing.price * listing.royaltyPercentage) / 1000;\n            payable(listing.royaltyRecipient).transfer(royaltyAmount);\n        }\n        \n        uint256 platformFeeAmount = (listing.price * platformFee) / 1000;\n        payable(owner()).transfer(platformFeeAmount);\n        \n        uint256 sellerAmount = listing.price - royaltyAmount - platformFeeAmount;\n        payable(listing.seller).transfer(sellerAmount);\n        \n        IERC721(listing.nftContract).safeTransferFrom(listing.seller, msg.sender, listing.tokenId);\n        \n        emit Sale(listingId, msg.sender, listing.price);\n    }\n    \n    function cancelListing(uint256 listingId) external nonReentrant {\n        Listing storage listing = listings[listingId];\n        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized");\n        require(listing.isActive, "Listing is not active");\n        \n        listing.isActive = false;\n        \n        emit ListingCancelled(listingId);\n    }\n    \n    function setPlatformFee(uint256 _platformFee) external onlyOwner {\n        require(_platformFee <= 100, "Fee cannot exceed 10%"); // Max 10%\n        platformFee = _platformFee;\n    }\n}',
      image: 'nft-marketplace'
    },
    {
      id: 'game-asset',
      name: 'Game Asset Manager',
      description: 'A contract for managing game assets, items, and player inventories with on-chain verification.',
      category: 'gaming',
      type: 'contract',
      price: 'free',
      author: 'GameDev',
      rating: 4.5,
      downloads: 1345,
      tags: ['gaming', 'nft', 'items'],
      content: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.17;\n\nimport "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";\nimport "@openzeppelin/contracts/access/AccessControl.sol";\nimport "@openzeppelin/contracts/utils/Counters.sol";\n\ncontract GameAssets is ERC1155, AccessControl {\n    using Counters for Counters.Counter;\n    \n    bytes32 public constant GAME_ADMIN = keccak256("GAME_ADMIN");\n    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");\n    \n    Counters.Counter private _assetTypeIds;\n    \n    struct AssetType {\n        uint256 id;\n        string name;\n        string category; // weapon, armor, consumable, etc.\n        uint256 maxSupply;\n        uint256 currentSupply;\n        bool transferable;\n        uint256 level;\n        mapping(string => string) attributes; // e.g., "damage" => "50", "durability" => "100"\n    }\n    \n    mapping(uint256 => AssetType) public assetTypes;\n    mapping(uint256 => string) private _tokenURIs;\n    \n    event AssetTypeCreated(uint256 indexed id, string name, string category, uint256 maxSupply);\n    event AssetMinted(address indexed to, uint256 indexed assetTypeId, uint256 amount);\n    \n    constructor(string memory uri) ERC1155(uri) {\n        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);\n        _grantRole(GAME_ADMIN, msg.sender);\n        _grantRole(MINTER_ROLE, msg.sender);\n    }\n    \n    function createAssetType(\n        string memory name,\n        string memory category,\n        uint256 maxSupply,\n        bool transferable,\n        uint256 level,\n        string memory uri\n    ) public onlyRole(GAME_ADMIN) returns (uint256) {\n        _assetTypeIds.increment();\n        uint256 newAssetTypeId = _assetTypeIds.current();\n        \n        AssetType storage newAssetType = assetTypes[newAssetTypeId];\n        newAssetType.id = newAssetTypeId;\n        newAssetType.name = name;\n        newAssetType.category = category;\n        newAssetType.maxSupply = maxSupply;\n        newAssetType.currentSupply = 0;\n        newAssetType.transferable = transferable;\n        newAssetType.level = level;\n        \n        _tokenURIs[newAssetTypeId] = uri;\n        \n        emit AssetTypeCreated(newAssetTypeId, name, category, maxSupply);\n        \n        return newAssetTypeId;\n    }\n    \n    function setAssetAttribute(uint256 assetTypeId, string memory key, string memory value) public onlyRole(GAME_ADMIN) {\n        require(assetTypeId <= _assetTypeIds.current(), "Asset type does not exist");\n        assetTypes[assetTypeId].attributes[key] = value;\n    }\n    \n    function getAssetAttribute(uint256 assetTypeId, string memory key) public view returns (string memory) {\n        require(assetTypeId <= _assetTypeIds.current(), "Asset type does not exist");\n        return assetTypes[assetTypeId].attributes[key];\n    }\n    \n    function mintAsset(address to, uint256 assetTypeId, uint256 amount) public onlyRole(MINTER_ROLE) {\n        require(assetTypeId <= _assetTypeIds.current(), "Asset type does not exist");\n        AssetType storage assetType = assetTypes[assetTypeId];\n        \n        if (assetType.maxSupply > 0) {\n            require(assetType.currentSupply + amount <= assetType.maxSupply, "Would exceed max supply");\n            assetType.currentSupply += amount;\n        }\n        \n        _mint(to, assetTypeId, amount, "");\n        \n        emit AssetMinted(to, assetTypeId, amount);\n    }\n    \n    function uri(uint256 tokenId) public view override returns (string memory) {\n        return _tokenURIs[tokenId];\n    }\n    \n    function setURI(uint256 tokenId, string memory newuri) public onlyRole(GAME_ADMIN) {\n        _tokenURIs[tokenId] = newuri;\n    }\n    \n    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) internal override {\n        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);\n        \n        // Check if this is a transfer (not a mint or burn)\n        if (from != address(0) && to != address(0)) {\n            for (uint256 i = 0; i < ids.length; i++) {\n                require(assetTypes[ids[i]].transferable, "Asset is not transferable");\n            }\n        }\n    }\n    \n    // The following functions are overrides required by Solidity\n    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {\n        return super.supportsInterface(interfaceId);\n    }\n}',
      image: 'game-assets'
    }
  ];
  
  // Import a template to the project with a custom name
  const importTemplate = useMutation({
    mutationFn: async (templateData: any) => {
      const res = await apiRequest('POST', '/api/files', templateData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Template Imported',
        description: 'The template has been imported to your project.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/files/project/${projectId}`] });
      setShowTemplateDetails(false);
      setSelectedTemplate(null);
      setCustomName('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to import template. Please try again.',
        variant: 'destructive',
      });
      console.error('Import template error:', error);
    }
  });
  
  // Filter templates by category and search query
  const filteredTemplates = templates
    .filter(template => 
      (activeCategory === 'all' || template.category === activeCategory) &&
      (searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  
  // Handle template import
  const handleImportTemplate = () => {
    if (!selectedTemplate) return;
    
    if (!customName) {
      toast({
        title: 'Name Required',
        description: 'Please provide a name for the imported template.',
        variant: 'destructive',
      });
      return;
    }
    
    // Determine file extension
    let extension = '.sol';
    
    // Add extension if not already present
    const fileName = customName.endsWith(extension) ? customName : `${customName}${extension}`;
    
    importTemplate.mutate({
      name: fileName,
      projectId,
      content: selectedTemplate.content,
      fileType: 'solidity'
    });
  };
  
  // Handle template selection
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowTemplateDetails(true);
    setCustomName(template.name); // Pre-fill with template name
  };
  
  // Template card component
  const TemplateCard = ({ template }: { template: Template }) => {
    return (
      <div 
        className="rounded-lg border border-border overflow-hidden cursor-pointer hover:border-primary transition-colors"
        onClick={() => handleSelectTemplate(template)}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                template.type === 'token' ? 'bg-blue-500/20' : 'bg-purple-500/20'
              }`}>
                <i className={`${
                  template.type === 'token' ? 'ri-coin-line text-blue-500' : 'ri-file-code-line text-purple-500'
                }`}></i>
              </div>
              <h3 className="font-medium">{template.name}</h3>
            </div>
            <Badge variant={template.price === 'free' ? 'default' : 'secondary'} className="text-xs">
              {template.price === 'free' ? 'Free' : `$${template.price}`}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {template.description}
          </p>
          
          <div className="flex flex-wrap gap-1 mt-3">
            {template.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <i className="ri-user-line mr-1"></i>
              <span>{template.author}</span>
            </div>
            <div className="flex items-center">
              <i className="ri-download-line mr-1"></i>
              <span>{template.downloads.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <i className="ri-star-fill mr-1 text-yellow-500"></i>
              <span>{template.rating}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Template details modal
  const TemplateDetails = () => {
    if (!selectedTemplate) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <i className="ri-user-line mr-1"></i>
                  {selectedTemplate.author}
                </span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <i className="ri-star-fill mr-1 text-yellow-500"></i>
                  {selectedTemplate.rating}
                </span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <i className="ri-download-line mr-1"></i>
                  {selectedTemplate.downloads.toLocaleString()} downloads
                </span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => {
                setShowTemplateDetails(false);
                setSelectedTemplate(null);
              }}
            >
              <i className="ri-close-line"></i>
            </Button>
          </div>
          
          <div className="my-4">
            <p className="text-muted-foreground">
              {selectedTemplate.description}
            </p>
            
            <div className="flex flex-wrap gap-1 mt-3">
              {selectedTemplate.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="border-t border-border pt-4 mt-4">
            <h3 className="font-medium mb-2">Code Preview</h3>
            <div className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre max-h-64">
              {selectedTemplate.content}
            </div>
          </div>
          
          <div className="border-t border-border pt-4 mt-4">
            <h3 className="font-medium mb-2">Import to Project</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="custom-name" className="mb-1 block text-sm">File Name</Label>
                <Input
                  id="custom-name"
                  placeholder="Enter a name for this file"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="bg-background"
                />
              </div>
              <Button 
                onClick={handleImportTemplate}
                disabled={importTemplate.isPending}
                className="flex-shrink-0 mt-6"
              >
                {importTemplate.isPending ? 'Importing...' : 'Import Template'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <Card className="bg-muted rounded-xl border-border overflow-hidden">
        <CardHeader className="p-4 border-b border-border flex items-center justify-between">
          <CardTitle className="font-semibold">Template Marketplace</CardTitle>
          <div className="max-w-xs">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                <i className="ri-search-line"></i>
              </span>
              <Input
                placeholder="Search templates..."
                className="bg-background text-sm h-8 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as TemplateCategory)} className="mb-6">
            <TabsList className="grid grid-cols-7 mb-4">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="tokens" className="text-xs">Tokens</TabsTrigger>
              <TabsTrigger value="nft" className="text-xs">NFTs</TabsTrigger>
              <TabsTrigger value="defi" className="text-xs">DeFi</TabsTrigger>
              <TabsTrigger value="dao" className="text-xs">DAO</TabsTrigger>
              <TabsTrigger value="marketplace" className="text-xs">Marketplace</TabsTrigger>
              <TabsTrigger value="gaming" className="text-xs">Gaming</TabsTrigger>
            </TabsList>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
              
              {filteredTemplates.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <i className="ri-file-search-line text-4xl mb-2"></i>
                  <p>No templates found matching your criteria</p>
                  <p className="text-sm mt-1">Try adjusting your search or category filter</p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      {showTemplateDetails && <TemplateDetails />}
    </>
  );
}