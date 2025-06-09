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
import { useWeb3 } from '@/hooks/use-web3'; // Changed import

export function NetworkSwitcher() {
  const { chainId, switchNetwork: switchToChain, isLoading } = useWeb3(); // Changed hook and properties
  // const [isChanging, setIsChanging] = useState(false); // isLoading from useWeb3 can be used

  // Get network name from chain ID
  const currentNetwork = getNetworkName(chainId ? chainId.toString() : null);

  // Function to switch networks
  const handleSwitchNetwork = async (newChainIdHex: string) => {
    // `useWeb3().switchNetwork` expects a number
    const newChainIdDecimal = parseInt(newChainIdHex, 16);
    
    // setIsChanging(true); // Handled by useWeb3().isLoading
    try {
      await switchToChain(newChainIdDecimal);
    } catch (error) {
      console.error('Error switching network:', error);
      // TODO: Handle errors, e.g., display a toast notification
      // The "add chain" logic previously here is now omitted.
      // Wagmi/AppKit might handle this, or useWeb3 might need enhancement.
    } finally {
      // setIsChanging(false); // Handled by useWeb3().isLoading
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" disabled={isLoading}>
          <div className={`w-2 h-2 rounded-full mr-1 ${chainId ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {currentNetwork}
          {isLoading && (
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
                onClick={() => handleSwitchNetwork(network.chainId)}
                className="cursor-pointer"
                disabled={isLoading || (chainId ? parseInt(network.chainId, 16) === chainId : false)}
              >
                {network.name}
                {(chainId && parseInt(network.chainId, 16) === chainId) && (
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
                onClick={() => handleSwitchNetwork(network.chainId)}
                className="cursor-pointer"
                disabled={isLoading || (chainId ? parseInt(network.chainId, 16) === chainId : false)}
              >
                {network.name}
                {(chainId && parseInt(network.chainId, 16) === chainId) && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-green-500"></div>
                )}
              </DropdownMenuItem>
            ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}