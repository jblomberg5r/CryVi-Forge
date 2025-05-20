import React, { createContext, useContext, useEffect, useState } from 'react';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { mainnet, sepolia, polygon, polygonMumbai, arbitrum } from 'wagmi/chains';
import { WagmiConfig, useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Define the supported chains
const chains = [mainnet, sepolia, polygon, polygonMumbai, arbitrum];

// 2. Create wagmi config
const projectId = '4fae85e6004ec9f5eef6a89a01e02e81'; // Demo Project ID - REPLACE with env var in production

const metadata = {
  name: 'CryVi Forge',
  description: 'Web3 Development Platform for Smart Contracts and Tokens',
  url: 'https://cryviforge.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata
});

// 3. Create modal
if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig,
    projectId,
    chains,
    themeMode: 'light',
    themeVariables: {
      '--w3m-accent': '#6366f1',
      '--w3m-border-radius-master': '8px'
    }
  });
}

// 4. Create query client for React Query
const queryClient = new QueryClient();

// 5. Create context for wallet state
interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType>({
  address: undefined,
  isConnected: false,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  signMessage: async () => { return ''; }
});

// 6. Create the wallet provider component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletProviderInner>
          {children}
        </WalletProviderInner>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

function WalletProviderInner({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { connectAsync, isPending } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [isConnecting, setIsConnecting] = useState(false);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      await connectAsync();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async () => {
    try {
      await disconnectAsync();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  // Sign message function
  const signMessage = async (message: string): Promise<string> => {
    try {
      return await signMessageAsync({ message });
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  };

  // Create the wallet context value
  const contextValue: WalletContextType = {
    address,
    isConnected: !!isConnected,
    isConnecting: isPending || isConnecting,
    connectWallet,
    disconnectWallet,
    signMessage
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

// 7. Hook to use the wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}