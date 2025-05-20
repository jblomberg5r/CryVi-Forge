import { ethers } from 'ethers';
import { 
  BlockchainNetwork, 
  getNetworkById, 
  getNetworkByChainId, 
  getDefaultNetwork, 
  SUPPORTED_NETWORKS 
} from './chains';

// For ethers v6
type EthereumProvider = {
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  request: (request: { method: string; params?: any[] }) => Promise<any>;
  isMetaMask?: boolean;
  isConnected?: () => boolean;
  networkVersion?: string;
  chainId?: string;
};

// MetaMask provider injection
export const getEthereumProvider = (): EthereumProvider | null => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return (window as any).ethereum as EthereumProvider;
  }
  return null;
};

// Get ethers provider
export const getProvider = (networkId?: string) => {
  // If networkId is provided, use the RPC URL for that network
  if (networkId) {
    const network = getNetworkById(networkId);
    if (network) {
      return new ethers.JsonRpcProvider(network.rpcUrl);
    }
  }
  
  // Default to injected provider (MetaMask)
  const ethereum = getEthereumProvider();
  if (!ethereum) return null;
  
  return new ethers.BrowserProvider(ethereum as any);
};

// Connect wallet
export const connectWallet = async () => {
  const ethereum = getEthereumProvider();
  if (!ethereum) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });
    
    // Also get the current chain ID
    const chainId = await ethereum.request({
      method: 'eth_chainId',
    });
    
    const network = getNetworkByChainId(chainId as string);
    
    return {
      address: accounts[0],
      chainId,
      network: network?.name || 'Unknown Network'
    };
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    throw error;
  }
};

// Check if wallet is connected
export const isWalletConnected = async () => {
  const ethereum = getEthereumProvider();
  if (!ethereum) return false;
  
  try {
    const accounts = await ethereum.request({
      method: 'eth_accounts',
    });
    
    return accounts && accounts.length > 0;
  } catch (error) {
    console.error('Error checking if wallet is connected:', error);
    return false;
  }
};

// Get chain ID
export const getChainId = async () => {
  const ethereum = getEthereumProvider();
  if (!ethereum) return null;
  
  try {
    const chainId = await ethereum.request({
      method: 'eth_chainId',
    });
    
    return chainId;
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
};

// Get current network
export const getCurrentNetwork = async (): Promise<BlockchainNetwork | null> => {
  const chainId = await getChainId();
  if (!chainId) return null;
  
  const network = getNetworkByChainId(chainId as string);
  return network || null;
};

// Add network to MetaMask
export const addNetwork = async (networkId: string) => {
  const ethereum = getEthereumProvider();
  if (!ethereum) {
    throw new Error('MetaMask is not installed');
  }
  
  const network = getNetworkById(networkId);
  if (!network) {
    throw new Error(`Network ${networkId} not supported`);
  }
  
  try {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: network.chainId,
        chainName: network.name,
        nativeCurrency: network.nativeCurrency,
        rpcUrls: [network.rpcUrl],
        blockExplorerUrls: [network.blockExplorerUrl]
      }]
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding network:', error);
    return { success: false, error };
  }
};

// Switch network
export const switchNetwork = async (networkId: string): Promise<{ 
  success: boolean; 
  network?: BlockchainNetwork;
  error?: any;
}> => {
  const ethereum = getEthereumProvider();
  if (!ethereum) {
    throw new Error('MetaMask is not installed');
  }
  
  const network = getNetworkById(networkId);
  if (!network) {
    throw new Error(`Network ${networkId} not supported`);
  }
  
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }],
    });
    
    return { success: true, network };
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      return addNetwork(networkId);
    }
    console.error('Error switching network:', error);
    return { success: false, error };
  }
};

// Compile and deploy contract with multi-chain support
export const deployContract = async (
  abi: any[], 
  bytecode: string, 
  args: any[] = [], 
  networkId?: string
) => {
  let provider;
  
  // If networkId is provided, use that network's provider
  if (networkId) {
    provider = getProvider(networkId);
  } else {
    // Otherwise use the injected provider (MetaMask)
    provider = getProvider();
  }
  
  if (!provider) throw new Error('Provider not available');
  
  try {
    const signer = await provider.getSigner();
    
    // Create contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    
    // Deploy contract
    const contract = await factory.deploy(...args);
    
    // Wait for deployment to be mined
    await contract.waitForDeployment();
    
    // Get the deployed contract address
    const contractAddress = await contract.getAddress();
    
    // Get deployment transaction
    const tx = contract.deploymentTransaction();
    const transactionHash = tx ? tx.hash : '';
    
    // Get current chain ID to include info about the network
    const chainId = await getChainId();
    const network = getNetworkByChainId(chainId as string);
    
    return {
      success: true,
      address: contractAddress,
      transactionHash,
      network: network?.name || 'Unknown Network',
      contract
    };
  } catch (error) {
    console.error('Error deploying contract:', error);
    return { success: false, error };
  }
};

// Get contract instance with multi-chain support
export const getContract = async (address: string, abi: any[], networkId?: string) => {
  let provider;
  
  // If networkId is provided, use that network's provider
  if (networkId) {
    provider = getProvider(networkId);
  } else {
    // Otherwise use the injected provider (MetaMask)
    provider = getProvider();
  }
  
  if (!provider) throw new Error('Provider not available');
  
  return new ethers.Contract(address, abi, provider);
};

// Get contract with signer for transactions
export const getContractWithSigner = async (address: string, abi: any[]) => {
  const provider = getProvider();
  if (!provider) throw new Error('Provider not available');
  
  const signer = await provider.getSigner();
  return new ethers.Contract(address, abi, signer);
};
