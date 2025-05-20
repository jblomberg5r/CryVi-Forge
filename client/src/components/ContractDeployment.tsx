import { useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useWallet } from '@/hooks/use-wallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

interface ContractDeploymentProps {
  projectId: number;
}

export function ContractDeployment({ projectId }: ContractDeploymentProps) {
  const [activeTab, setActiveTab] = useState<string>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('erc20');
  const [selectedContract, setSelectedContract] = useState<string>('');
  const [contractName, setContractName] = useState<string>('');
  const [constructorArgs, setConstructorArgs] = useState<string>('');
  const [gasLimit, setGasLimit] = useState<string>('');
  const [gasPrice, setGasPrice] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [contractFeatures, setContractFeatures] = useState({
    voting: false,
    staking: false,
    timelock: false,
    multisig: false,
    upgradeable: false,
    pausable: false,
    royalties: false,
    marketplace: false
  });
  
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template" className="text-sm">
              <i className="ri-layout-grid-line mr-2"></i>
              No-Code Templates
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-sm">
              <i className="ri-code-s-slash-line mr-2"></i>
              From Code
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="template" className="pt-4">
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                  Choose a Smart Contract Template
                </Label>
                <RadioGroup 
                  value={selectedTemplate} 
                  onValueChange={setSelectedTemplate}
                  className="grid gap-4 grid-cols-1 md:grid-cols-2"
                >
                  <div className={`relative rounded-lg border p-4 ${selectedTemplate === 'erc20' ? 'border-primary bg-primary/5' : 'border-border'} hover:border-primary/50 transition-colors cursor-pointer`}>
                    <RadioGroupItem value="erc20" id="erc20" className="absolute right-4 top-4" />
                    <div className="mb-2 flex items-center">
                      <div className="mr-2 rounded-full bg-blue-500/20 p-1">
                        <i className="ri-coin-line text-blue-500"></i>
                      </div>
                      <Label htmlFor="erc20" className="font-medium cursor-pointer">ERC20 Token</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Standard fungible token with transfer functionality</p>
                  </div>
                  
                  <div className={`relative rounded-lg border p-4 ${selectedTemplate === 'nft' ? 'border-primary bg-primary/5' : 'border-border'} hover:border-primary/50 transition-colors cursor-pointer`}>
                    <RadioGroupItem value="nft" id="nft" className="absolute right-4 top-4" />
                    <div className="mb-2 flex items-center">
                      <div className="mr-2 rounded-full bg-purple-500/20 p-1">
                        <i className="ri-nft-line text-purple-500"></i>
                      </div>
                      <Label htmlFor="nft" className="font-medium cursor-pointer">NFT Collection</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Implement NFTs with metadata and minting capabilities</p>
                  </div>
                  
                  <div className={`relative rounded-lg border p-4 ${selectedTemplate === 'dao' ? 'border-primary bg-primary/5' : 'border-border'} hover:border-primary/50 transition-colors cursor-pointer`}>
                    <RadioGroupItem value="dao" id="dao" className="absolute right-4 top-4" />
                    <div className="mb-2 flex items-center">
                      <div className="mr-2 rounded-full bg-green-500/20 p-1">
                        <i className="ri-government-line text-green-500"></i>
                      </div>
                      <Label htmlFor="dao" className="font-medium cursor-pointer">DAO Governance</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Create a DAO with voting and proposal mechanisms</p>
                  </div>
                  
                  <div className={`relative rounded-lg border p-4 ${selectedTemplate === 'marketplace' ? 'border-primary bg-primary/5' : 'border-border'} hover:border-primary/50 transition-colors cursor-pointer`}>
                    <RadioGroupItem value="marketplace" id="marketplace" className="absolute right-4 top-4" />
                    <div className="mb-2 flex items-center">
                      <div className="mr-2 rounded-full bg-amber-500/20 p-1">
                        <i className="ri-store-2-line text-amber-500"></i>
                      </div>
                      <Label htmlFor="marketplace" className="font-medium cursor-pointer">NFT Marketplace</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Create marketplace for buying and selling NFTs</p>
                  </div>
                  
                  <div className={`relative rounded-lg border p-4 ${selectedTemplate === 'staking' ? 'border-primary bg-primary/5' : 'border-border'} hover:border-primary/50 transition-colors cursor-pointer`}>
                    <RadioGroupItem value="staking" id="staking" className="absolute right-4 top-4" />
                    <div className="mb-2 flex items-center">
                      <div className="mr-2 rounded-full bg-cyan-500/20 p-1">
                        <i className="ri-bank-line text-cyan-500"></i>
                      </div>
                      <Label htmlFor="staking" className="font-medium cursor-pointer">Staking Platform</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Stake tokens and earn rewards over time</p>
                  </div>
                  
                  <div className={`relative rounded-lg border p-4 ${selectedTemplate === 'multisig' ? 'border-primary bg-primary/5' : 'border-border'} hover:border-primary/50 transition-colors cursor-pointer`}>
                    <RadioGroupItem value="multisig" id="multisig" className="absolute right-4 top-4" />
                    <div className="mb-2 flex items-center">
                      <div className="mr-2 rounded-full bg-red-500/20 p-1">
                        <i className="ri-shield-keyhole-line text-red-500"></i>
                      </div>
                      <Label htmlFor="multisig" className="font-medium cursor-pointer">Multi-Signature Wallet</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Requires multiple approvals for transactions</p>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <Label htmlFor="contract-name" className="text-sm font-medium text-muted-foreground mb-1 block">
                    Contract Name
                  </Label>
                  <Input
                    id="contract-name"
                    placeholder="e.g., MyContract"
                    className="w-full bg-background"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                  />
                </div>
                
                {selectedTemplate === 'nft' && (
                <div>
                  <Label htmlFor="nft-base-uri" className="text-sm font-medium text-muted-foreground mb-1 block">
                    Base URI for Metadata
                  </Label>
                  <Input
                    id="nft-base-uri"
                    placeholder="e.g., https://example.com/metadata/"
                    className="w-full bg-background"
                    value={constructorArgs}
                    onChange={(e) => setConstructorArgs(e.target.value)}
                  />
                </div>
                )}
                
                {selectedTemplate === 'marketplace' && (
                <div>
                  <Label htmlFor="marketplace-fee" className="text-sm font-medium text-muted-foreground mb-1 block">
                    Marketplace Fee (%)
                  </Label>
                  <Input
                    id="marketplace-fee"
                    placeholder="e.g., 2.5"
                    className="w-full bg-background"
                    value={constructorArgs}
                    onChange={(e) => setConstructorArgs(e.target.value)}
                  />
                </div>
                )}
              </div>
              
              {selectedTemplate && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Contract Features
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                  {selectedTemplate === 'erc20' && (
                    <>
                      <div className="flex items-center">
                        <Checkbox 
                          id="mintable" 
                          checked={contractFeatures.pausable}
                          onCheckedChange={(checked) => 
                            setContractFeatures({ ...contractFeatures, pausable: checked as boolean })
                          }
                        />
                        <Label htmlFor="mintable" className="ml-2 text-sm text-foreground">
                          Pausable
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="upgradeable" 
                          checked={contractFeatures.upgradeable}
                          onCheckedChange={(checked) => 
                            setContractFeatures({ ...contractFeatures, upgradeable: checked as boolean })
                          }
                        />
                        <Label htmlFor="upgradeable" className="ml-2 text-sm text-foreground">
                          Upgradeable
                        </Label>
                      </div>
                    </>
                  )}
                  
                  {selectedTemplate === 'nft' && (
                    <>
                      <div className="flex items-center">
                        <Checkbox 
                          id="royalties" 
                          checked={contractFeatures.royalties}
                          onCheckedChange={(checked) => 
                            setContractFeatures({ ...contractFeatures, royalties: checked as boolean })
                          }
                        />
                        <Label htmlFor="royalties" className="ml-2 text-sm text-foreground">
                          Royalties
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="upgradeable-nft" 
                          checked={contractFeatures.upgradeable}
                          onCheckedChange={(checked) => 
                            setContractFeatures({ ...contractFeatures, upgradeable: checked as boolean })
                          }
                        />
                        <Label htmlFor="upgradeable-nft" className="ml-2 text-sm text-foreground">
                          Upgradeable
                        </Label>
                      </div>
                    </>
                  )}
                  
                  {selectedTemplate === 'dao' && (
                    <>
                      <div className="flex items-center">
                        <Checkbox 
                          id="timelock" 
                          checked={contractFeatures.timelock}
                          onCheckedChange={(checked) => 
                            setContractFeatures({ ...contractFeatures, timelock: checked as boolean })
                          }
                        />
                        <Label htmlFor="timelock" className="ml-2 text-sm text-foreground">
                          Timelock
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="upgradeable-dao" 
                          checked={contractFeatures.upgradeable}
                          onCheckedChange={(checked) => 
                            setContractFeatures({ ...contractFeatures, upgradeable: checked as boolean })
                          }
                        />
                        <Label htmlFor="upgradeable-dao" className="ml-2 text-sm text-foreground">
                          Upgradeable
                        </Label>
                      </div>
                    </>
                  )}
                </div>
              </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="pt-4">
            <div className="space-y-4">
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
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="border-t border-border pt-4 mt-2">
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="bg-background hover:bg-muted-foreground/10 text-foreground rounded-md text-sm flex items-center"
            >
              <i className="ri-code-line mr-2"></i>
              Generate Code
            </Button>
            <Button
              onClick={handleDeploy}
              className="bg-primary hover:bg-opacity-90 text-white rounded-md text-sm flex items-center"
              disabled={!isConnected || deployContract.isPending}
            >
              <i className="ri-rocket-line mr-2"></i>
              {deployContract.isPending ? 'Deploying...' : 'Deploy Contract'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
