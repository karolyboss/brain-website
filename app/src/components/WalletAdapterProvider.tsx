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

  // Use reliable public RPC endpoint with fallbacks
  const endpoint = useMemo(() => {
    // Try environment variable first, then use fallback RPCs
    if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    }
    
    // Use multiple fallback RPCs
    const fallbackRPCs = [
      'https://solana-mainnet.rpc.extrnode.com',
      'https://rpc.ankr.com/solana',
      'https://solana.public-rpc.com',
      'https://api.mainnet-beta.solana.com'
    ];
    
    // Randomly select one to distribute load
    return fallbackRPCs[Math.floor(Math.random() * fallbackRPCs.length)];
  }, []);

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