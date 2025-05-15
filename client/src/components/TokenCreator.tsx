import { useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useWallet } from '@/hooks/use-wallet';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function TokenCreator() {
  const [tokenType, setTokenType] = useState<string>('ERC20');
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [initialSupply, setInitialSupply] = useState<string>('');
  const [features, setFeatures] = useState({
    mintable: false,
    burnable: false,
    pausable: false,
    permit: false
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
        permit: false
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label className="text-sm font-medium text-muted-foreground mb-1 block">
              Advanced Features
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
          
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="py-2 px-4 bg-muted hover:bg-muted-foreground/10 text-foreground rounded-md text-sm flex items-center"
            >
              <i className="ri-code-line mr-2"></i>
              Generate Code
            </Button>
            <Button
              type="submit"
              className="py-2 px-4 bg-green-500 hover:bg-opacity-90 text-white rounded-md text-sm flex items-center"
              disabled={!isConnected || createToken.isPending}
            >
              <i className="ri-coin-line mr-2"></i>
              {createToken.isPending ? 'Creating...' : 'Create Token'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
