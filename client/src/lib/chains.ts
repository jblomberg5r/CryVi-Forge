// Define blockchain network type
export type BlockchainNetwork = {
  id: string;
  name: string;
  chainId: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrl: string;
  logoUrl: string;
  testnet: boolean;
  color: string;
};

// Supported networks configuration
export const SUPPORTED_NETWORKS: Record<string, BlockchainNetwork> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    chainId: '0x1',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://etherscan.io',
    logoUrl: 'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp',
    testnet: false,
    color: '#627EEA',
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    chainId: '0x89',
    rpcUrl: 'https://polygon-rpc.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrl: 'https://polygonscan.com',
    logoUrl: 'https://polygon.technology/favicon.ico',
    testnet: false,
    color: '#8247E5',
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    chainId: '0xa4b1',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://arbiscan.io',
    logoUrl: 'https://arbitrum.io/wp-content/uploads/2023/03/cropped-cropped-Arbitrum_Favicon-32x32.png',
    testnet: false,
    color: '#28A0F0',
  },
  optimism: {
    id: 'optimism',
    name: 'Optimism',
    chainId: '0xa',
    rpcUrl: 'https://mainnet.optimism.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://optimistic.etherscan.io',
    logoUrl: 'https://optimism.io/images/favicon.ico',
    testnet: false,
    color: '#FF0420',
  },
  binance: {
    id: 'binance',
    name: 'BNB Smart Chain',
    chainId: '0x38',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    blockExplorerUrl: 'https://bscscan.com',
    logoUrl: 'https://www.bnbchain.org/favicon.ico',
    testnet: false,
    color: '#F3BA2F',
  },
  avalanche: {
    id: 'avalanche',
    name: 'Avalanche',
    chainId: '0xa86a',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
    blockExplorerUrl: 'https://snowtrace.io',
    logoUrl: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
    testnet: false,
    color: '#E84142',
  },
  base: {
    id: 'base',
    name: 'Base',
    chainId: '0x2105',
    rpcUrl: 'https://mainnet.base.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://basescan.org',
    logoUrl: 'https://avatars.githubusercontent.com/u/108554348',
    testnet: false,
    color: '#0052FF',
  },
  // Testnets
  goerli: {
    id: 'goerli',
    name: 'Goerli Testnet',
    chainId: '0x5',
    rpcUrl: 'https://goerli.infura.io/v3/',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://goerli.etherscan.io',
    logoUrl: 'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp',
    testnet: true,
    color: '#627EEA',
  },
  sepolia: {
    id: 'sepolia',
    name: 'Sepolia Testnet',
    chainId: '0xaa36a7',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    logoUrl: 'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp',
    testnet: true,
    color: '#627EEA',
  },
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai Testnet',
    chainId: '0x13881',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    logoUrl: 'https://polygon.technology/favicon.ico',
    testnet: true,
    color: '#8247E5',
  },
  'bsc-testnet': {
    id: 'bsc-testnet',
    name: 'BNB Testnet',
    chainId: '0x61',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'tBNB',
      decimals: 18,
    },
    blockExplorerUrl: 'https://testnet.bscscan.com',
    logoUrl: 'https://www.bnbchain.org/favicon.ico',
    testnet: true,
    color: '#F3BA2F',
  },
  'arbitrum-goerli': {
    id: 'arbitrum-goerli',
    name: 'Arbitrum Goerli',
    chainId: '0x66eed',
    rpcUrl: 'https://goerli-rollup.arbitrum.io/rpc',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://goerli.arbiscan.io',
    logoUrl: 'https://arbitrum.io/wp-content/uploads/2023/03/cropped-cropped-Arbitrum_Favicon-32x32.png',
    testnet: true,
    color: '#28A0F0',
  },
  'optimism-goerli': {
    id: 'optimism-goerli',
    name: 'Optimism Goerli',
    chainId: '0x1a4',
    rpcUrl: 'https://goerli.optimism.io',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://goerli-optimism.etherscan.io',
    logoUrl: 'https://optimism.io/images/favicon.ico',
    testnet: true,
    color: '#FF0420',
  },
  'avalanche-fuji': {
    id: 'avalanche-fuji',
    name: 'Avalanche Fuji',
    chainId: '0xa869',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    blockExplorerUrl: 'https://testnet.snowtrace.io',
    logoUrl: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
    testnet: true,
    color: '#E84142',
  },
  'base-goerli': {
    id: 'base-goerli',
    name: 'Base Goerli',
    chainId: '0x14a33',
    rpcUrl: 'https://goerli.base.org',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://goerli.basescan.org',
    logoUrl: 'https://avatars.githubusercontent.com/u/108554348',
    testnet: true,
    color: '#0052FF',
  },
};

// Get all networks
export const getAllNetworks = (): BlockchainNetwork[] => {
  return Object.values(SUPPORTED_NETWORKS);
};

// Get network by id
export const getNetworkById = (id: string): BlockchainNetwork | undefined => {
  return SUPPORTED_NETWORKS[id];
};

// Get network by chainId
export const getNetworkByChainId = (chainId: string): BlockchainNetwork | undefined => {
  return Object.values(SUPPORTED_NETWORKS).find(network => network.chainId === chainId);
};

// Get all mainnet networks
export const getMainnetNetworks = (): BlockchainNetwork[] => {
  return Object.values(SUPPORTED_NETWORKS).filter(network => !network.testnet);
};

// Get all testnet networks
export const getTestnetNetworks = (): BlockchainNetwork[] => {
  return Object.values(SUPPORTED_NETWORKS).filter(network => network.testnet);
};

// Get default network
export const getDefaultNetwork = (): BlockchainNetwork => {
  return SUPPORTED_NETWORKS.ethereum;
};