import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';
import { useToast } from '@/hooks/use-toast';

type WalletOption = {
  name: string;
  icon: string;
  color: string;
};

const walletOptions: WalletOption[] = [
  { name: 'MetaMask', icon: 'wallet-3-line', color: 'bg-orange-500' },
  { name: 'WalletConnect', icon: 'wallet-3-line', color: 'bg-blue-500' },
  { name: 'Coinbase Wallet', icon: 'wallet-3-line', color: 'bg-purple-500' },
];

export function WalletConnectButton() {
  const { connectWallet, isConnected, disconnect, address, chainId } = useWallet();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleConnect = async (walletName: string) => {
    try {
      if (walletName === 'MetaMask') {
        await connectWallet();
        setIsDialogOpen(false);
        toast({
          title: "Wallet connected",
          description: "Your MetaMask wallet has been connected successfully.",
        });
      } else {
        toast({
          title: "Not supported",
          description: `${walletName} is not supported yet. Please use MetaMask.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection failed",
        description: "Could not connect to wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  return (
    <>
      {isConnected ? (
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={handleDisconnect}
        >
          <i className="ri-wallet-3-line"></i>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </Button>
      ) : (
        <Button 
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-opacity-90 text-white"
          onClick={() => setIsDialogOpen(true)}
        >
          <i className="ri-wallet-3-line"></i>
          Connect Wallet
        </Button>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-background border border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Connect Wallet</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Connect your wallet to deploy contracts, create tokens, and interact with the blockchain.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mb-6">
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.name}
                variant="outline"
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted"
                onClick={() => handleConnect(wallet.name)}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 ${wallet.color} rounded-md flex items-center justify-center text-white mr-3`}>
                    <i className={`ri-${wallet.icon}`}></i>
                  </div>
                  <span className="font-medium">{wallet.name}</span>
                </div>
                <i className="ri-arrow-right-line"></i>
              </Button>
            ))}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              By connecting your wallet, you agree to our 
              <a href="#" className="text-primary hover:underline ml-1">Terms of Service</a> and 
              <a href="#" className="text-primary hover:underline ml-1">Privacy Policy</a>.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
