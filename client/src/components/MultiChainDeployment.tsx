import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getMainnetNetworks, getTestnetNetworks, getNetworkById } from '@/lib/chains';
import { deployContract } from '@/lib/web3';

interface MultiChainDeploymentProps {
  contractAbi: any[];
  contractBytecode: string;
  contractArguments?: any[];
}

export function MultiChainDeployment({
  contractAbi,
  contractBytecode,
  contractArguments = []
}: MultiChainDeploymentProps) {
  const [networkType, setNetworkType] = useState<'mainnet' | 'testnet'>('testnet');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedContracts, setDeployedContracts] = useState<Array<{
    address: string;
    network: string;
    transactionHash: string;
    timestamp: number;
  }>>([]);
  
  const mainnetNetworks = getMainnetNetworks();
  const testnetNetworks = getTestnetNetworks();
  const { toast } = useToast();
  
  const handleNetworkSelect = (networkId: string) => {
    setSelectedNetwork(networkId);
  };
  
  const handleDeploy = async () => {
    if (!selectedNetwork) {
      toast({
        title: 'Error',
        description: 'Please select a network to deploy to',
        variant: 'destructive',
      });
      return;
    }
    
    setIsDeploying(true);
    
    try {
      const result = await deployContract(
        contractAbi,
        contractBytecode,
        contractArguments,
        selectedNetwork
      );
      
      if (result.success && result.address) {
        // Add to deployed contracts list
        setDeployedContracts(prevContracts => [
          {
            address: result.address,
            network: result.network || selectedNetwork,
            transactionHash: result.transactionHash,
            timestamp: Date.now()
          },
          ...prevContracts
        ]);
        
        toast({
          title: 'Deployment Successful',
          description: `Contract deployed to ${result.network} at address ${result.address.substring(0, 6)}...${result.address.substring(result.address.length - 4)}`,
        });
      } else {
        toast({
          title: 'Deployment Failed',
          description: 'There was an error deploying the contract',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error deploying contract:', error);
      toast({
        title: 'Deployment Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
    }
  };
  
  const getNetworkColor = (networkId: string) => {
    const network = getNetworkById(networkId);
    return network?.color || '#888888';
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <Card className="border-border bg-muted">
      <CardHeader>
        <CardTitle>Multi-Chain Deployment</CardTitle>
        <CardDescription>
          Deploy your smart contract to multiple blockchain networks
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="deploy" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
            <TabsTrigger value="history">Deployment History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deploy" className="pt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label className="text-base font-medium">Select Network Type</Label>
                <div className="flex space-x-4">
                  <Button
                    variant={networkType === 'mainnet' ? 'default' : 'outline'}
                    onClick={() => setNetworkType('mainnet')}
                    className="flex-1"
                  >
                    Mainnet
                  </Button>
                  <Button
                    variant={networkType === 'testnet' ? 'default' : 'outline'}
                    onClick={() => setNetworkType('testnet')}
                    className="flex-1"
                  >
                    Testnet
                  </Button>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="grid gap-2">
                <Label className="text-base font-medium">Select Network</Label>
                <RadioGroup
                  value={selectedNetwork}
                  onValueChange={handleNetworkSelect}
                  className="grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                  {(networkType === 'mainnet' ? mainnetNetworks : testnetNetworks).map((network) => (
                    <div key={network.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-background">
                      <RadioGroupItem value={network.id} id={network.id} />
                      <Label htmlFor={network.id} className="flex items-center cursor-pointer">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: network.color }}
                        />
                        {network.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <Button
                onClick={handleDeploy}
                disabled={!selectedNetwork || isDeploying}
                className="mt-4"
              >
                {isDeploying ? (
                  <>
                    <span className="animate-spin mr-2">↻</span>
                    Deploying...
                  </>
                ) : (
                  'Deploy Contract'
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="pt-4">
            {deployedContracts.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted-foreground/5 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">Contract Address</div>
                    <div className="col-span-3">Network</div>
                    <div className="col-span-4">Deployed</div>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {deployedContracts.map((contract, index) => (
                    <div key={index} className="px-3 py-2 text-sm">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-5 font-mono text-xs truncate">
                          {contract.address}
                        </div>
                        <div className="col-span-3">
                          <div className="flex items-center">
                            <div 
                              className="w-2 h-2 rounded-full mr-2" 
                              style={{ backgroundColor: getNetworkColor(contract.network) }}
                            />
                            <span className="text-xs">{contract.network}</span>
                          </div>
                        </div>
                        <div className="col-span-4 text-xs text-muted-foreground">
                          {formatDate(contract.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No deployment history yet</p>
                <p className="text-sm mt-1">Deploy your contract to see the history here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}