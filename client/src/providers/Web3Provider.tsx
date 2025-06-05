import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { getNetworkByChainId } from '@/lib/chains';

interface Web3ContextType {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: string) => Promise<boolean>;
  signMessage: (message: string) => Promise<string>;
  getContract: (address: string, abi: ethers.InterfaceAbi) => ethers.Contract;
  estimateGas: (tx: ethers.TransactionRequest) => Promise<bigint>;
  isConnecting: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({
    isConnected: false,
    address: null as string | null,
    chainId: null as string | null,
    provider: null as ethers.BrowserProvider | null,
    signer: null as ethers.JsonRpcSigner | null
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize provider and check connection
  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();
          
          setState({
            isConnected: true,
            address,
            chainId: '0x' + network.chainId.toString(16),
            provider,
            signer
          });
        }
      }
    };

    init();
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('No Web3 provider detected. Please install MetaMask.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setState({
        isConnected: true,
        address,
        chainId: '0x' + network.chainId.toString(16),
        provider,
        signer
      });

      toast({
        title: 'Wallet Connected',
        description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Connection Failed',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setState({
      isConnected: false,
      address: null,
      chainId: null,
      provider: null,
      signer: null
    });
  };

  // Switch network
  const switchNetwork = async (chainId: string) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      });
      
      const network = getNetworkByChainId(chainId);
      if (network) {
        toast({
          title: 'Network Changed',
          description: `Switched to ${network.name}`
        });
      }
      
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        const network = getNetworkByChainId(chainId);
        if (network) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId,
                chainName: network.name,
                nativeCurrency: network.nativeCurrency,
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [network.blockExplorerUrl]
              }]
            });
            return true;
          } catch (addError) {
            console.error('Error adding network:', addError);
            return false;
          }
        }
      }
      console.error('Error switching network:', error);
      return false;
    }
  };

  // Sign message
  const signMessage = async (message: string): Promise<string> => {
    if (!state.signer) {
      throw new Error('Wallet not connected');
    }
    return await state.signer.signMessage(message);
  };

  // Get contract instance
  const getContract = (address: string, abi: ethers.InterfaceAbi): ethers.Contract => {
    if (!state.provider) {
      throw new Error('Provider not available');
    }
    return new ethers.Contract(address, abi, state.signer || state.provider);
  };

  // Estimate gas
  const estimateGas = async (tx: ethers.TransactionRequest): Promise<bigint> => {
    if (!state.provider) {
      throw new Error('Provider not available');
    }
    return await state.provider.estimateGas(tx);
  };

  // Set up event listeners
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (state.address !== accounts[0]) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setState({
            isConnected: true,
            address: accounts[0],
            chainId: '0x' + network.chainId.toString(16),
            provider,
            signer
          });
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [state.address]);

  const value = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    signMessage,
    getContract,
    estimateGas,
    isConnecting,
    error
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}