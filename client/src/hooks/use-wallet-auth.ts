import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWeb3Wallet } from './use-web3-wallet';
import type { User } from '@/types/user';

export interface WalletAuthResponse {
  success: boolean;
  user: User;
  message?: string;
}

export function useWalletAuth() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, address, signMessage } = useWeb3Wallet();
  const queryClient = useQueryClient();

  // Wallet connection mutation
  const { mutate: connectWallet, isPending } = useMutation({
    mutationFn: async (): Promise<WalletAuthResponse> => {
      if (!address) {
        throw new Error('No wallet address available');
      }

      // Create a unique message including a timestamp to prevent replay attacks
      const message = `Sign this message to connect to CryVi Forge: ${Date.now()}`;
      
      // Request signature from the wallet
      const signature = await signMessage(message);
      
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