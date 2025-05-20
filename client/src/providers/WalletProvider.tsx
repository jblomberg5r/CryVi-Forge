import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Define the Ethereum window provider type
type EthereumProvider = {
  isMetaMask?: boolean;
  isWalletConnect?: boolean;
  request: (request: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  selectedAddress?: string;
  chainId?: string;
};

// Define wallet state interface
interface WalletState {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  providerType: 'metamask' | 'walletconnect' | null;
}

// Create the wallet context
interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string>;
  isConnecting: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  chainId: null,
  isConnected: false,
  provider: null,
  signer: null,
  providerType: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  signMessage: async () => '',
  isConnecting: false,
  error: null
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    provider: null,
    signer: null,
    providerType: null
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get Ethereum provider if available
  const getEthereumProvider = (): EthereumProvider | null => {
    if (typeof window !== 'undefined') {
      return (window as any).ethereum as EthereumProvider || null;
    }
    return null;
  };

  // Connect to wallet (supports both MetaMask and future WalletConnect)
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // First, try connecting to MetaMask
      const ethereum = getEthereumProvider();
      
      if (!ethereum) {
        // If MetaMask is not available, show dialog with options
        if (confirm('MetaMask not detected. Would you like to use WalletConnect instead?')) {
          // In a future implementation, this would initialize WalletConnect
          alert('WalletConnect integration is coming soon! Please install MetaMask to use wallet features.');
        } else {
          throw new Error('No wallet provider found. Please install MetaMask or try again later for WalletConnect support.');
        }
        return;
      }
      
      // Request accounts
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please check your wallet extension.');
      }
      
      // Get chain ID
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      // Determine wallet type
      const providerType = ethereum.isMetaMask ? 'metamask' : 'walletconnect';
      
      // Update wallet state
      setWallet({
        address: accounts[0],
        chainId: chainId as string,
        isConnected: true,
        provider,
        signer,
        providerType
      });
      
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWallet({
      address: null,
      chainId: null,
      isConnected: false,
      provider: null,
      signer: null,
      providerType: null
    });
  };

  // Sign message with wallet
  const signMessage = async (message: string): Promise<string> => {
    if (!wallet.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await wallet.signer.signMessage(message);
    } catch (err: any) {
      console.error('Error signing message:', err);
      throw new Error(err.message || 'Failed to sign message');
    }
  };

  // Set up event listeners for wallet events
  useEffect(() => {
    const ethereum = getEthereumProvider();
    if (!ethereum) return;
    
    // Handle account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnectWallet();
      } else if (wallet.address !== accounts[0]) {
        // Account changed, update wallet state
        setWallet(prev => ({
          ...prev,
          address: accounts[0]
        }));
      }
    };
    
    // Handle chain changes
    const handleChainChanged = (chainId: string) => {
      window.location.reload();
    };
    
    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);
    
    // Auto-connect if previously connected
    const checkConnection = async () => {
      try {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          connectWallet();
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };
    
    checkConnection();
    
    // Clean up event listeners
    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [wallet.address]);

  // Create the context value
  const contextValue: WalletContextType = {
    ...wallet,
    connectWallet,
    disconnectWallet,
    signMessage,
    isConnecting,
    error
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

// Hook to use the wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}