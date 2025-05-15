import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  files, type File, type InsertFile,
  contracts, type Contract, type InsertContract,
  tokens, type Token, type InsertToken,
  activities, type Activity, type InsertActivity
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(id: number, walletAddress: string): Promise<User | undefined>;

  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUser(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // File operations
  getFile(id: number): Promise<File | undefined>;
  getFilesByProject(projectId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, content: string): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;

  // Contract operations
  getContract(id: number): Promise<Contract | undefined>;
  getContractsByUser(userId: number): Promise<Contract[]>;
  getContractsByProject(projectId: number): Promise<Contract[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract | undefined>;

  // Token operations
  getToken(id: number): Promise<Token | undefined>;
  getTokensByUser(userId: number): Promise<Token[]>;
  createToken(token: InsertToken): Promise<Token>;
  updateToken(id: number, token: Partial<InsertToken>): Promise<Token | undefined>;

  // Activity operations
  getActivities(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private files: Map<number, File>;
  private contracts: Map<number, Contract>;
  private tokens: Map<number, Token>;
  private activities: Map<number, Activity>;
  private userId: number;
  private projectId: number;
  private fileId: number;
  private contractId: number;
  private tokenId: number;
  private activityId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.files = new Map();
    this.contracts = new Map();
    this.tokens = new Map();
    this.activities = new Map();
    this.userId = 1;
    this.projectId = 1;
    this.fileId = 1;
    this.contractId = 1;
    this.tokenId = 1;
    this.activityId = 1;

    // Add sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create a test user
    const user: User = {
      id: this.userId++,
      username: "testuser",
      password: "password123",
      walletAddress: null
    };
    this.users.set(user.id, user);

    // Create some sample projects
    const projects = [
      {
        id: this.projectId++,
        name: "NFT Marketplace",
        description: "A marketplace for buying and selling NFTs",
        userId: user.id,
        status: "active",
        createdAt: new Date()
      },
      {
        id: this.projectId++,
        name: "DeFi Staking",
        description: "A staking platform for DeFi tokens",
        userId: user.id,
        status: "draft",
        createdAt: new Date()
      },
      {
        id: this.projectId++,
        name: "DAO Voting System",
        description: "A decentralized voting system for DAOs",
        userId: user.id,
        status: "draft",
        createdAt: new Date()
      }
    ];

    projects.forEach(project => {
      this.projects.set(project.id, project);
    });

    // Create some sample files
    const files = [
      {
        id: this.fileId++,
        projectId: 1,
        name: "NFTMarket.sol",
        content: `pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// NFT Marketplace contract with listing and purchase functionality
contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;

  address payable public owner;
  uint256 public listingFee = 0.025 ether;

  struct MarketItem {
    uint256 itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
  }

  mapping(uint256 => MarketItem) private idToMarketItem;

  event MarketItemCreated (
    uint256 indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
  );
}`,
        fileType: "solidity",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: this.fileId++,
        projectId: 1,
        name: "MyNFT.sol",
        content: `pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("MyNFT", "MNFT") {}

    function mintNFT(address recipient, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}`,
        fileType: "solidity",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: this.fileId++,
        projectId: 1,
        name: "README.md",
        content: "# NFT Marketplace\n\nA decentralized marketplace for buying and selling NFTs.",
        fileType: "markdown",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    files.forEach(file => {
      this.files.set(file.id, file);
    });

    // Create some sample contracts
    const contracts = [
      {
        id: this.contractId++,
        name: "NFTMarket",
        address: "0x123abc...",
        network: "Ethereum Sepolia",
        abi: [],
        userId: user.id,
        projectId: 1,
        deployedAt: new Date()
      }
    ];

    contracts.forEach(contract => {
      this.contracts.set(contract.id, contract);
    });

    // Create some sample activities
    const activities = [
      {
        id: this.activityId++,
        userId: user.id,
        action: "deploy",
        entityType: "contract",
        entityId: 1,
        details: { name: "NFTMarket.sol", network: "Sepolia" },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: this.activityId++,
        userId: user.id,
        action: "update",
        entityType: "file",
        entityId: 2,
        details: { name: "MyNFT.sol", action: "token metadata update" },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      },
      {
        id: this.activityId++,
        userId: user.id,
        action: "create",
        entityType: "project",
        entityId: 3,
        details: { name: "DAO Voting System" },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];

    activities.forEach(activity => {
      this.activities.set(activity.id, activity);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByWalletAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.walletAddress === address);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUserWallet(id: number, walletAddress: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, walletAddress };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUser(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.userId === userId);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const newProject: Project = { 
      ...project, 
      id, 
      createdAt: new Date()
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // File operations
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByProject(projectId: number): Promise<File[]> {
    return Array.from(this.files.values())
      .filter(file => file.projectId === projectId);
  }

  async createFile(file: InsertFile): Promise<File> {
    const id = this.fileId++;
    const now = new Date();
    const newFile: File = { 
      ...file, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.files.set(id, newFile);
    return newFile;
  }

  async updateFile(id: number, content: string): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;
    
    const updatedFile = { 
      ...file, 
      content, 
      updatedAt: new Date() 
    };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  // Contract operations
  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async getContractsByUser(userId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values())
      .filter(contract => contract.userId === userId);
  }

  async getContractsByProject(projectId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values())
      .filter(contract => contract.projectId === projectId);
  }

  async createContract(contract: InsertContract): Promise<Contract> {
    const id = this.contractId++;
    const newContract: Contract = { 
      ...contract, 
      id, 
      deployedAt: new Date()
    };
    this.contracts.set(id, newContract);
    return newContract;
  }

  async updateContract(id: number, updates: Partial<InsertContract>): Promise<Contract | undefined> {
    const contract = this.contracts.get(id);
    if (!contract) return undefined;
    
    const updatedContract = { ...contract, ...updates };
    this.contracts.set(id, updatedContract);
    return updatedContract;
  }

  // Token operations
  async getToken(id: number): Promise<Token | undefined> {
    return this.tokens.get(id);
  }

  async getTokensByUser(userId: number): Promise<Token[]> {
    return Array.from(this.tokens.values())
      .filter(token => token.userId === userId);
  }

  async createToken(token: InsertToken): Promise<Token> {
    const id = this.tokenId++;
    const newToken: Token = { 
      ...token, 
      id, 
      createdAt: new Date()
    };
    this.tokens.set(id, newToken);
    return newToken;
  }

  async updateToken(id: number, updates: Partial<InsertToken>): Promise<Token | undefined> {
    const token = this.tokens.get(id);
    if (!token) return undefined;
    
    const updatedToken = { ...token, ...updates };
    this.tokens.set(id, updatedToken);
    return updatedToken;
  }

  // Activity operations
  async getActivities(userId: number, limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const newActivity: Activity = { 
      ...activity, 
      id, 
      createdAt: new Date()
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }
}

export const storage = new MemStorage();
