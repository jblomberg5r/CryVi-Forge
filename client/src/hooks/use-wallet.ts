import { useState, useCallback } from 'react';
import { connectWallet as connectWalletUtil } from '@/lib/web3';

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
      const address = await connectWalletUtil();
      updateWalletState({ isConnected: true, address });
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
