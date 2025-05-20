import { useState, useCallback } from 'react';
import { isEthereumSupported } from '@/lib/web3';

type WalletState = {
  isConnected: boolean;
  address: string | null;
  chainId: string | undefined;
};

// Create a global state for wallet
const walletState: WalletState = {
  isConnected: false,
  address: null,
  chainId: undefined,
};

const listeners = new Set<(state: WalletState) => void>();

const updateWalletState = (newState: Partial<WalletState>) => {
  Object.assign(walletState, newState);
  listeners.forEach(listener => listener({ ...walletState }));
};

export const useWallet = () => {
  const [state, setState] = useState<WalletState>(walletState);
  
  // Subscribe to wallet state changes
  useState(() => {
    const listener = (newState: WalletState) => {
      setState({ ...newState });
    };
    
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  });
  
  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      if (!isEthereumSupported()) {
        throw new Error('Ethereum provider not found. Please install MetaMask or another wallet.');
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please check your wallet extension.');
      }
      
      const address = accounts[0];
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      updateWalletState({ 
        isConnected: true, 
        address, 
        chainId 
      });
      
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }, []);
  
  // Disconnect wallet (this doesn't actually disconnect from MetaMask, just resets our state)
  const disconnect = useCallback(() => {
    updateWalletState({ isConnected: false, address: null });
  }, []);
  
  return {
    ...state,
    connectWallet,
    disconnect,
    updateWalletState,
  };
};
