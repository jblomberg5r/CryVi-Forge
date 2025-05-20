import { ethers } from 'ethers';

// Add type for Ethereum window object
declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Verifies if a wallet address is valid
 * @param address - Ethereum wallet address to verify
 * @returns boolean indicating if the address is valid
 */
export function isValidEthereumAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
}

/**
 * Formats a wallet address for display (0x1234...5678)
 * @param address - Full Ethereum wallet address
 * @returns Shortened address for display
 */
export function formatWalletAddress(address: string | null | undefined): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Gets the name of the Ethereum network from a chain ID
 * @param chainId - Chain ID in hex or decimal
 * @returns Network name
 */
export function getNetworkName(chainId: string | null): string {
  if (!chainId) return 'Unknown Network';
  
  // Convert hex to decimal if needed
  const chainIdDecimal = chainId.startsWith('0x') 
    ? parseInt(chainId, 16) 
    : parseInt(chainId);
  
  switch (chainIdDecimal) {
    case 1:
      return 'Ethereum Mainnet';
    case 5:
      return 'Goerli Testnet';
    case 11155111:
      return 'Sepolia Testnet';
    case 137:
      return 'Polygon Mainnet';
    case 80001:
      return 'Mumbai Testnet';
    case 42161:
      return 'Arbitrum One';
    case 421613:
      return 'Arbitrum Goerli';
    case 10:
      return 'Optimism';
    case 420:
      return 'Optimism Goerli';
    case 100:
      return 'Gnosis Chain';
    case 56:
      return 'Binance Smart Chain';
    case 97:
      return 'BSC Testnet';
    case 43114:
      return 'Avalanche C-Chain';
    case 43113:
      return 'Avalanche Fuji';
    case 1337:
    case 31337:
      return 'Local Network';
    default:
      return `Chain ID: ${chainIdDecimal}`;
  }
}

/**
 * Get the current chain ID from the connected wallet
 * @returns Chain ID as a string
 */
export async function getChainId(): Promise<string | null> {
  if (!isEthereumSupported()) return null;
  
  try {
    return await window.ethereum.request({ method: 'eth_chainId' });
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
}

/**
 * Get the current network from the connected wallet
 * @returns Network name
 */
export async function getCurrentNetwork(): Promise<{ chainId: string; name: string } | null> {
  const chainId = await getChainId();
  if (!chainId) return null;
  
  const network = supportedNetworks.find(n => n.chainId === chainId);
  if (network) return network;
  
  return {
    chainId,
    name: getNetworkName(chainId)
  };
}

/**
 * Check if a wallet is currently connected
 * @returns boolean indicating if a wallet is connected
 */
export async function isWalletConnected(): Promise<boolean> {
  if (!isEthereumSupported()) return false;
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
}

/**
 * Connect to a wallet and request account access
 * @returns The connected wallet address and network
 */
export async function connectWallet(): Promise<{
  address: string;
  network: string;
  chainId: string;
}> {
  if (!isEthereumSupported()) {
    throw new Error('Ethereum provider not found. Please install MetaMask or another wallet.');
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please check your wallet extension.');
    }
    
    const address = accounts[0];
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const networkName = getNetworkName(chainId);
    
    return {
      address,
      network: networkName,
      chainId
    };
  } catch (error: any) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
}

/**
 * Switch to a different network
 * @param chainId - The chain ID to switch to
 * @returns boolean indicating if the switch was successful
 */
export async function switchNetwork(chainId: string): Promise<boolean> {
  if (!isEthereumSupported()) return false;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
    return true;
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      const network = supportedNetworks.find(n => n.chainId === chainId);
      
      if (network) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId,
                chainName: network.name,
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [`https://${network.name.toLowerCase().replace(' ', '')}.infura.io/v3/`],
                blockExplorerUrls: [`https://${network.name.toLowerCase().includes('mainnet') ? '' : network.name.toLowerCase().replace(' ', '') + '.'}etherscan.io`],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
    }
    console.error('Error switching networks:', error);
    return false;
  }
}

/**
 * Creates a message to sign for wallet authentication
 * @param nonce - Unique nonce to prevent replay attacks
 * @returns Message to sign
 */
export function createAuthMessage(nonce: number | string): string {
  return `Sign this message to authenticate with CryVi Forge: ${nonce}`;
}

/**
 * Checks if the current environment supports Ethereum (has window.ethereum)
 * @returns boolean indicating if Ethereum is supported
 */
export function isEthereumSupported(): boolean {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
}

/**
 * Suggested networks for the application
 */
export const supportedNetworks = [
  { chainId: '0x1', name: 'Ethereum Mainnet' },
  { chainId: '0x5', name: 'Goerli Testnet' },
  { chainId: '0xaa36a7', name: 'Sepolia Testnet' },
  { chainId: '0x89', name: 'Polygon Mainnet' },
  { chainId: '0x13881', name: 'Mumbai Testnet' },
  { chainId: '0xa4b1', name: 'Arbitrum One' },
  { chainId: '0x66eed', name: 'Arbitrum Goerli' },
  { chainId: '0xa', name: 'Optimism' },
  { chainId: '0x1a4', name: 'Optimism Goerli' },
  { chainId: '0x38', name: 'Binance Smart Chain' },
  { chainId: '0x61', name: 'BSC Testnet' },
  { chainId: '0xa86a', name: 'Avalanche C-Chain' },
  { chainId: '0xa869', name: 'Avalanche Fuji' },
];