export const WalletErrorMessages = {
  // Connection errors
  NOT_CONNECTED: 'Please connect your wallet first',
  WRONG_NETWORK: 'Please switch to Solana mainnet',
  INSUFFICIENT_BALANCE: 'Insufficient SOL balance',
  
  // Transaction errors
  TRANSACTION_FAILED: 'Transaction failed. Please try again',
  USER_REJECTED: 'Transaction rejected by user',
  TIMEOUT: 'Transaction timed out. Please try again',
  
  // RPC errors
  RPC_ERROR: 'Network error. Please try again later',
  RATE_LIMIT: 'Too many requests. Please wait a moment',
  
  // Validation errors
  INVALID_AMOUNT: 'Please enter a valid amount between 0.1 and 10 SOL',
  INVALID_ADDRESS: 'Invalid wallet address'
};

export const handleWalletError = (error: any): string => {
  console.error('Wallet error:', error);

  if (error.message?.includes('User rejected')) {
    return WalletErrorMessages.USER_REJECTED;
  }
  
  if (error.message?.includes('insufficient balance')) {
    return WalletErrorMessages.INSUFFICIENT_BALANCE;
  }

  if (error.message?.includes('Rate limit')) {
    return WalletErrorMessages.RATE_LIMIT;
  }

  if (error.message?.includes('blockhash')) {
    return WalletErrorMessages.RPC_ERROR;
  }

  return error.message || WalletErrorMessages.TRANSACTION_FAILED;
};