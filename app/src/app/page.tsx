"use client";

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import TokenInfo from '@/components/TokenInfo';
import { TransactionStatus } from '@/components/TransactionStatus';
import { toast } from 'react-hot-toast';
import WhyChooseRot from '@/components/WhyChooseRot';

export default function Home() {
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 11,
    minutes: 6,
    seconds: 0
  });

  // SOL amount state
  const [solAmount, setSolAmount] = useState(1.0);
  
  // ROT amount calculation (1 SOL = 1,500,000 ROT with 50% bonus)
  const rotAmount = Math.floor(solAmount * 1500000);
  
  // Transaction status
  const [transactionStatus, setTransactionStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Wallet and connection hooks
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  // Initialize countdown timer (4 days 11 hours 6 minutes from now)
  useEffect(() => {
    // Set the end time to 4 days, 11 hours, and 6 minutes from the initial load
    const now = new Date();
    const endTime = new Date(now.getTime() + (4 * 24 * 60 * 60 * 1000) + (11 * 60 * 60 * 1000) + (6 * 60 * 1000)); // 4 days 11 hours 6 minutes from now
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = endTime.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        return { days, hours, minutes, seconds };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    // Set initial time
    setTimeLeft(calculateTimeLeft());
    
    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSolAmount(value);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value)) value = 0.1;
    if (value < 0.1) value = 0.1;
    if (value > 10) value = 10;
    setSolAmount(value);
  };

  // Error messages map
  const ERROR_MESSAGES = {
    WALLET_NOT_CONNECTED: 'Please connect your wallet first',
    INVALID_AMOUNT: 'Please enter a valid SOL amount (0.1 - 10 SOL)',
    INSUFFICIENT_BALANCE: 'Insufficient SOL balance in your wallet',
    RPC_ERROR: 'Network connection error. Please try again',
    SOCIAL_VERIFICATION: 'Please join our Telegram and follow us on X to participate',
    TRANSACTION_FAILED: 'Transaction failed. Please try again',
    USER_REJECTED: 'Transaction was rejected by user'
  };

  // Handle purchase with Phantom wallet
  const handlePurchase = async () => {
    if (!publicKey) {
      setTransactionStatus(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      return;
    }

    if (!solAmount || solAmount < 0.1 || solAmount > 10) {
      setTransactionStatus(ERROR_MESSAGES.INVALID_AMOUNT);
      toast.error(ERROR_MESSAGES.INVALID_AMOUNT);
      return;
    }

    try {
      setIsProcessing(true);
      setTransactionStatus('Checking wallet balance...');

      // Check wallet balance
      const balance = await connection.getBalance(publicKey);
      if (balance < solAmount * LAMPORTS_PER_SOL) {
        setTransactionStatus(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
        toast.error(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
        setIsProcessing(false);
        return;
      }
      
      setTransactionStatus('Preparing transaction...');
      
      // Check social verification
      const socialVerified = localStorage.getItem('socialVerified') === 'true';
      if (!socialVerified) {
        setTransactionStatus('Please join our Telegram and follow us on X to participate.');
        toast.error('Social verification required!');
        setIsProcessing(false);
        return;
      }

      setTransactionStatus('Opening Phantom wallet...');
      
      // Create a minimal transaction - let Phantom handle everything
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey("DzNvVANS3MrUdsv9ZoTcEFCvRoM5gkNodp6bTmUgd67U"),
          lamports: solAmount * LAMPORTS_PER_SOL,
        })
      );

      // Send the transaction through Phantom wallet
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for transaction confirmation
      setTransactionStatus('Confirming transaction...');
      await connection.confirmTransaction(signature, 'confirmed');
      
      setTransactionStatus(`Payment successful! Transaction ID: ${signature.slice(0, 20)}... Tokens will be delivered within 1-2 hours.`);
      toast.success('Transaction successful!');
      
      // Dispatch custom event to update balance in Navbar
      const balanceUpdateEvent = new CustomEvent('balanceUpdate', {
        detail: { tokens: rotAmount }
      });
      window.dispatchEvent(balanceUpdateEvent);
    } catch (error: unknown) {
      console.error('Transaction failed:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          setTransactionStatus('Transaction cancelled by user.');
          toast.error('Transaction cancelled');
        } else if (error.message.includes('Insufficient funds')) {
          setTransactionStatus('Transaction failed: Insufficient funds for transaction and fees.');
          toast.error('Insufficient funds');
        } else if (error.message.includes('403') || error.message.includes('API key')) {
          setTransactionStatus('Transaction failed: RPC access error. Please try again or contact support.');
          toast.error('Network error');
        } else {
          setTransactionStatus(`Transaction failed: ${error.message}`);
          toast.error('Transaction failed');
        }
      } else {
        setTransactionStatus('Transaction failed. Please try again.');
        toast.error('Transaction failed');
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
      <div style={{ 
        maxWidth: '1000px', 
        width: '100%',
        textAlign: 'center'
      }}>
        {/* PRESALE HEADER */}
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

        {/* URGENT BADGE */}
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(90deg, #ff2d95, #ff5e00)',
          color: 'white',
          padding: '8px 20px',
          borderRadius: '30px',
          fontWeight: 'bold',
          marginBottom: '2rem',
          fontSize: '1.2rem',
          animation: 'pulse 2s infinite'
        }}>
          ⚡ LIMITED TIME OFFER ⚡
        </div>

        {/* COUNTDOWN TIMER */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,45,149,0.2), rgba(138,43,226,0.2))',
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '1rem',
            color: '#ff5e00',
            fontWeight: 'bold'
          }}>
            ⏳ BONUS ENDS IN:
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid #ff2d95',
              borderRadius: '8px',
              padding: '0.5rem',
              minWidth: '60px'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#ff2d95'
              }}>
                {timeLeft.days.toString().padStart(2, '0')}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#aaa'
              }}>
                DAYS
              </div>
            </div>
            
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid #ff2d95',
              borderRadius: '8px',
              padding: '0.5rem',
              minWidth: '60px'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#ff2d95'
              }}>
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#aaa'
              }}>
                HOURS
              </div>
            </div>
            
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid #8a2be2',
              borderRadius: '8px',
              padding: '0.5rem',
              minWidth: '60px'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#8a2be2'
              }}>
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#aaa'
              }}>
                MINUTES
              </div>
            </div>
            
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid #00dbde',
              borderRadius: '8px',
              padding: '0.5rem',
              minWidth: '60px'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#00dbde'
              }}>
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#aaa'
              }}>
                SECONDS
              </div>
            </div>
          </div>
        </div>

        {/* COMMUNITY SECTION */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,45,149,0.1), rgba(138,43,226,0.1))',
          borderRadius: '15px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 45, 149, 0.7)',
          boxShadow: '0 0 20px rgba(255, 45, 149, 0.3)'
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            background: 'linear-gradient(90deg, #ff2d95, #8a2be2, #00dbde)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            backgroundClip: 'text',
            textAlign: 'center'
          }}>
            Buy $ROT Tokens
          </h2>
          
          <p style={{
            fontSize: '1.2rem',
            color: '#ddd',
            marginBottom: '2rem',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            Select your SOL amount and purchase $ROT tokens with Phantom wallet
          </p>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            justifyContent: 'center'
          }}>
            {/* Purchase Form - Left Side */}
            <div style={{
              flex: '1',
              minWidth: '300px',
              maxWidth: '500px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '15px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                color: '#ff2d95',
                textAlign: 'center'
              }}>
                Purchase Tokens
              </h3>
              
              {/* SOL Amount Input and Slider */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <label style={{ color: '#aaa' }}>SOL Amount:</label>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: '#ff2d95',
                    fontSize: '1.2rem'
                  }}>
                    {solAmount.toFixed(1)} SOL
                  </span>
                </div>
                
                {/* Manual Input Field */}
                <div style={{ marginBottom: '1rem' }}>
                  <input 
                    type="number" 
                    min="0.1" 
                    max="10" 
                    step="0.1" 
                    value={solAmount}
                    onChange={handleInputChange}
                    placeholder="Enter SOL amount"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                
                {/* Slider */}
                <input 
                  type="range" 
                  min="0.1" 
                  max="10" 
                  step="0.1" 
                  value={solAmount}
                  onChange={handleSliderChange}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    outline: 'none',
                    WebkitAppearance: 'none'
                  }}
                />
                
                {/* Custom slider thumb styling */}
                <style>
                  {`
                    input[type="range"]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #ff2d95;
                      cursor: pointer;
                    }
                    input[type="range"]::-moz-range-thumb {
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #ff2d95;
                      cursor: pointer;
                      border: none;
                    }
                  `}
                </style>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem',
                  color: '#777',
                  fontSize: '0.9rem'
                }}>
                  <span>0.1 SOL</span>
                  <span>10 SOL</span>
                </div>
              </div>
              
              {/* ROT Amount Display */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  color: '#aaa', 
                  marginBottom: '0.5rem',
                  display: 'block'
                }}>
                  You will receive:
                </label>
                <div style={{
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(90deg, #ff2d95, #8a2be2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {formatNumber(rotAmount)} ROT
                  </div>
                  <div style={{ 
                    color: '#aaa',
                    marginTop: '0.5rem'
                  }}>
                    (50% Bonus - Phase 1)
                  </div>
                </div>
              </div>
              
              {/* Social Verification - Hidden by default, shown when social verification is needed */}
              <div id="socialVerification" style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(138,43,226,0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(138,43,226,0.3)',
                display: 'none'
              }}>
                <h4 style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#8a2be2',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  Social Verification Required
                </h4>
                
                <p style={{
                  color: '#ddd',
                  marginBottom: '1rem',
                  lineHeight: '1.6',
                  textAlign: 'center'
                }}>
                  Please join our community to proceed with your purchase:
                </p>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  alignItems: 'center'
                }}>
                  <a 
                    href="https://t.me/rottedbrains" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.8rem 1.5rem',
                      background: 'linear-gradient(90deg, #229ED9, #1e88e5)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      // In a real app, you would track this action
                      console.log('Telegram link clicked');
                    }}
                  >
                    <span>Join Telegram</span>
                  </a>
                  
                  <a 
                    href="https://x.com/kiralykaro61319?s=21" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.8rem 1.5rem',
                      background: 'linear-gradient(90deg, #1DA1F2, #0d8bd9)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      // In a real app, you would track this action
                      console.log('X link clicked');
                    }}
                  >
                    <span>Follow on X</span>
                  </a>
                  
                  <button
                    onClick={() => {
                      // Mark as verified in localStorage
                      localStorage.setItem('socialVerified', 'true');
                      // Hide the social verification section
                      const socialVerification = document.getElementById('socialVerification');
                      if (socialVerification) {
                        socialVerification.style.display = 'none';
                      }
                      // Clear the transaction status message
                      setTransactionStatus('');
                    }}
                    style={{
                      padding: '0.8rem 1.5rem',
                      background: 'linear-gradient(90deg, #ff2d95, #8a2be2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginTop: '0.5rem'
                    }}
                  >
                    I've Completed These Steps
                  </button>
                </div>
              </div>
              
              {/* Buy Button */}
              <button 
                onClick={handlePurchase}
                disabled={isProcessing || !connected}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: isProcessing || !connected 
                    ? 'linear-gradient(90deg, #666, #888)' 
                    : 'linear-gradient(90deg, #ff2d95, #8a2be2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: isProcessing || !connected ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.2s',
                  opacity: isProcessing || !connected ? 0.7 : 1
                }}
                onMouseDown={(e) => {
                  if (!isProcessing && connected) {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }
                }}
                onMouseUp={(e) => {
                  if (!isProcessing && connected) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing && connected) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {isProcessing ? 'Processing...' : connected ? `Buy ${formatNumber(rotAmount)} $ROT` : 'Connect Wallet to Buy'}
              </button>
              
              {/* Transaction Status */}
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.2)',
                textAlign: 'center',
                color: transactionStatus.includes('successful') ? '#00ff9d' : transactionStatus.includes('failed') ? '#ff5e00' : '#00dbde',
                display: transactionStatus ? 'block' : 'none'
              }}>
                {transactionStatus}
              </div>
              
              {/* Manual Payment - Hidden by default, shown only on error */}
              <div id="manualPayment" style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                background: 'rgba(255,94,0,0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(255,94,0,0.3)',
                display: transactionStatus.includes('failed') ? 'block' : 'none'
              }}>
                <h4 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#ff5e00',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  Manual Payment Option
                </h4>
                
                <p style={{
                  color: '#ddd',
                  marginBottom: '1rem',
                  lineHeight: '1.6'
                }}>
                  If you&#39;re experiencing issues with the Phantom wallet integration, you can manually send SOL to this address:
                </p>
                
                <div style={{
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    color: '#00dbde',
                    wordBreak: 'break-all'
                  }}>
                    4vztUxqbpYwb48xRFSqqHZEGFcDW15WGEHth6SE4mU91
                  </div>
                </div>
                
                <p style={{
                  color: '#ddd',
                  lineHeight: '1.6'
                }}>
                  After sending, please contact support with your transaction ID. Your tokens will be delivered manually within 1-2 hours.
                  Make sure you have joined our Telegram group (https://t.me/rottedbrains) and followed us on X (https://x.com/kiralykaro61319?s=21) before purchasing.
                </p>
              </div>
            </div>
            
            {/* Information Panel - Right Side */}
            <div style={{
              flex: '1',
              minWidth: '300px',
              maxWidth: '500px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '15px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                color: '#00dbde',
                textAlign: 'center'
              }}>
                Purchase Information
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(138,43,226,0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(138,43,226,0.2)'
                }}>
                  <h4 style={{
                    color: '#8a2be2',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>
                    Current Phase
                  </h4>
                  <p style={{ color: '#ddd' }}>
                    Phase 1: 50% Bonus
                    <br />
                    <span style={{ fontSize: '0.9rem', color: '#aaa' }}>
                      1 SOL = 1,500,000 ROT
                    </span>
                  </p>
                </div>
                
                <div style={{
                  padding: '1rem',
                  background: 'rgba(0,219,222,0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,219,222,0.2)'
                }}>
                  <h4 style={{
                    color: '#00dbde',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>
                    How to Buy
                  </h4>
                  <p style={{ color: '#ddd', fontSize: '0.9rem' }}>
                    1. Connect your Phantom wallet
                    <br />
                    2. Select SOL amount (0.1 - 10 SOL)
                    <br />
                    3. Click &#34;Buy with Phantom Wallet&#34;
                    <br />
                    4. Confirm transaction in wallet
                  </p>
                </div>
                
                <div style={{
                  padding: '1rem',
                  background: 'rgba(255,45,149,0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,45,149,0.2)'
                }}>
                  <h4 style={{
                    color: '#ff2d95',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>
                    Need Help?
                  </h4>
                  <p style={{ color: '#ddd', fontSize: '0.9rem' }}>
                    If you encounter any issues, the manual payment option will appear after a failed transaction attempt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add JavaScript for slider and input synchronization */}
        <script>
          {`
            (function() {
              // Wait for DOM to be fully loaded
              function initTokenCalculator() {
                const slider = document.getElementById('solAmountSlider');
                const input = document.getElementById('solAmountInput');
                const solDisplay = document.getElementById('solAmountDisplay');
                const rotDisplay = document.getElementById('rotAmountDisplay');
                
                // Check if all elements exist before proceeding
                if (!slider || !input || !solDisplay || !rotDisplay) {
                  console.warn('Token calculator elements not found');
                  return;
                }
                
                // Format number with commas
                function formatNumber(num) {
                  return num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
                }
                
                // Set initial values
                const initialSol = 1.0;
                solDisplay.textContent = initialSol.toFixed(1);
                rotDisplay.textContent = formatNumber(initialSol * 1500000);
                
                // Sync slider and input
                slider.addEventListener('input', function() {
                  const value = parseFloat(this.value);
                  input.value = value;
                  solDisplay.textContent = value.toFixed(1);
                  rotDisplay.textContent = formatNumber(Math.floor(value * 1500000));
                });
                
                input.addEventListener('input', function() {
                  let value = parseFloat(this.value);
                  if (isNaN(value)) value = 0.1;
                  if (value < 0.1) value = 0.1;
                  if (value > 10) value = 10;
                  slider.value = value;
                  solDisplay.textContent = value.toFixed(1);
                  rotDisplay.textContent = formatNumber(Math.floor(value * 1500000));
                });
              }
              
              // Add slow increasing animation for phase 1 progress bar
              function animatePhase1Progress() {
                const progressBar = document.getElementById('phase1Progress');
                if (progressBar) {
                  // Reset to 0% for animation
                  progressBar.style.width = '0%';
                  
                  // Animate to 36% over 3 seconds
                  setTimeout(() => {
                    progressBar.style.transition = 'width 3s ease-in-out';
                    progressBar.style.width = '36%';
                  }, 100);
                }
              }
              
              // Initialize both functions when DOM is loaded
              function initializeAll() {
                initTokenCalculator();
                animatePhase1Progress();
              }
              
              // Initialize the animation when DOM is loaded
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeAll);
              } else {
                initializeAll();
              }
            })();
          `}
        </script>

        {/* Bonus Features Section */}
        <div id="features" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* 50% Bonus Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,45,149,0.2), rgba(255,94,0,0.2))',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #ff2d95',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              color: '#ff2d95'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V12M21 12V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V12M21 12H3" stroke="#ff2d95" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 5V19" stroke="#ff2d95" strokeWidth="2" strokeLinecap="round"/>
                <path d="M7 8L10 11L7 14" stroke="#ff2d95" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 8L14 11L17 14" stroke="#ff2d95" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#ff2d95',
              marginBottom: '0.5rem'
            }}>
              50% Bonus Tokens
            </h3>
            <p style={{
              color: '#ddd',
              fontSize: '0.9rem'
            }}>
              Double your $ROT allocation with our limited-time bonus offer
            </p>
          </div>
          
          {/* Early Access Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(138,43,226,0.2), rgba(0,219,222,0.2))',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #8a2be2',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              color: '#8a2be2'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15" stroke="#8a2be2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12Z" stroke="#8a2be2" strokeWidth="2"/>
                <path d="M12 3V6" stroke="#8a2be2" strokeWidth="2" strokeLinecap="round"/>
                <path d="M21 12H18" stroke="#8a2be2" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#8a2be2',
              marginBottom: '0.5rem'
            }}>
              Early Access Price
            </h3>
            <p style={{
              color: '#ddd',
              fontSize: '0.9rem'
            }}>
              Get $ROT at the lowest price before public launch
            </p>
          </div>
          
          {/* Instant Delivery Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,219,222,0.2), rgba(0,255,157,0.2))',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #00dbde',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              color: '#00dbde'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V22" stroke="#00dbde" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 2L19 9L12 2Z" stroke="#00dbde" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2L5 9L12 2Z" stroke="#00dbde" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 15H19" stroke="#00dbde" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 20H21" stroke="#00dbde" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#00dbde',
              marginBottom: '0.5rem'
            }}>
              Instant Delivery
            </h3>
            <p style={{
              color: '#ddd',
              fontSize: '0.9rem'
            }}>
              Tokens delivered immediately after payment confirmation
            </p>
          </div>
        </div>

        {/* PRESALE PHASES SECTION */}
        <div style={{
          background: 'rgba(10, 5, 20, 0.9)',
          borderRadius: '15px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(138, 43, 226, 0.5)',
          boxShadow: '0 0 20px rgba(138, 43, 226, 0.3)'
        }}>
          <h2 style={{
            fontSize: '2.8rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#8a2be2',
            textShadow: '0 0 10px rgba(138, 43, 226, 0.7)'
          }}>
            Presale Phases
          </h2>
          
          <p style={{
            fontSize: '1.2rem',
            color: '#ddd',
            marginBottom: '2rem',
            fontStyle: 'italic'
          }}>
            Maximize your gains with our tiered bonus structure
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem'
          }}>
            {/* Phase 1 */}
            <div style={{
              background: 'rgba(255,45,149,0.15)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid #ff2d95',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#ff2d95',
                color: 'white',
                padding: '0.5rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                borderRadius: '4px',
                zIndex: 1
              }}>
                ACTIVE
              </div>
              
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#ff2d95',
                marginBottom: '1rem'
              }}>
                Phase 1
              </h3>
              
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #ff2d95, #ff5e00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>
                50% BONUS
              </div>
              
              <p style={{
                fontSize: '1.1rem',
                color: '#ddd',
                marginBottom: '1rem'
              }}>
                1 SOL = 1,500,000 $ROT
              </p>
              
              <div style={{
                height: '10px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '5px',
                overflow: 'hidden',
                marginBottom: '0.5rem'
              }}>
                <div
                  id="phase1Progress"
                  style={{
                    height: '100%',
                    width: '36%',
                    background: 'linear-gradient(90deg, #ff2d95, #ff5e00)',
                    borderRadius: '5px',
                    transition: 'width 2s ease-in-out'
                  }}
                ></div>
              </div>
              
              <p style={{
                fontSize: '0.9rem',
                color: '#aaa'
              }}>
                36% SOLD • Ends in 24 hours
              </p>
            </div>
            
            {/* Phase 2 */}
            <div style={{
              background: 'rgba(0,219,222,0.15)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid #00dbde',
              opacity: '0.7'
            }}>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#00dbde',
                marginBottom: '1rem'
              }}>
                Phase 2
              </h3>
              
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #00dbde, #00ff9d)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>
                30% BONUS
              </div>
              
              <p style={{
                fontSize: '1.1rem',
                color: '#ddd',
                marginBottom: '1rem'
              }}>
                1 SOL = 1,300,000 $ROT
              </p>
              
              <div style={{
                height: '10px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '5px',
                overflow: 'hidden',
                marginBottom: '0.5rem'
              }}>
                <div 
                  id="phase2Progress"
                  style={{
                    height: '100%',
                    width: '0%',
                    background: 'linear-gradient(90deg, #00dbde, #00ff9d)',
                    borderRadius: '5px'
                  }}
                >
                </div>
              </div>
              
              <p style={{
                fontSize: '0.9rem',
                color: '#aaa'
              }}>
                Not started yet
              </p>
            </div>
            
            {/* Phase 3 */}
            <div style={{
              background: 'rgba(138,43,226,0.15)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid #8a2be2',
              opacity: '0.7'
            }}>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#8a2be2',
                marginBottom: '1rem'
              }}>
                Phase 3
              </h3>
              
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #8a2be2, #ff2d95)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>
                15% BONUS
              </div>
              
              <p style={{
                fontSize: '1.1rem',
                color: '#ddd',
                marginBottom: '1rem'
              }}>
                1 SOL = 1,150,000 $ROT
              </p>
              
              <div style={{
                height: '10px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '5px',
                overflow: 'hidden',
                marginBottom: '0.5rem'
              }}>
                <div 
                  id="phase2Progress"
                  style={{
                    height: '100%',
                    width: '0%',
                    background: 'linear-gradient(90deg, #00dbde, #00ff9d)',
                    borderRadius: '5px'
                  }}
                ></div>
              </div>
              
              <p style={{
                fontSize: '0.9rem',
                color: '#aaa'
              }}>
                Not started yet
              </p>
            </div>
          </div>
        </div>

        {/* MEMES SECTION */}
        <div style={{
          background: 'rgba(10, 5, 20, 0.9)',
          borderRadius: '15px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 45, 149, 0.5)',
          boxShadow: '0 0 20px rgba(255, 45, 149, 0.3)'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#ff2d95',
            textShadow: '0 0 10px rgba(255, 45, 149, 0.7)',
            textAlign: 'center'
          }}>
            Viral Memes
          </h2>
          
          <p style={{
            fontSize: '1.2rem',
            color: '#ddd',
            marginBottom: '2rem',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            The most brainrotting memes in the crypto space
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem'
          }}>
            {/* Meme 1 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 45, 149, 0.3)',
              overflow: 'hidden',
              aspectRatio: '1/1'
            }}>
              <img 
                src="./meme1.png" 
                alt="Meme 1" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLDivElement;
                  target.style.display = 'none';
                  if (nextSibling) {
                    nextSibling.style.display = 'flex';
                  }
                }}
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLDivElement;
                  if (nextSibling) {
                    nextSibling.style.display = 'none';
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }} 
              />
              <div style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#777',
                fontSize: '0.9rem',
                textAlign: 'center',
                padding: '1rem'
              }}>
                Meme 1
              </div>
            </div>
            
            {/* Meme 2 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 219, 222, 0.3)',
              overflow: 'hidden',
              aspectRatio: '1/1'
            }}>
              <img 
                src="./meme2.png" 
                alt="Meme 2" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLDivElement;
                  target.style.display = 'none';
                  if (nextSibling) {
                    nextSibling.style.display = 'flex';
                  }
                }}
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLDivElement;
                  if (nextSibling) {
                    nextSibling.style.display = 'none';
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }} 
              />
              <div style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#777',
                fontSize: '0.9rem',
                textAlign: 'center',
                padding: '1rem'
              }}>
                Meme 2
              </div>
            </div>
            
            {/* Meme 3 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              overflow: 'hidden',
              aspectRatio: '1/1'
            }}>
              <img 
                src="./meme3.png" 
                alt="Meme 3" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLDivElement;
                  target.style.display = 'none';
                  if (nextSibling) {
                    nextSibling.style.display = 'flex';
                  }
                }}
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLDivElement;
                  if (nextSibling) {
                    nextSibling.style.display = 'none';
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }} 
              />
              <div style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#777',
                fontSize: '0.9rem',
                textAlign: 'center',
                padding: '1rem'
              }}>
                Meme 3
              </div>
            </div>
            
            {/* Meme 4 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 94, 0, 0.3)',
              overflow: 'hidden',
              aspectRatio: '1/1'
            }}>
              <img 
                src="./meme4.png" 
                alt="Meme 4" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLDivElement;
                  target.style.display = 'none';
                  if (nextSibling) {
                    nextSibling.style.display = 'flex';
                  }
                }}
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLDivElement;
                  if (nextSibling) {
                    nextSibling.style.display = 'none';
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }} 
              />
              <div style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#777',
                fontSize: '0.9rem',
                textAlign: 'center',
                padding: '1rem'
              }}>
                Meme 4
              </div>
            </div>
            
            {/* Meme 5 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 255, 157, 0.3)',
              overflow: 'hidden',
              aspectRatio: '1/1'
            }}>
              <img 
                src="./meme5.png" 
                alt="Meme 5" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLDivElement;
                  target.style.display = 'none';
                  if (nextSibling) {
                    nextSibling.style.display = 'flex';
                  }
                }}
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLDivElement;
                  if (nextSibling) {
                    nextSibling.style.display = 'none';
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }} 
              />
              <div style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#777',
                fontSize: '0.9rem',
                textAlign: 'center',
                padding: '1rem'
              }}>
                Meme 5
              </div>
            </div>
            
            {/* Meme 6 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 45, 149, 0.3)',
              overflow: 'hidden',
              aspectRatio: '1/1'
            }}>
              <img 
                src="./meme6.png" 
                alt="Meme 6" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLDivElement;
                  target.style.display = 'none';
                  if (nextSibling) {
                    nextSibling.style.display = 'flex';
                  }
                }}
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  const nextSibling = target.nextElementSibling as HTMLDivElement;
                  if (nextSibling) {
                    nextSibling.style.display = 'none';
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }} 
              />
              <div style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#777',
                fontSize: '0.9rem',
                textAlign: 'center',
                padding: '1rem'
              }}>
                Meme 6
              </div>
            </div>
          </div>
        </div>

        <WhyChooseRot />

        {/* COMMUNITY SECTION */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,45,149,0.1), rgba(138,43,226,0.1))',
          borderRadius: '15px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 94, 0, 0.3)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            background: 'linear-gradient(90deg, #ff5e00, #ff2d95)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            backgroundClip: 'text'
          }}>
            Join Our Community
          </h2>
          
          <p style={{
            fontSize: '1.2rem',
            color: '#ddd',
            marginBottom: '2rem',
            fontStyle: 'italic'
          }}>
            Be part of the BrainRot revolution and connect with fellow meme enthusiasts
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <a href="https://t.me/rottedbrains" target="_blank" rel="noopener noreferrer" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#fff',
              padding: '1.5rem',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 94, 0, 0.3)',
              minWidth: '150px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 94, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                color: '#ff5e00'
              }}>

              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#4d94ff',
                marginBottom: '0.5rem'
              }}>
                Telegram
              </h3>
              <p style={{
                color: '#4d94ff',
                fontSize: '0.9rem'
              }}>
                Join our community chat
              </p>
            </a>
            
            <a href="https://x.com/kiralykaro61319?s=21" target="_blank" rel="noopener noreferrer" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#fff',
              padding: '1.5rem',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 45, 149, 0.3)',
              minWidth: '150px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 45, 149, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                color: '#ff2d95'
              }}>

              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '0.5rem'
              }}>
                X
              </h3>
              <p style={{
                color: '#ffffff',
                fontSize: '0.9rem'
              }}>
                Follow for updates
              </p>
            </a>
          </div>
        </div>

        {/* SCARCITY INDICATOR */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,94,0,0.2), rgba(255,45,149,0.2))',
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 94, 0, 0.3)'
        }}>
          <p style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#ff5e00'
          }}>
            🚨 ONLY 416.6 SOL LEFT!
          </p>
          <p style={{
            fontSize: '1rem',
            color: '#ddd',
            marginBottom: '1rem'
          }}>
            Once this hardcap is reached, the presale will close immediately.
          </p>
          <div style={{
            height: '20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: '43%',
              background: 'linear-gradient(90deg, #ff2d95, #ff5e00)',
              borderRadius: '10px'
            }}></div>
          </div>
          <p style={{
            fontSize: '0.9rem',
            color: '#aaa',
            marginTop: '0.5rem'
          }}>
            43% SOLD - Almost full!
          </p>
        </div>

        {/* TOKENOMICS SECTION */}
        <TokenInfo />

        {/* FAQ SECTION */}
        <div style={{
          background: '#000000',
          borderRadius: '15px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            background: 'linear-gradient(90deg, #8a2be2, #ff2d95)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            backgroundClip: 'text',
            textAlign: 'center'
          }}>
            Frequently Asked Questions
          </h2>
          
          <p style={{
            fontSize: '1.2rem',
            color: '#ddd',
            marginBottom: '2rem',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            Everything you need to know about $BRAINROT
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* FAQ Item 1 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 45, 149, 0.3)',
              overflow: 'hidden'
            }}>
              <details>
                <summary style={{
                  padding: '1.2rem',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#ff2d95',
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>What is $BRAINROT?</span>
                  <span style={{ fontSize: '1.5rem' }}>+</span>
                </summary>
                <div style={{
                  padding: '0 1.2rem 1.2rem',
                  color: '#ddd',
                  lineHeight: '1.6',
                  borderTop: '1px solid rgba(255, 45, 149, 0.2)'
                }}>
                  <p>$BRAINROT is the ultimate memecoin designed to give you maximum brainrot. It&#39;s a community-driven token on Solana with 0% tax, 95% liquidity locked, and built for viral growth and meme culture domination.</p>
                </div>
              </details>
            </div>
            
            {/* FAQ Item 2 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 219, 222, 0.3)',
              overflow: 'hidden'
            }}>
              <details>
                <summary style={{
                  padding: '1.2rem',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#00dbde',
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>How do I buy $ROT tokens?</span>
                  <span style={{ fontSize: '1.5rem' }}>+</span>
                </summary>
                <div style={{
                  padding: '0 1.2rem 1.2rem',
                  color: '#ddd',
                  lineHeight: '1.6',
                  borderTop: '1px solid rgba(0, 219, 222, 0.2)'
                }}>
                  <p>You can buy $ROT directly on our website using Phantom wallet or manual SOL transfer. During presale, you get 50% bonus tokens! Simply connect your wallet, enter the SOL amount, and receive your tokens instantly.</p>
                </div>
              </details>
            </div>
            
            {/* FAQ Item 3 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              overflow: 'hidden'
            }}>
              <details>
                <summary style={{
                  padding: '1.2rem',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#8a2be2',
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>What makes $BRAINROT different?</span>
                  <span style={{ fontSize: '1.5rem' }}>+</span>
                </summary>
                <div style={{
                  padding: '0 1.2rem 1.2rem',
                  color: '#ddd',
                  lineHeight: '1.6',
                  borderTop: '1px solid rgba(138, 43, 226, 0.2)'
                }}>
                  <p>Unlike other memecoins, $BRAINROT has 0% buy/sell tax, 95% locked liquidity, instant token delivery, and a vibrant community. We&#39;re building an entire ecosystem with games, NFTs, and real utility while maintaining maximum meme energy.</p>
                </div>
              </details>
            </div>
            
            {/* FAQ Item 4 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 94, 0, 0.3)',
              overflow: 'hidden'
            }}>
              <details>
                <summary style={{
                  padding: '1.2rem',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#ff5e00',
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Is $BRAINROT safe?</span>
                  <span style={{ fontSize: '1.5rem' }}>+</span>
                </summary>
                <div style={{
                  padding: '0 1.2rem 1.2rem',
                  color: '#ddd',
                  lineHeight: '1.6',
                  borderTop: '1px solid rgba(255, 94, 0, 0.2)'
                }}>
                  <p>Yes! Our smart contract is audited, 95% of liquidity is permanently locked, there&#39;s 0% tax, and the team tokens are vested. We&#39;re fully transparent with our tokenomics and security measures.</p>
                </div>
              </details>
            </div>
            
            {/* FAQ Item 5 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 255, 157, 0.3)',
              overflow: 'hidden'
            }}>
              <details>
                <summary style={{
                  padding: '1.2rem',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#00ff9d',
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>When will $ROT be listed on exchanges?</span>
                  <span style={{ fontSize: '1.5rem' }}>+</span>
                </summary>
                <div style={{
                  padding: '0 1.2rem 1.2rem',
                  color: '#ddd',
                  lineHeight: '1.6',
                  borderTop: '1px solid rgba(0, 255, 157, 0.2)'
                }}>
                  <p>We&#39;re planning DEX listings in Q2 2025 followed by major CEX listings. Presale participants get the best price before public launch. Join our Telegram for the latest updates on exchange listings.</p>
                </div>
              </details>
            </div>
            
            {/* FAQ Item 6 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 45, 149, 0.3)',
              overflow: 'hidden'
            }}>
              <details>
                <summary style={{
                  padding: '1.2rem',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#ff2d95',
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>What&#39;s the presale bonus?</span>
                  <span style={{ fontSize: '1.5rem' }}>+</span>
                </summary>
                <div style={{
                  padding: '0 1.2rem 1.2rem',
                  color: '#ddd',
                  lineHeight: '1.6',
                  borderTop: '1px solid rgba(255, 45, 149, 0.2)'
                }}>
                  <p>During Phase 1 presale, you get 50% bonus tokens! So if you buy 1M $ROT, you receive 1.5M $ROT total. This bonus decreases in later phases, so early supporters get the best deal.</p>
                </div>
              </details>
            </div>
            
            {/* FAQ Item 7 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 219, 222, 0.3)',
              overflow: 'hidden'
            }}>
              <details>
                <summary style={{
                  padding: '1.2rem',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#00dbde',
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>How can I join the community?</span>
                  <span style={{ fontSize: '1.5rem' }}>+</span>
                </summary>
                <div style={{
                  padding: '0 1.2rem 1.2rem',
                  color: '#ddd',
                  lineHeight: '1.6',
                  borderTop: '1px solid rgba(0, 219, 222, 0.2)'
                }}>
                  <p>Join our active Telegram channel, Discord server, and follow us on X (Twitter). We have daily discussions, meme contests, exclusive alpha, and regular community events. Links are available on our website.</p>
                </div>
              </details>
            </div>
            
            {/* FAQ Item 8 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              overflow: 'hidden'
            }}>
              <details>
                <summary style={{
                  padding: '1.2rem',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#8a2be2',
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>What&#39;s the roadmap for $BRAINROT?</span>
                  <span style={{ fontSize: '1.5rem' }}>+</span>
                </summary>
                <div style={{
                  padding: '0 1.2rem 1.2rem',
                  color: '#ddd',
                  lineHeight: '1.6',
                  borderTop: '1px solid rgba(138, 43, 226, 0.2)'
                }}>
                  <p>We&#39;re building a complete ecosystem: Q1 presale and community building, Q2 exchange listings, Q3 games and NFTs, Q4 global expansion and metaverse integration. Check our roadmap section for detailed milestones.</p>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#777',
          fontSize: '0.9rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          marginTop: '2rem'
        }}>
          <p>© 2025 $BRAINROT - The Ultimate Memecoin Experience</p>
        </div>
      </div>
    </div>
  );
}
