import { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel 
} from '@/components/ui/select';
import { getMainnetNetworks, getTestnetNetworks, BlockchainNetwork } from '@/lib/chains';
import { switchNetwork, getCurrentNetwork } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

interface NetworkSwitcherProps {
  showTestnets?: boolean;
  onNetworkChange?: (networkId: string) => void;
  className?: string;
}

export function NetworkSwitcher({ 
  showTestnets = true, 
  onNetworkChange,
  className = ''
}: NetworkSwitcherProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [currentNetwork, setCurrentNetwork] = useState<BlockchainNetwork | null>(null);
  const [isChangingNetwork, setIsChangingNetwork] = useState(false);
  const mainnetNetworks = getMainnetNetworks();
  const testnetNetworks = showTestnets ? getTestnetNetworks() : [];
  const { toast } = useToast();

  useEffect(() => {
    // Get the current network when component mounts
    const fetchCurrentNetwork = async () => {
      try {
        const network = await getCurrentNetwork();
        setCurrentNetwork(network);
        if (network) {
          setSelectedNetwork(network.id);
        }
      } catch (error) {
        console.error('Error fetching current network:', error);
      }
    };

    fetchCurrentNetwork();
    
    // Setup event listener for chain changes
    const handleChainChanged = async () => {
      const network = await getCurrentNetwork();
      setCurrentNetwork(network);
      if (network) {
        setSelectedNetwork(network.id);
        if (onNetworkChange) {
          onNetworkChange(network.id);
        }
      }
    };
    
    const ethereum = (window as any).ethereum;
    if (ethereum) {
      ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      if (ethereum) {
        ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [onNetworkChange]);

  const handleNetworkChange = async (value: string) => {
    if (value === selectedNetwork) return;
    
    setIsChangingNetwork(true);
    
    try {
      const result = await switchNetwork(value);
      
      if (result.success) {
        setSelectedNetwork(value);
        if (result.network) {
          setCurrentNetwork(result.network);
          
          toast({
            title: 'Network Changed',
            description: `Successfully switched to ${result.network.name}`,
          });
        } else {
          // If we don't have network info in the result, try to get the current network
          const network = await getCurrentNetwork();
          if (network) {
            setCurrentNetwork(network);
            toast({
              title: 'Network Changed',
              description: `Successfully switched to ${network.name}`,
            });
          } else {
            toast({
              title: 'Network Changed',
              description: 'Successfully switched networks',
            });
          }
        }
        
        if (onNetworkChange) {
          onNetworkChange(value);
        }
      } else {
        toast({
          title: 'Network Change Failed',
          description: 'There was an error switching networks',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Network Change Failed',
        description: error.message || 'There was an error switching networks',
        variant: 'destructive',
      });
    } finally {
      setIsChangingNetwork(false);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Select
        value={selectedNetwork}
        onValueChange={handleNetworkChange}
        disabled={isChangingNetwork}
      >
        <SelectTrigger className="w-[180px] bg-muted-foreground/10">
          <SelectValue placeholder="Select Network">
            {currentNetwork ? (
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: currentNetwork.color }}
                />
                {currentNetwork.name}
              </div>
            ) : (
              "Select Network"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Mainnet</SelectLabel>
            {mainnetNetworks.map((network) => (
              <SelectItem key={network.id} value={network.id}>
                <div className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: network.color }}
                  />
                  {network.name}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          
          {showTestnets && testnetNetworks.length > 0 && (
            <SelectGroup>
              <SelectLabel>Testnet</SelectLabel>
              {testnetNetworks.map((network) => (
                <SelectItem key={network.id} value={network.id}>
                  <div className="flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-2" 
                      style={{ backgroundColor: network.color }}
                    />
                    {network.name}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}