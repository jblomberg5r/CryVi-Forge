import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { NetworkSelector } from '@/components/ui/network-selector';
import { connectWallet, isWalletConnected, getCurrentNetwork } from '@/lib/web3';
import { getNetworkByChainId } from '@/lib/chains';
import { useToast } from '@/hooks/use-toast';

interface WalletConnectProps {
  showNetworkSelector?: boolean;
  className?: string;
}

export function WalletConnect({ 
  showNetworkSelector = true,
  className = ''
}: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const connected = await isWalletConnected();
        
        if (connected) {
          const ethereum = (window as any).ethereum;
          if (ethereum?.selectedAddress) {
            setAddress(ethereum.selectedAddress);
          }
          
          // Get current network
          const chainId = await ethereum.request({ method: 'eth_chainId' });
          const network = getNetworkByChainId(chainId);
          if (network) {
            setNetworkName(network.name);
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };
    
    checkWalletConnection();
    
    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(null);
      } else {
        setAddress(accounts[0]);
      }
    };
    
    // Listen for chain changes
    const handleChainChanged = async () => {
      const network = await getCurrentNetwork();
      setNetworkName(network?.name || null);
      
      toast({
        title: 'Network Changed',
        description: `You are now connected to ${network?.name || 'Unknown Network'}`,
      });
    };
    
    const ethereum = (window as any).ethereum;
    if (ethereum) {
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      if (ethereum) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [toast]);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      const response = await connectWallet();
      if (response.address) {
        setAddress(response.address);
        setNetworkName(response.network);
        
        toast({
          title: 'Wallet Connected',
          description: `Connected to ${shortenAddress(response.address)}`,
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Could not connect to wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showNetworkSelector && address && (
        <NetworkSelector 
          showTestnets={true}
          className="mr-2"
        />
      )}
      
      {address ? (
        <Button variant="outline" className="bg-muted-foreground/10 font-mono">
          {networkName && (
            <span className="mr-2 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
              {networkName}
            </span>
          )}
          {shortenAddress(address)}
        </Button>
      ) : (
        <Button 
          onClick={handleConnectWallet}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <span className="mr-2 animate-spin">↻</span>
              Connecting...
            </>
          ) : (
            'Connect Wallet'
          )}
        </Button>
      )}
    </div>
  );
}