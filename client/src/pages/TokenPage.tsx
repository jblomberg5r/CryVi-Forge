import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { TokenCreator } from '@/components/TokenCreator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWeb3 } from '@/hooks/use-web3'; // Changed import

export default function TokenPage() {
  const { isConnected } = useWeb3(); // Changed to useWeb3
  
  // Fetch tokens (using mock user ID 1)
  const { data: tokens = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/tokens/user/1'],
  });

  const getTokenTypeIcon = (type: string) => {
    switch (type) {
      case 'ERC20': return 'ri-coin-line';
      case 'ERC721': return 'ri-nft-line';
      case 'ERC1155': return 'ri-stack-line';
      default: return 'ri-token-line';
    }
  };

  const getTokenTypeColor = (type: string) => {
    switch (type) {
      case 'ERC20': return 'bg-blue-500 text-blue-500';
      case 'ERC721': return 'bg-purple-500 text-purple-500';
      case 'ERC1155': return 'bg-orange-500 text-orange-500';
      default: return 'bg-gray-500 text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      
      <div className="flex-grow overflow-y-auto">
        <Topbar />
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Tokens</h1>
            
            <Button 
              className="bg-green-500 hover:bg-green-600"
              disabled={!isConnected}
            >
              <i className="ri-add-line mr-2"></i>
              Create New Token
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-muted border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tokens.length}</div>
                <p className="text-muted-foreground text-sm mt-1">Across all networks</p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Token Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mt-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    ERC20: {tokens.filter(t => t.type === 'ERC20').length}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    ERC721: {tokens.filter(t => t.type === 'ERC721').length}
                  </Badge>
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                    ERC1155: {tokens.filter(t => t.type === 'ERC1155').length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Networks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mt-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Ethereum Testnets: {tokens.filter(t => t.network?.includes('Ethereum')).length}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    Polygon: {tokens.filter(t => t.network?.includes('Polygon')).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Token Creator */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Create New Token</h2>
            <TokenCreator />
          </div>
          
          {/* Token List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Tokens</h2>
            
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading tokens...</p>
              </div>
            ) : tokens.length === 0 ? (
              <Card className="bg-muted border-border">
                <CardContent className="py-10 text-center">
                  <div className="w-16 h-16 bg-muted-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-coin-line text-3xl text-primary"></i>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No tokens yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first token to get started</p>
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    disabled={!isConnected}
                  >
                    Create Your First Token
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokens.map((token: any) => (
                  <Card key={token.id} className="bg-muted border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-8 h-8 rounded-full ${getTokenTypeColor(token.type).split(' ')[0]}/10 flex items-center justify-center`}>
                              <i className={`${getTokenTypeIcon(token.type)} ${getTokenTypeColor(token.type).split(' ')[1]}`}></i>
                            </div>
                            <span className="font-medium text-lg">{token.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground ml-10">
                            {token.symbol}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-background">
                          {token.type}
                        </Badge>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        {token.address ? (
                          <div className="flex items-center text-sm">
                            <span className="text-muted-foreground mr-2">Address:</span>
                            <code className="bg-background px-2 py-0.5 rounded text-xs">
                              {token.address.substring(0, 10)}...{token.address.substring(token.address.length - 8)}
                            </code>
                          </div>
                        ) : null}
                        
                        {token.network ? (
                          <div className="text-sm flex items-center">
                            <span className="text-muted-foreground mr-2">Network:</span>
                            <span className="flex items-center">
                              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                              {token.network}
                            </span>
                          </div>
                        ) : null}
                        
                        {token.supply ? (
                          <div className="text-sm">
                            <span className="text-muted-foreground mr-2">Supply:</span>
                            {token.supply}
                          </div>
                        ) : null}
                        
                        <div className="text-xs text-muted-foreground">
                          Created {formatDate(token.createdAt)}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border flex justify-between">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                        
                        {token.address ? (
                          <Button variant="outline" size="sm">
                            <i className="ri-external-link-line mr-1"></i>
                            Explorer
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="text-primary">
                            <i className="ri-rocket-line mr-1"></i>
                            Deploy
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
