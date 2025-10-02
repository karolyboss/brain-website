import { Connection, TransactionSignature } from '@solana/web3.js';

export type TransactionStatus = 
  | 'initial'
  | 'processing'
  | 'confirming'
  | 'success'
  | 'error'
  | 'timeout';

export type TransactionProgress = {
  status: TransactionStatus;
  confirmations: number;
  signature?: string;
  error?: string;
  retryCount: number;
};

export class TransactionTracker {
  private maxRetries: number = 3;
  private maxConfirmations: number = 32;
  private timeoutMs: number = 30000;
  private retryDelayMs: number = 2000;

  constructor(
    private connection: Connection,
    private onProgressUpdate: (progress: TransactionProgress) => void
  ) {}

  async trackTransaction(
    signaturePromise: Promise<TransactionSignature>,
    initializeTransaction: () => Promise<TransactionSignature>
  ): Promise<TransactionProgress> {
    let progress: TransactionProgress = {
      status: 'initial',
      confirmations: 0,
      retryCount: 0
    };

    const updateProgress = (update: Partial<TransactionProgress>) => {
      progress = { ...progress, ...update };
      this.onProgressUpdate(progress);
      return progress;
    };

    try {
      // Initialize transaction
      updateProgress({ status: 'processing' });
      
      // Add timeout to transaction
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout')), this.timeoutMs)
      );

      // Wait for signature with timeout
      const signature = await Promise.race([
        signaturePromise,
        timeoutPromise
      ]);
      updateProgress({ signature, status: 'confirming' });

      // Track confirmations
      let confirmations = 0;
      while (confirmations < this.maxConfirmations) {
        const response = await this.connection.getSignatureStatus(signature, { searchTransactionHistory: true });
        
        // Update confirmations, keeping the previous value if the new one is null
        confirmations = response.value?.confirmations ?? confirmations;

        if (response.value?.err) {
          throw new Error('Transaction failed during confirmation');
        }

        updateProgress({ confirmations });

        if (confirmations >= this.maxConfirmations) {
          return updateProgress({ status: 'success' });
        }

        // Wait before next confirmation check
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // If the loop finishes, it means we have enough confirmations
      return updateProgress({ status: 'success' });
    } catch (error: any) {
      console.error('Transaction error:', error);

      // Handle retry logic
      if (progress.retryCount < this.maxRetries && 
          error.message !== 'Transaction timeout' &&
          error.message !== 'User rejected') {
        
        updateProgress({ 
          status: 'processing',
          retryCount: progress.retryCount + 1
        });

        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelayMs * Math.pow(2, progress.retryCount))
        );

        // Retry transaction
        return this.trackTransaction(initializeTransaction(), initializeTransaction);
      }

      return updateProgress({ 
        status: error.message === 'Transaction timeout' ? 'timeout' : 'error',
        error: error.message
      });
    }
  }
}