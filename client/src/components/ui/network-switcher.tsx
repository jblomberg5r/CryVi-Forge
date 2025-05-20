import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getNetworkName, supportedNetworks } from '@/lib/web3';
import { useWallet } from '@/providers/WalletProvider';

export function NetworkSwitcher() {
  const { chainId, provider } = useWallet();
  const [isChanging, setIsChanging] = useState(false);

  // Get network name from chain ID
  const currentNetwork = getNetworkName(chainId);

  // Function to switch networks
  const switchNetwork = async (newChainId: string) => {
    if (!provider) return;
    
    setIsChanging(true);
    
    try {
      // Check if ethereum provider is available in window
      const ethereum = window.ethereum;
      if (!ethereum) {
        console.error('Ethereum provider not available');
        return;
      }
      
      // Request network switch
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: newChainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        // Find network details
        const network = supportedNetworks.find(n => n.chainId === newChainId);
        
        if (network) {
          try {
            // Add network to MetaMask
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: newChainId,
                  chainName: network.name,
                  nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: [`https://${network.name.toLowerCase().replace(' ', '')}.infura.io/v3/`],
                  blockExplorerUrls: [`https://${network.name.toLowerCase().includes('mainnet') ? '' : network.name.toLowerCase().replace(' ', '') + '.'}etherscan.io`],
                },
              ],
            });
          } catch (addError) {
            console.error('Error adding network:', addError);
          }
        }
      } else {
        console.error('Error switching networks:', switchError);
      }
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
          {currentNetwork}
          {isChanging && (
            <div className="ml-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-56 overflow-y-auto">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Mainnets</DropdownMenuLabel>
          {supportedNetworks
            .filter(network => !network.name.toLowerCase().includes('test'))
            .map(network => (
              <DropdownMenuItem
                key={network.chainId}
                onClick={() => switchNetwork(network.chainId)}
                className="cursor-pointer"
              >
                {network.name}
                {network.chainId === chainId && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-green-500"></div>
                )}
              </DropdownMenuItem>
            ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Testnets</DropdownMenuLabel>
          {supportedNetworks
            .filter(network => network.name.toLowerCase().includes('test'))
            .map(network => (
              <DropdownMenuItem
                key={network.chainId}
                onClick={() => switchNetwork(network.chainId)}
                className="cursor-pointer"
              >
                {network.name}
                {network.chainId === chainId && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-green-500"></div>
                )}
              </DropdownMenuItem>
            ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}