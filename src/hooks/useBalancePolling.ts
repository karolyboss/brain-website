import { Connection, PublicKey } from '@solana/web3.js';
import { useEffect, useState, useCallback } from 'react';

export type BalanceInfo = {
  solBalance: number;
  rotBalance: number;
  isLoading: boolean;
  error: string | null;
};

export const useBalancePolling = (
  connection: Connection,
  publicKey: PublicKey | null,
  enabled: boolean = true,
  interval: number = 10000
) => {
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>({
    solBalance: 0,
    rotBalance: 0,
    isLoading: false,
    error: null
  });

  const fetchBalances = useCallback(async () => {
    if (!publicKey || !enabled) return;

    setBalanceInfo(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      
      // Fetch ROT balance from localStorage or your token program
      const storedRotBalance = localStorage.getItem(`rotBalance_${publicKey.toString()}`);
      const rotBalance = storedRotBalance ? parseFloat(storedRotBalance) : 0;

      setBalanceInfo({
        solBalance: solBalance / 1e9, // Convert lamports to SOL
        rotBalance,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Balance fetch error:', error);
      setBalanceInfo(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  }, [connection, publicKey, enabled]);

  // Initial fetch
  useEffect(() => {
    if (publicKey && enabled) {
      fetchBalances();
    }
  }, [publicKey, enabled, fetchBalances]);

  // Set up polling
  useEffect(() => {
    if (!enabled || !publicKey) return;

    const pollInterval = setInterval(fetchBalances, interval);
    return () => clearInterval(pollInterval);
  }, [enabled, publicKey, interval, fetchBalances]);

  const refreshBalance = useCallback(() => {
    return fetchBalances();
  }, [fetchBalances]);

  return {
    ...balanceInfo,
    refreshBalance
  };
};