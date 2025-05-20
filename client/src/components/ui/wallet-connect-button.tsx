import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/providers/WalletProvider';
import { useToast } from '@/hooks/use-toast';
import { formatWalletAddress } from '@/lib/web3';

interface WalletConnectButtonProps {
  className?: string;
  onConnect?: (address: string) => void;
}

export function WalletConnectButton({ 
  className = '',
  onConnect
}: WalletConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const { toast } = useToast();
  
  const { connectWallet, isConnecting: isWalletConnecting } = useWallet();
  
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      await connectWallet();
      const address = window.ethereum?.selectedAddress;
      
      if (address && onConnect) {
        onConnect(address);
      }
      
      toast({
        title: 'Wallet Connected',
        description: address ? `Connected to ${formatWalletAddress(address)}` : 'Connected successfully',
      });
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Could not connect to wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button 
      onClick={handleConnectWallet}
      disabled={isConnecting}
      className={className}
    >
      {isConnecting ? (
        <>
          <span className="mr-2 animate-spin">↻</span>
          Connecting...
        </>
      ) : (
        'Connect Wallet'
      )}
    </Button>
  );
}