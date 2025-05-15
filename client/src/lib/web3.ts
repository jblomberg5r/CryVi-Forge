import { ethers } from 'ethers';

// For ethers v5
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
  if (typeof window !== 'undefined' && window.ethereum) {
    return window.ethereum as EthereumProvider;
  }
  return null;
};

// Get ethers provider
export const getProvider = () => {
  const ethereum = getEthereumProvider();
  if (!ethereum) return null;
  
  return new ethers.providers.Web3Provider(ethereum as any);
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
    
    return accounts[0];
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

// Switch network
export const switchNetwork = async (chainId: string) => {
  const ethereum = getEthereumProvider();
  if (!ethereum) return false;
  
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
    
    return true;
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      // Add network logic would go here
      console.error('Network not added to MetaMask');
    }
    console.error('Error switching network:', error);
    return false;
  }
};

// Compile and deploy contract (mock implementation)
export const deployContract = async (abi: any[], bytecode: string, args: any[] = []) => {
  const provider = getProvider();
  if (!provider) throw new Error('Provider not available');
  
  const signer = provider.getSigner();
  
  // Create contract factory
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  
  // Deploy contract
  const contract = await factory.deploy(...args);
  
  // Wait for deployment to finish
  await contract.deployed();
  
  return contract.address;
};

// Get contract instance
export const getContract = (address: string, abi: any[]) => {
  const provider = getProvider();
  if (!provider) throw new Error('Provider not available');
  
  return new ethers.Contract(address, abi, provider);
};

// Get contract with signer
export const getContractWithSigner = (address: string, abi: any[]) => {
  const provider = getProvider();
  if (!provider) throw new Error('Provider not available');
  
  const signer = provider.getSigner();
  return new ethers.Contract(address, abi, signer);
};
