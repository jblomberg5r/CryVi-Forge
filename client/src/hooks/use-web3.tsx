import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getEthereumProvider } from '@/lib/web3';
import { useWallet } from './use-wallet';

interface Web3ContextType {
  isMetaMaskInstalled: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  isMetaMaskInstalled: false,
});

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const { updateWalletState } = useWallet();
  
  useEffect(() => {
    const ethereum = getEthereumProvider();
    setIsMetaMaskInstalled(!!ethereum);
    
    if (ethereum) {
      // Listen for account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          updateWalletState({ isConnected: false, address: null });
        } else {
          // User switched accounts
          updateWalletState({ isConnected: true, address: accounts[0] });
        }
      };
      
      // Listen for chain changes
      const handleChainChanged = (chainId: string) => {
        updateWalletState({ chainId });
        // Force page refresh to update UI with new chain context
        window.location.reload();
      };
      
      // Add event listeners
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      
      // Check if already connected
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            updateWalletState({ 
              isConnected: true, 
              address: accounts[0] 
            });
            
            // Get chain ID
            ethereum.request({ method: 'eth_chainId' })
              .then((chainId: string) => {
                updateWalletState({ chainId });
              })
              .catch(console.error);
          }
        })
        .catch(console.error);
      
      // Cleanup listeners
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [updateWalletState]);
  
  return (
    <Web3Context.Provider value={{ isMetaMaskInstalled }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
