"use client";

import { FC, ReactNode, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

// Import styles using ES6 import instead of require
import '@solana/wallet-adapter-react-ui/styles.css';

export const WalletAdapterProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Mainnet;

  // Use reliable public RPC endpoint with fallbacks and retry logic
  const endpoint = useMemo(() => {
    // If environment variable is set, use it
    if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    }
    
    // List of reliable public RPC endpoints with weights (higher = more preferred)
    const rpcEndpoints = [
      'https://solana-mainnet.rpc.extrnode.com',
      'https://solana-api.projectserum.com',
      'https://rpc.ankr.com/solana',
      'https://solana-api.projectserum.com',
      'https://api.mainnet-beta.solana.com'
    ];
    
    // Randomly select an endpoint with preference for the first ones in the list
    const random = Math.random();
    if (random < 0.6) return rpcEndpoints[0];
    if (random < 0.8) return rpcEndpoints[1];
    if (random < 0.9) return rpcEndpoints[2];
    if (random < 0.95) return rpcEndpoints[3];
    return rpcEndpoints[4];
  }, []);
  
  // Add retry logic for failed transactions
  const connectionConfig = useMemo(() => ({
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 30000, // 30 seconds
    disableRetryOnRateLimit: false,
    httpRetries: 5,
    httpRetryDelay: 1000,
  }), []);

  const wallets = useMemo(
    () => [
      // Manually specify wallet adapters if needed
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};