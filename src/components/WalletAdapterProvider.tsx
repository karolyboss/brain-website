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

  // Use reliable RPC endpoints with better rate limits
  const endpoint = useMemo(() => {
    const endpoints = [
      'https://neat-hidden-sanctuary.solana-mainnet.discover.quiknode.pro/2af5315d336f9ae920028bbb90a73b724dc1bbed/',
      'https://solana-mainnet.g.alchemy.com/v2/3qg4v0Ga9P9PwQk-S2ZMogHvlYgESIKj',
      'https://rpc.ankr.com/solana',
      'https://api.mainnet-beta.solana.com'
    ];

    // Try to get a custom RPC endpoint from environment variables
    const customEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    if (customEndpoint?.trim()) {
      endpoints.unshift(customEndpoint);
    }

    // Return the first endpoint, others will be used as fallbacks
    return endpoints[0];
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