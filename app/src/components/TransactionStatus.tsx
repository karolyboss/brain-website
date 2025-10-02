import { FC, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';
import { Transaction } from '@solana/web3.js';
import { TransactionTracker } from '@/utils/transactionTracker';
import { WalletErrorMessages, handleWalletError } from '@/utils/walletErrors';
import { useBalancePolling } from '@/hooks/useBalancePolling';
import './TransactionStatus.css';

interface TransactionProgress {
  status: 'initial' | 'processing' | 'confirming' | 'success' | 'error' | 'timeout';
  confirmations: number;
  retryCount: number;
  signature?: string;
  error?: string;
}

interface TransactionStatusProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const TransactionStatus: FC<TransactionStatusProps> = ({ onSuccess, onError }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<TransactionProgress>({
    status: 'initial',
    confirmations: 0,
    retryCount: 0
  });

  // Use balance polling hook
  const { solBalance, rotBalance, refreshBalance } = useBalancePolling(
    connection,
    publicKey,
    true, // enabled
    5000  // poll every 5 seconds
  );

  // Transaction tracker instance
  const tracker = new TransactionTracker(connection, (progress) => {
    setProgress(progress);
    
    // Show progress notifications
    switch (progress.status) {
      case 'processing':
        if (progress.retryCount > 0) {
          toast.loading(`Retrying transaction (${progress.retryCount}/3)...`);
        } else {
          toast.loading('Processing transaction...');
        }
        break;
      case 'confirming':
        toast.loading(`Confirming transaction... (${progress.confirmations}/32)`);
        break;
      case 'success':
        toast.success('Transaction successful!');
        refreshBalance();
        onSuccess?.();
        break;
      case 'error':
        const errorMessage = handleWalletError(new Error(progress.error || 'Transaction failed'));
        toast.error(errorMessage);
        onError?.(errorMessage);
        break;
      case 'timeout':
        toast.error(WalletErrorMessages.TIMEOUT);
        onError?.(WalletErrorMessages.TIMEOUT);
        break;
    }
  });

  const handlePurchase = async (solAmount: number) => {
    if (!publicKey) {
      toast.error(WalletErrorMessages.NOT_CONNECTED);
      return;
    }

    if (solAmount < 0.1 || solAmount > 10) {
      toast.error(WalletErrorMessages.INVALID_AMOUNT);
      return;
    }

    if (solBalance < solAmount) {
      toast.error(WalletErrorMessages.INSUFFICIENT_BALANCE);
      return;
    }

    setIsProcessing(true);

    try {
      const transaction = new Transaction();
      // Add your transaction instructions here

      const initializeTransaction = async () => {
        return sendTransaction(transaction, connection);
      };

      await tracker.trackTransaction(initializeTransaction(), initializeTransaction);

    } catch (error: any) {
      const errorMessage = handleWalletError(error);
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="transaction-status">
      <div className="balance-info">
        <div>SOL: {solBalance?.toFixed(4) ?? '0.0000'}</div>
        <div>ROT: {rotBalance?.toLocaleString() ?? '0'}</div>
      </div>

      {isProcessing && (
        <div className="transaction-progress">
          <div className="progress-status">
            <div className="spinner" />
            <span>
              {progress.status === 'confirming'
                ? `Confirming (${progress.confirmations}/32)`
                : progress.status}
            </span>
            {progress.retryCount > 0 && (
              <span className="retry-count">
                Retry {progress.retryCount}/3
              </span>
            )}
          </div>

          {progress.signature && (
            <div className="signature">
              <a
                href={`https://explorer.solana.com/tx/${progress.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-link"
              >
                {progress.signature.slice(0, 8)}...{progress.signature.slice(-8)}
              </a>
            </div>
          )}

          {progress.error && (
            <div className="error">
              {progress.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};