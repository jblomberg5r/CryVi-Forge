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
import { Button } from '@/components/ui/button';
import { getMainnetNetworks, getTestnetNetworks, BlockchainNetwork } from '@/lib/chains';
import { switchNetwork, getChainId } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

interface ChainSelectorProps {
  showTestnets?: boolean;
  onNetworkChange?: (chainId: string) => void;
  className?: string;
}

export function ChainSelector({ 
  showTestnets = true, 
  onNetworkChange,
  className = ''
}: ChainSelectorProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [isChangingNetwork, setIsChangingNetwork] = useState(false);
  const mainnetNetworks = getMainnetNetworks();
  const testnetNetworks = showTestnets ? getTestnetNetworks() : [];
  const { toast } = useToast();

  useEffect(() => {
    // Get the current network when component mounts
    const fetchCurrentChainId = async () => {
      try {
        const chainId = await getChainId();
        if (chainId) {
          // Find network by chainId
          const allNetworks = [...mainnetNetworks, ...testnetNetworks];
          const network = allNetworks.find(n => n.chainId === chainId);
          if (network) {
            setSelectedNetwork(network.id);
          }
        }
      } catch (error) {
        console.error('Error fetching current chain ID:', error);
      }
    };

    fetchCurrentChainId();
  }, [mainnetNetworks, testnetNetworks]);

  const handleNetworkChange = async (value: string) => {
    if (value === selectedNetwork) return;
    
    setIsChangingNetwork(true);
    
    try {
      const result = await switchNetwork(value);
      
      if (result.success) {
        setSelectedNetwork(value);
        
        toast({
          title: 'Network Changed',
          description: `Successfully switched to ${result.network?.name || value}`,
        });
        
        if (onNetworkChange && result.network) {
          onNetworkChange(result.network.chainId);
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
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Select Network" />
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