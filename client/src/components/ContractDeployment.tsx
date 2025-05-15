import { useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

interface ContractDeploymentProps {
  projectId: number;
}

export function ContractDeployment({ projectId }: ContractDeploymentProps) {
  const [selectedContract, setSelectedContract] = useState<string>('');
  const [constructorArgs, setConstructorArgs] = useState<string>('');
  const [gasLimit, setGasLimit] = useState<string>('');
  const [gasPrice, setGasPrice] = useState<string>('');
  const [value, setValue] = useState<string>('');
  
  const { isConnected, address, chainId } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch files from the project
  const { data: files = [] } = useQuery({
    queryKey: [`/api/files/project/${projectId}`],
  });

  // Get only Solidity files
  const solidityFiles = files.filter((file: any) => file.fileType === 'solidity');

  const deployContract = useMutation({
    mutationFn: async (contractData: any) => {
      const res = await apiRequest('POST', '/api/contracts', contractData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Contract Deployed',
        description: 'Your contract has been deployed successfully.',
      });
      // Reset form
      setConstructorArgs('');
      setGasLimit('');
      setGasPrice('');
      setValue('');
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/project/${projectId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities/1'] });
    },
    onError: (error) => {
      toast({
        title: 'Deployment Failed',
        description: 'Failed to deploy contract. Please try again.',
        variant: 'destructive',
      });
      console.error('Deploy contract error:', error);
    }
  });

  const getNetworkName = (chainId?: string) => {
    switch (chainId) {
      case '0x1': return 'Ethereum Mainnet';
      case '0xaa36a7': return 'Ethereum Sepolia';
      case '0x13881': return 'Polygon Mumbai';
      case '0x61': return 'BSC Testnet';
      default: return 'Unknown Network';
    }
  };

  const handleDeploy = (e: FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to deploy a contract.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedContract) {
      toast({
        title: 'Missing Information',
        description: 'Please select a contract to deploy.',
        variant: 'destructive',
      });
      return;
    }

    // In a real implementation, we would compile the contract and deploy it to the blockchain
    // Here we're mocking the deployment
    
    // Mock contract deployment
    deployContract.mutate({
      name: selectedContract,
      address: `0x${Math.random().toString(16).substring(2, 42)}`,
      network: getNetworkName(chainId),
      abi: [],
      userId: 1, // Mock user ID
      projectId
    });
  };

  return (
    <Card className="bg-muted rounded-xl border-border overflow-hidden mb-6">
      <CardHeader className="p-4 border-b border-border flex items-center justify-between">
        <CardTitle className="font-semibold">Contract Deployment</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Current Network:</span>
          <div className="flex items-center px-2 py-1 bg-background rounded-full text-xs">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <span>{getNetworkName(chainId)}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <form onSubmit={handleDeploy} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contract" className="text-sm font-medium text-muted-foreground mb-1 block">
                Contract
              </Label>
              <select
                id="contract"
                className="w-full bg-background rounded-md text-sm py-2 px-3 text-foreground border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedContract}
                onChange={(e) => setSelectedContract(e.target.value)}
              >
                <option value="">Select a contract</option>
                {solidityFiles.map((file: any) => (
                  <option key={file.id} value={file.name.replace('.sol', '')}>
                    {file.name.replace('.sol', '')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="constructor-args" className="text-sm font-medium text-muted-foreground mb-1 block">
                Constructor Arguments
              </Label>
              <Input
                id="constructor-args"
                placeholder="e.g., [arg1, arg2]"
                className="w-full bg-background"
                value={constructorArgs}
                onChange={(e) => setConstructorArgs(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-1 block">
              Advanced Options
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Gas Limit (optional)"
                  className="w-full bg-background"
                  value={gasLimit}
                  onChange={(e) => setGasLimit(e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="Gas Price (optional)"
                  className="w-full bg-background"
                  value={gasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="Value (ETH)"
                  className="w-full bg-background"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="bg-background hover:bg-muted text-foreground rounded-md text-sm flex items-center"
            >
              <i className="ri-file-text-line mr-2"></i>
              Estimate Gas
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-opacity-90 text-white rounded-md text-sm flex items-center"
              disabled={!isConnected || deployContract.isPending}
            >
              <i className="ri-rocket-line mr-2"></i>
              {deployContract.isPending ? 'Deploying...' : 'Deploy Contract'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
