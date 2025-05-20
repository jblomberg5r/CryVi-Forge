import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Define types
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  network: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

// MetaMask provider injection
const getEthereumProvider = (): any | null => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return (window as any).ethereum;
  }
  return null;
};

// Create a singleton instance for wallet state
let walletState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  network: null,
  provider: null,
  signer: null
};

// Observer pattern for state updates
const listeners = new Set<(state: WalletState) => void>();

const updateWalletState = (newState: Partial<WalletState>) => {
  walletState = { ...walletState, ...newState };
  listeners.forEach(listener => listener(walletState));
};

// Initialize wallet by checking existing connection
const initializeWallet = async () => {
  const ethereum = getEthereumProvider();
  if (!ethereum) return;

  try {
    // Check if already connected
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts && accounts.length > 0) {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      
      updateWalletState({
        isConnected: true,
        address: accounts[0],
        chainId,
        provider,
        signer
      });
    }
  } catch (error) {
    console.error('Error initializing wallet:', error);
  }
};

// Set up event listeners for wallet changes
const setupWalletEventListeners = () => {
  const ethereum = getEthereumProvider();
  if (!ethereum) return;

  // Handle account changes
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      updateWalletState({
        isConnected: false,
        address: null,
        signer: null
      });
    } else {
      // Account changed
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      updateWalletState({
        isConnected: true,
        address: accounts[0],
        signer
      });
    }
  };

  // Handle chain changes
  const handleChainChanged = async (chainId: string) => {
    // Refresh on chain change
    updateWalletState({ chainId });
    window.location.reload();
  };

  ethereum.on('accountsChanged', handleAccountsChanged);
  ethereum.on('chainChanged', handleChainChanged);

  // Cleanup function to remove listeners
  return () => {
    ethereum.removeListener('accountsChanged', handleAccountsChanged);
    ethereum.removeListener('chainChanged', handleChainChanged);
  };
};

// Initialize wallet and set up listeners
initializeWallet();
const cleanup = setupWalletEventListeners();

// The hook itself
export function useWeb3Wallet() {
  const [state, setState] = useState<WalletState>(walletState);

  // Subscribe to wallet state changes
  useEffect(() => {
    const listener = (newState: WalletState) => {
      setState({ ...newState });
    };
    
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    const ethereum = getEthereumProvider();
    if (!ethereum) {
      throw new Error('MetaMask is not installed');
    }
    
    try {
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      
      updateWalletState({
        isConnected: true,
        address: accounts[0],
        chainId,
        provider,
        signer
      });
      
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }, []);

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!state.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await state.signer.signMessage(message);
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }, [state.signer]);

  // Disconnect wallet (just resets our state, doesn't actually disconnect MetaMask)
  const disconnectWallet = useCallback(() => {
    updateWalletState({
      isConnected: false,
      address: null,
      signer: null
    });
  }, []);

  // Expose functions and state
  return {
    ...state,
    connectWallet,
    disconnectWallet,
    signMessage
  };
}