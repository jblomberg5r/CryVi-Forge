import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const { isConnected, address, connectWallet } = useWallet();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [, setLocation] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (data: { walletAddress: string; username?: string }) => {
      const res = await apiRequest('POST', '/api/auth/login', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Login successful',
        description: 'Welcome to CryVi Forge!',
        variant: 'default',
      });
      setLocation('/profile');
    },
    onError: (error) => {
      toast({
        title: 'Login failed',
        description: 'There was an error logging in. Please try again.',
        variant: 'destructive',
      });
      console.error('Login error:', error);
    }
  });

  const handleLogin = async () => {
    if (!isConnected || !address) {
      await connectWallet();
      return;
    }

    loginMutation.mutate({
      walletAddress: address,
      username: username || undefined,
    });
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
                disabled={loginMutation.isPending}
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
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    Signing In...
                  </>
                ) : (
                  <>Sign In</>
                )}
              </Button>
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