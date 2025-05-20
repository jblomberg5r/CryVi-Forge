import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from './use-wallet';
import type { User } from '@/types/user';

export interface WalletAuthResponse {
  success: boolean;
  user: User;
  message?: string;
}

export function useWalletAuth() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, address } = useWallet();
  const queryClient = useQueryClient();

  // Wallet connection mutation
  const { mutate: connectWallet, isPending } = useMutation({
    mutationFn: async (): Promise<WalletAuthResponse> => {
      if (!address) {
        throw new Error('No wallet address available');
      }

      // For a real implementation, this would sign a message with the wallet
      // and send the signature for verification
      const message = `Sign this message to connect to CryVi Forge: ${Date.now()}`;
      const signature = "wallet_signature_placeholder"; // In reality, this would come from the wallet
      
      const response = await fetch('/api/auth/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          signature,
          message
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect wallet');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate user data query to refetch the authenticated user
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to connect wallet');
    },
    onSettled: () => {
      setIsConnecting(false);
    }
  });

  // Disconnect mutation
  const { mutate: disconnectWallet } = useMutation({
    mutationFn: async (): Promise<{ message: string }> => {
      const response = await fetch('/api/auth/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect wallet');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate user data query to clear the authenticated user
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    }
  });

  // Effect to auto-connect when wallet address changes
  useEffect(() => {
    if (address && isConnected && !isConnecting && !isPending) {
      setIsConnecting(true);
      connectWallet();
    }
  }, [address, isConnected, connectWallet, isConnecting, isPending]);

  return {
    connectWallet,
    disconnectWallet,
    isConnecting: isPending || isConnecting,
    error
  };
}