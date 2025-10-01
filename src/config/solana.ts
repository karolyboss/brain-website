import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Connection, clusterApiUrl } from '@solana/web3.js';

// You can switch between 'mainnet-beta', 'testnet', or 'devnet'
export const SOLANA_NETWORK = WalletAdapterNetwork.Mainnet;

// List of RPC endpoints for fallback
const RPC_ENDPOINTS = [
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
  'https://solana-mainnet.rpc.extrnode.com',
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com'
].filter(Boolean) as string[];

// Function to get a working RPC endpoint
const getWorkingEndpoint = async (): Promise<string> => {
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const connection = new Connection(endpoint);
      await connection.getSlot();
      return endpoint;
    } catch (error) {
      console.warn(`RPC endpoint ${endpoint} failed, trying next one...`);
      continue;
    }
  }
  throw new Error('No working RPC endpoint found');
};

// Create a connection with commitment and retry logic
export const getConnection = async (): Promise<Connection> => {
  const endpoint = await getWorkingEndpoint();
  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000
  });
};