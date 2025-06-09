import { useState } from 'react';
// import { useWallet } from '@/providers/WalletProvider'; // Removed for AppKit
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  // const { isConnected, address, connectWallet, signMessage, isConnecting, error } = useWallet(); // Removed for AppKit
  const { toast } = useToast(); // Keep for other potential notifications
  const [username, setUsername] = useState('');
  const [, setLocation] = useLocation(); // Keep for potential redirection after AppKit auth
  const queryClient = useQueryClient(); // Keep for potential cache invalidation after AppKit auth

  // handleLogin function is removed as AppKit button should handle connection and auth flow.
  // The AppKit button might emit events or the AppKit configuration might handle redirection
  // and user state updates automatically. If not, further integration might be needed here
  // based on how AppKit signals authentication success/failure.

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
          <div className="text-center">
            <appkit-button></appkit-button>
          </div>

          {/* Username input can remain as a separate profile update step if needed,
              or be part of a post-authentication step handled by AppKit's flow.
              For now, keeping it simple and separate from the AppKit button. */}
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