import React from 'react';

interface TransactionStatusProps {
  status: string;
  isProcessing: boolean;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({ status, isProcessing }) => {
  if (!status && !isProcessing) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: isProcessing ? 'rgba(138, 43, 226, 0.9)' : 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      {isProcessing && (
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid white',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      <span>{status}</span>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};