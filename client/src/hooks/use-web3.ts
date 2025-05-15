import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Types for Ethereum/MetaMask
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: Array<any> }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    chainId?: string;
    networkVersion?: string;
  };
}

// Define types for our hook state
interface Web3State {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  error: Error | null;
  isMetaMaskInstalled: boolean;
}

// Initial state
const initialState: Web3State = {
  provider: null,
  signer: null,
  isConnected: false,
  address: null,
  chainId: null,
  error: null,
  isMetaMaskInstalled: false
};

// Hook that provides access to Web3 functionality
export function useWeb3() {
  const [state, setState] = useState<Web3State>(initialState);

  // Initialize web3 on component mount
  useEffect(() => {
    const init = async () => {
      // Check if MetaMask is installed
      const isMetaMaskInstalled = typeof window !== 'undefined' && 
                                  !!window.ethereum && 
                                  !!window.ethereum.isMetaMask;
      
      setState(prev => ({ ...prev, isMetaMaskInstalled }));

      if (isMetaMaskInstalled) {
        try {
          // Create ethers provider from MetaMask
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          
          // Check if already connected
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            const { chainId } = await provider.getNetwork();
            
            setState({
              provider,
              signer,
              isConnected: true,
              address,
              chainId: '0x' + chainId.toString(16), // Convert to hex format
              error: null,
              isMetaMaskInstalled
            });
          } else {
            setState(prev => ({ 
              ...prev, 
              provider,
              isConnected: false 
            }));
          }
        } catch (error) {
          console.error("Failed to initialize web3:", error);
          setState(prev => ({ 
            ...prev, 
            error: error as Error 
          }));
        }
      }
    };

    init();

    // Setup event listeners for account and chain changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User logged out
          setState(prev => ({
            ...prev,
            isConnected: false,
            address: null,
            signer: null
          }));
        } else {
          // Account changed, update state
          setState(prev => {
            if (!prev.provider) return prev;
            
            const signer = prev.provider.getSigner();
            return {
              ...prev,
              signer,
              isConnected: true,
              address: accounts[0]
            };
          });
        }
      };

      const handleChainChanged = (chainId: string) => {
        // Chain changed, refresh provider and update state
        setState(prev => {
          if (!window.ethereum) return prev;
          
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          
          return {
            ...prev,
            provider,
            signer,
            chainId
          };
        });
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const { chainId } = await provider.getNetwork();

      setState({
        provider,
        signer,
        isConnected: true,
        address,
        chainId: '0x' + chainId.toString(16),
        error: null,
        isMetaMaskInstalled: true
      });

      return address;
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      setState(prev => ({
        ...prev,
        error: error as Error
      }));
      throw error;
    }
  }, []);

  // Switch network function
  const switchNetwork = useCallback(async (chainId: string) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      });
      return true;
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        // You could implement adding the network here
        console.error('Network not available in MetaMask, consider adding it');
      }
      console.error('Error switching network:', error);
      setState(prev => ({
        ...prev,
        error: error as Error
      }));
      return false;
    }
  }, []);

  // Disconnect wallet (reset state)
  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      address: null,
      signer: null
    }));
  }, []);

  // Get contract instance
  const getContract = useCallback((address: string, abi: ethers.ContractInterface) => {
    if (!state.provider) throw new Error('Provider not available');
    
    return new ethers.Contract(
      address,
      abi,
      state.signer || state.provider
    );
  }, [state.provider, state.signer]);

  // Deploy contract function
  const deployContract = useCallback(async (
    abi: ethers.ContractInterface,
    bytecode: string,
    args: any[] = []
  ) => {
    if (!state.signer) throw new Error('Signer not available');
    
    try {
      const factory = new ethers.ContractFactory(abi, bytecode, state.signer);
      const contract = await factory.deploy(...args);
      
      // Wait for deployment to complete
      await contract.deployed();
      
      return {
        address: contract.address,
        contract
      };
    } catch (error) {
      console.error('Error deploying contract:', error);
      setState(prev => ({
        ...prev,
        error: error as Error
      }));
      throw error;
    }
  }, [state.signer]);

  return {
    ...state,
    connectWallet,
    switchNetwork,
    disconnect,
    getContract,
    deployContract
  };
}

export default useWeb3;
