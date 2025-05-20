import { useState } from 'react';
import { useWallet } from '@/providers/WalletProvider';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const { isConnected, address, connectWallet, signMessage, isConnecting, error } = useWallet();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Connect wallet and authenticate
  const handleLogin = async () => {
    if (!isConnected || !address) {
      try {
        await connectWallet();
        toast({
          title: 'Wallet Connected',
          description: 'Your wallet has been connected successfully.',
        });
      } catch (error: any) {
        toast({
          title: 'Wallet Connection Failed',
          description: error.message || 'Could not connect to your wallet. Please try again.',
          variant: 'destructive',
        });
      }
      return;
    }

    // If wallet is connected, authenticate with backend
    try {
      // Create a unique message to sign
      const message = `Sign this message to authenticate with CryVi Forge: ${Date.now()}`;
      
      // Have the user sign the message
      const signature = await signMessage(message);
      
      // Send to backend to verify and authenticate
      await fetch('/api/auth/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, signature, message })
      });
      
      toast({
        title: 'Authentication successful',
        description: 'You are now logged in with your wallet.',
      });
      
      // Refresh user data and redirect
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation('/profile');
      
    } catch (error: any) {
      toast({
        title: 'Authentication Failed',
        description: error.message || 'Failed to authenticate with your wallet. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card className="shadow-lg border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to CryVi Forge
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Connect your wallet to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isConnected ? (
            <div className="text-center">
              <Button 
                onClick={connectWallet} 
                size="lg" 
                className="w-full"
                disabled={isConnecting}
              >
                <i className="ri-wallet-3-line mr-2"></i>
                Connect Wallet
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                Connect your wallet to access your projects and continue building on CryVi Forge.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium">Connected Wallet</p>
                  <p className="text-xs text-muted-foreground truncate">{address}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username (Optional)</Label>
                <Input
                  id="username"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Add a username to make your profile easier to identify
                </p>
              </div>

              <Button 
                onClick={handleLogin} 
                size="lg"
                className="w-full"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    Signing In...
                  </>
                ) : (
                  <>Sign In</>
                )}
              </Button>
              
              {error && (
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
          
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-center text-muted-foreground">
              By connecting, you agree to the <a href="#" className="underline text-primary">Terms of Service</a> and <a href="#" className="underline text-primary">Privacy Policy</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}