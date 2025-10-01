"use client";

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect, useCallback } from 'react';

export default function Navbar() {
  const { publicKey, connected, disconnect } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Function to get balance from localStorage or initialize to 0
  const getInitialBalance = useCallback(() => {
    if (!publicKey) return 0;
    
    const storedBalance = localStorage.getItem(`rotBalance_${publicKey.toString()}`);
    return storedBalance ? parseFloat(storedBalance) : 0;
  }, [publicKey]);

  // Function to update balance in state and localStorage
  const updateBalance = useCallback((newBalance: number) => {
    if (!publicKey) return;
    
    setBalance(newBalance);
    localStorage.setItem(`rotBalance_${publicKey.toString()}`, newBalance.toString());
  }, [publicKey]);

  // Function to add tokens to balance
  const addTokensToBalance = useCallback((tokens: number) => {
    if (!publicKey) return;
    
    const currentBalance = getInitialBalance();
    const newBalance = currentBalance + tokens;
    updateBalance(newBalance);
  }, [publicKey, getInitialBalance, updateBalance]);

  // Mock function to simulate fetching token balance
  // In a real implementation, you would connect to the Solana network to fetch the actual $ROT balance
  const fetchTokenBalance = useCallback(async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get actual balance from localStorage instead of random number
    const actualBalance = getInitialBalance();
    setBalance(actualBalance);
    setIsLoading(false);
  }, [publicKey, getInitialBalance]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchTokenBalance();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, fetchTokenBalance]);

  // Listen for custom event to update balance after purchase
  useEffect(() => {
    const handleBalanceUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.tokens) {
        addTokensToBalance(event.detail.tokens);
      }
    };

    window.addEventListener('balanceUpdate' as any, handleBalanceUpdate as EventListener);
    return () => {
      window.removeEventListener('balanceUpdate' as any, handleBalanceUpdate as EventListener);
    };
  }, [addTokensToBalance]);

  return (
    <nav style={{
      background: 'linear-gradient(90deg, rgba(0,0,0,0.9), rgba(26, 3, 40, 0.9))',
      backdropFilter: 'blur(10px)',
      padding: '1rem 2rem',
      marginBottom: '2rem',
      borderRadius: '15px',
      border: '1px solid rgba(138, 43, 226, 0.5)',
      boxShadow: '0 0 20px rgba(138, 43, 226, 0.3)',
      position: 'sticky',
      top: '0',
      zIndex: '100'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Logo */}
        <div>
          <Link href="/" style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #ff2d95, #8a2be2, #00dbde)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textDecoration: 'none'
          }}>
            $ROT BrainRot
          </Link>
        </div>
        
        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <Link href="#features" style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = '#ff2d95';
            e.currentTarget.style.textShadow = '0 0 10px rgba(255, 45, 149, 0.7)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.textShadow = 'none';
          }}>
            Features
          </Link>
          
          <Link href="#tokenomics" style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = '#00dbde';
            e.currentTarget.style.textShadow = '0 0 10px rgba(0, 219, 222, 0.7)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.textShadow = 'none';
          }}>
            Tokenomics
          </Link>
          
          <Link href="#roadmap" style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = '#8a2be2';
            e.currentTarget.style.textShadow = '0 0 10px rgba(138, 43, 226, 0.7)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.textShadow = 'none';
          }}>
            Roadmap
          </Link>
          
          <Link href="#community" style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = '#ff5e00';
            e.currentTarget.style.textShadow = '0 0 10px rgba(255, 94, 0, 0.7)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.textShadow = 'none';
          }}>
            Community
          </Link>
        </div>
        
        {/* Wallet Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {connected && balance !== null && (
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(0, 219, 222, 0.5)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#00ff9d',
                boxShadow: '0 0 10px #00ff9d'
              }}></div>
              <span style={{
                color: '#00dbde',
                fontWeight: 'bold'
              }}>
                {isLoading ? 'Loading...' : `${balance.toLocaleString()} $ROT`}
              </span>
            </div>
          )}
          
          {/* Wallet Connection Button */}
          <div className="wallet-adapter-button-wrapper">
            <WalletMultiButton className="wallet-adapter-button" />
          </div>
        </div>
      </div>
    </nav>
  );
}