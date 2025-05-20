import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { connectWallet } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

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
  
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      const response = await connectWallet();
      if (response.address) {
        if (onConnect) {
          onConnect(response.address);
        }
        
        toast({
          title: 'Wallet Connected',
          description: `Connected to ${shortenAddress(response.address)}`,
        });
      }
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
  
  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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