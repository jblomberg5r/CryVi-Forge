import { useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/hooks/use-wallet';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function TokenCreator() {
  const [activeTab, setActiveTab] = useState<string>('template');
  const [tokenType, setTokenType] = useState<string>('ERC20');
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [initialSupply, setInitialSupply] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [features, setFeatures] = useState({
    mintable: false,
    burnable: false,
    pausable: false,
    permit: false,
    votable: false,
    stakable: false,
    timelock: false,
    upgradeable: false
  });
  
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createToken = useMutation({
    mutationFn: async (tokenData: any) => {
      const res = await apiRequest('POST', '/api/tokens', tokenData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Token Created',
        description: 'Your token has been created successfully.',
      });
      // Reset form
      setTokenName('');
      setTokenSymbol('');
      setInitialSupply('');
      setFeatures({
        mintable: false,
        burnable: false,
        pausable: false,
        permit: false,
        votable: false,
        stakable: false,
        timelock: false,
        upgradeable: false
      });
      // Invalidate query cache
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/user/1'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create token. Please try again.',
        variant: 'destructive',
      });
      console.error('Create token error:', error);
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to create a token.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!tokenName || !tokenSymbol) {
      toast({
        title: 'Missing Information',
        description: 'Please provide token name and symbol.',
        variant: 'destructive',
      });
      return;
    }
    
    // For ERC20, validate supply
    if (tokenType === 'ERC20' && !initialSupply) {
      toast({
        title: 'Missing Supply',
        description: 'Please provide initial supply for ERC20 token.',
        variant: 'destructive',
      });
      return;
    }
    
    // Create token
    createToken.mutate({
      name: tokenName,
      symbol: tokenSymbol,
      type: tokenType,
      supply: initialSupply,
      userId: 1, // Mock user ID
      features
    });
  };

  return (
    <Card className="bg-muted rounded-xl border-border overflow-hidden">
      <CardHeader className="p-4 border-b border-border flex items-center justify-between">
        <CardTitle className="font-semibold">Token Creator</CardTitle>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <i className="ri-question-line text-muted-foreground"></i>
        </Button>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template" className="text-sm">
              <i className="ri-layout-grid-line mr-2"></i>
              Template-based
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-sm">
              <i className="ri-settings-line mr-2"></i>
              Custom Configuration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="template" className="pt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                  Choose a Token Template
                </Label>
                <RadioGroup 
                  value={selectedTemplate} 
                  onValueChange={setSelectedTemplate}
                  className="grid gap-4 grid-cols-1 md:grid-cols-2"
                >
                  <div className={`relative rounded-lg border p-4 ${selectedTemplate === 'standard' ? 'border-primary bg-primary/5' : 'border-border'} hover:border-primary/50 transition-colors cursor-pointer`}>
                    <RadioGroupItem value="standard" id="standard" className="absolute right-4 top-4" />
                    <div className="mb-2 flex items-center">
                      <div className="mr-2 rounded-full bg-primary/20 p-1">
                        <i className="ri-coin-line text-primary"></i>
                      </div>
                      <Label htmlFor="standard" className="font-medium cursor-pointer">Standard ERC20</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Basic token with transfer functionality.</p>
                  </div>
                  
                  <div className={`relative rounded-lg border p-4 ${selectedTemplate === 'nft' ? 'border-primary bg-primary/5' : 'border-border'} hover:border-primary/50 transition-colors cursor-pointer`}>
                    <RadioGroupItem value="nft" id="nft" className="absolute right-4 top-4" />
                    <div className="mb-2 flex items-center">
                      <div className="mr-2 rounded-full bg-purple-500/20 p-1">
                        <i className="ri-nft-line text-purple-500"></i>
                      </div>
                      <Label htmlFor="nft" className="font-medium cursor-pointer">NFT Collection</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">ERC721 for unique digital collectibles.</p>
                  </div>
                  
                  <div className={`relative rounded-lg border p-4 ${selectedTemplate === 'governance' ? 'border-primary bg-primary/5' : 'border-border'} hover:border-primary/50 transition-colors cursor-pointer`}>
                    <RadioGroupItem value="governance" id="governance" className="absolute right-4 top-4" />
                    <div className="mb-2 flex items-center">
                      <div className="mr-2 rounded-full bg-blue-500/20 p-1">
                        <i className="ri-government-line text-blue-500"></i>
                      </div>
                      <Label htmlFor="governance" className="font-medium cursor-pointer">Governance Token</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">ERC20 with voting capabilities for DAOs.</p>
                  </div>
                  
                  <div className={`relative rounded-lg border p-4 ${selectedTemplate === 'staking' ? 'border-primary bg-primary/5' : 'border-border'} hover:border-primary/50 transition-colors cursor-pointer`}>
                    <RadioGroupItem value="staking" id="staking" className="absolute right-4 top-4" />
                    <div className="mb-2 flex items-center">
                      <div className="mr-2 rounded-full bg-green-500/20 p-1">
                        <i className="ri-money-dollar-box-line text-green-500"></i>
                      </div>
                      <Label htmlFor="staking" className="font-medium cursor-pointer">Staking Token</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">ERC20 with built-in staking rewards.</p>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <Label htmlFor="token-name-template" className="text-sm font-medium text-muted-foreground mb-1 block">
                    Token Name
                  </Label>
                  <Input
                    id="token-name-template"
                    placeholder="e.g., MyToken"
                    className="w-full bg-background"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="token-symbol-template" className="text-sm font-medium text-muted-foreground mb-1 block">
                    Token Symbol
                  </Label>
                  <Input
                    id="token-symbol-template"
                    placeholder="e.g., MTK"
                    className="w-full bg-background"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                  />
                </div>
              </div>
              
              {(selectedTemplate === 'standard' || selectedTemplate === 'governance' || selectedTemplate === 'staking') && (
                <div>
                  <Label htmlFor="initial-supply-template" className="text-sm font-medium text-muted-foreground mb-1 block">
                    Initial Supply
                  </Label>
                  <Input
                    id="initial-supply-template"
                    placeholder="e.g., 1000000"
                    className="w-full bg-background"
                    value={initialSupply}
                    onChange={(e) => setInitialSupply(e.target.value)}
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="pt-4">
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="token-type" className="text-sm font-medium text-muted-foreground mb-1 block">
                    Token Type
                  </Label>
                  <select 
                    id="token-type"
                    className="w-full bg-background rounded-md text-sm py-2 px-3 text-foreground border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={tokenType}
                    onChange={(e) => setTokenType(e.target.value)}
                  >
                    <option value="ERC20">ERC20 (Fungible Token)</option>
                    <option value="ERC721">ERC721 (NFT)</option>
                    <option value="ERC1155">ERC1155 (Multi Token)</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="token-name" className="text-sm font-medium text-muted-foreground mb-1 block">
                    Token Name
                  </Label>
                  <Input
                    id="token-name"
                    placeholder="e.g., MyToken"
                    className="w-full bg-background"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="token-symbol" className="text-sm font-medium text-muted-foreground mb-1 block">
                    Token Symbol
                  </Label>
                  <Input
                    id="token-symbol"
                    placeholder="e.g., MTK"
                    className="w-full bg-background"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="initial-supply" className="text-sm font-medium text-muted-foreground mb-1 block">
                    Initial Supply {tokenType === 'ERC20' ? '' : '(for ERC20)'}
                  </Label>
                  <Input
                    id="initial-supply"
                    placeholder="e.g., 1000000"
                    className="w-full bg-background"
                    value={initialSupply}
                    onChange={(e) => setInitialSupply(e.target.value)}
                    disabled={tokenType !== 'ERC20'}
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Token Features
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                  <div className="flex items-center">
                    <Checkbox 
                      id="mintable" 
                      checked={features.mintable}
                      onCheckedChange={(checked) => 
                        setFeatures({ ...features, mintable: checked as boolean })
                      }
                    />
                    <Label htmlFor="mintable" className="ml-2 text-sm text-foreground">
                      Mintable
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="burnable" 
                      checked={features.burnable}
                      onCheckedChange={(checked) => 
                        setFeatures({ ...features, burnable: checked as boolean })
                      }
                    />
                    <Label htmlFor="burnable" className="ml-2 text-sm text-foreground">
                      Burnable
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="pausable" 
                      checked={features.pausable}
                      onCheckedChange={(checked) => 
                        setFeatures({ ...features, pausable: checked as boolean })
                      }
                    />
                    <Label htmlFor="pausable" className="ml-2 text-sm text-foreground">
                      Pausable
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="permit" 
                      checked={features.permit}
                      onCheckedChange={(checked) => 
                        setFeatures({ ...features, permit: checked as boolean })
                      }
                      disabled={tokenType !== 'ERC20'}
                    />
                    <Label htmlFor="permit" className="ml-2 text-sm text-foreground">
                      Permit (ERC20 only)
                    </Label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Advanced Features
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                  <div className="flex items-center">
                    <Checkbox 
                      id="votable" 
                      checked={features.votable}
                      onCheckedChange={(checked) => 
                        setFeatures({ ...features, votable: checked as boolean })
                      }
                      disabled={tokenType !== 'ERC20'}
                    />
                    <Label htmlFor="votable" className="ml-2 text-sm text-foreground">
                      Voting/Governance
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="stakable" 
                      checked={features.stakable}
                      onCheckedChange={(checked) => 
                        setFeatures({ ...features, stakable: checked as boolean })
                      }
                      disabled={tokenType !== 'ERC20'}
                    />
                    <Label htmlFor="stakable" className="ml-2 text-sm text-foreground">
                      Staking Rewards
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="timelock" 
                      checked={features.timelock}
                      onCheckedChange={(checked) => 
                        setFeatures({ ...features, timelock: checked as boolean })
                      }
                    />
                    <Label htmlFor="timelock" className="ml-2 text-sm text-foreground">
                      Timelock
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="upgradeable" 
                      checked={features.upgradeable}
                      onCheckedChange={(checked) => 
                        setFeatures({ ...features, upgradeable: checked as boolean })
                      }
                    />
                    <Label htmlFor="upgradeable" className="ml-2 text-sm text-foreground">
                      Upgradeable
                    </Label>
                  </div>
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="border-t border-border pt-4 mt-2">
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="py-2 px-4 bg-background hover:bg-muted-foreground/10 text-foreground rounded-md text-sm flex items-center"
            >
              <i className="ri-code-line mr-2"></i>
              Generate Code
            </Button>
            <Button
              onClick={handleSubmit}
              className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm flex items-center"
              disabled={!isConnected || createToken.isPending}
            >
              <i className="ri-coin-line mr-2"></i>
              {createToken.isPending ? 'Creating...' : 'Create Token'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
