import { useCallback, useMemo } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner, Contract, ContractFactory, type ContractInterface } from 'ethers'; // Assuming ethers v6
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useSwitchChain,
  usePublicClient,
  useWalletClient,
  type Connector, // For useConnect
} from 'wagmi';
import { type Config as WagmiConfig, type PublicClient, type WalletClient } from '@wagmi/core';


// Helper to convert Viem PublicClient to Ethers Provider (ethers v6)
function publicClientToProvider(publicClient: PublicClient | undefined) {
  if (!publicClient) return undefined;
  const { chain, transport } = publicClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  // transport could be HttpTransport, WebSocketTransport etc. BrowserProvider handles this.
  return new BrowserProvider(transport, network);
}

// Helper to convert Viem WalletClient to Ethers Signer (ethers v6)
function walletClientToSigner(walletClient: WalletClient | undefined) {
  if (!walletClient) return undefined;
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  return new JsonRpcSigner(provider, account.address);
}

export function useWeb3() {
  const { address, isConnected, chainId: currentChainId, status } = useAccount();
  const { connectors, connect, error: connectError, isPending: isConnecting } = useConnect();
  const { disconnect, error: disconnectError } = useDisconnect();
  const { signMessageAsync, error: signMessageError, isPending: isSigningMessage } = useSignMessage();
  const { switchChainAsync, error: switchChainError, isPending: isSwitchingChain } = useSwitchChain();

  // Get Viem clients
  const publicClient = usePublicClient({ chainId: currentChainId });
  const { data: walletClient } = useWalletClient({ chainId: currentChainId });

  // Memoize Ethers provider and signer
  const provider = useMemo(() => publicClientToProvider(publicClient), [publicClient]);
  const signer = useMemo(() => walletClientToSigner(walletClient), [walletClient]);

  const isMetaMaskInstalled = useMemo(() => {
    return typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask;
  }, []);

  // Combine errors from various hooks
  const error = useMemo(() =>
    connectError || disconnectError || signMessageError || switchChainError || null,
    [connectError, disconnectError, signMessageError, switchChainError]
  );

  // Connect wallet function - typically AppKit button handles this, but providing for programmatic use
  const connectWallet = useCallback(async (connector?: Connector) => {
    // If a specific connector isn't provided, try the first available one or let wagmi decide
    const connectorToUse = connector || connectors[0];
    if (connectorToUse) {
      try {
        await connect({ connector: connectorToUse });
        return address; // Address might not be immediately available, caller should react to useAccount
      } catch (e) {
        console.error('Error connecting wallet:', e);
        throw e;
      }
    } else {
      throw new Error('No connector available.');
    }
  }, [connect, connectors, address]);

  // Switch network function
  const switchNetwork = useCallback(async (chainId: number) => { // chainId as number for wagmi
    if (!switchChainAsync) {
      throw new Error('Switch chain functionality not available.');
    }
    try {
      await switchChainAsync({ chainId });
      return true;
    } catch (e) {
      console.error('Error switching network:', e);
      return false;
    }
  }, [switchChainAsync]);

  // Sign message function
  const signMessage = useCallback(async (message: string) => {
    if (!signMessageAsync) {
      throw new Error('Sign message functionality not available.');
    }
    try {
      return await signMessageAsync({ message });
    } catch (e) {
      console.error('Error signing message:', e);
      throw e;
    }
  }, [signMessageAsync]);

  // Get contract instance
  const getContract = useCallback((contractAddress: string, abi: ContractInterface) => {
    if (!provider && !signer) throw new Error('Provider or Signer not available');
    // Prefer signer if available (for transactions), otherwise provider (for read-only)
    return new Contract(contractAddress, abi, signer || provider);
  }, [provider, signer]);

  // Deploy contract function
  const deployContract = useCallback(async (abi: ContractInterface, bytecode: string, ...args: any[]) => {
    if (!signer) throw new Error('Signer not available for deploying contract');
    
    try {
      const factory = new ContractFactory(abi, bytecode, signer);
      const contract = await factory.deploy(...args);
      // ethers v6: contract.waitForDeployment() instead of contract.deployed()
      await contract.waitForDeployment();
      return {
        address: await contract.getAddress(), // ethers v6: contract.getAddress()
        contract
      };
    } catch (e) {
      console.error('Error deploying contract:', e);
      throw e; // Or handle error state appropriately
    }
  }, [signer]);

  return {
    provider,
    signer,
    isConnected: status === 'connected', // More reliable status check
    address,
    chainId: currentChainId ? Number(currentChainId) : null, // Ensure chainId is a number or null
    error,
    isMetaMaskInstalled,
    connectWallet,
    switchNetwork,
    disconnect,
    signMessage,
    getContract,
    deployContract,
    isLoading: isConnecting || isSwitchingChain || isSigningMessage, // Consolidate loading states
    connectors, // Expose available connectors
  };
}

// Default export for convenience, if preferred by the project structure
export default useWeb3;
