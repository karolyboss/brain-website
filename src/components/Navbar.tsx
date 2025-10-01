"use client";

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect, useCallback } from 'react';

export default function Navbar() {
  const { publicKey, connected } = useWallet();
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const navLinks = document.querySelector('.nav-links');
      const mobileButton = document.querySelector('.mobile-menu-button');
      
      if (menuOpen && navLinks && mobileButton && 
          !navLinks.contains(event.target as Node) && 
          !mobileButton.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const getInitialBalance = useCallback(() => {
    if (!publicKey) return 0;
    const storedBalance = localStorage.getItem(`rotBalance_${publicKey.toString()}`);
    return storedBalance ? parseFloat(storedBalance) : 0;
  }, [publicKey]);

  const updateBalance = useCallback((newBalance: number) => {
    if (!publicKey) return;
    setBalance(newBalance);
    localStorage.setItem(`rotBalance_${publicKey.toString()}`, newBalance.toString());
  }, [publicKey]);

  const addTokensToBalance = useCallback((tokens: number) => {
    if (!publicKey) return;
    const currentBalance = getInitialBalance();
    const newBalance = currentBalance + tokens;
    updateBalance(newBalance);
  }, [publicKey, getInitialBalance, updateBalance]);

  const fetchTokenBalance = useCallback(async () => {
    if (!publicKey) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
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

  useEffect(() => {
    const handleBalanceUpdate = (event: CustomEvent) => {
      if (event.detail?.tokens) {
        addTokensToBalance(event.detail.tokens);
      }
    };

    window.addEventListener('balanceUpdate' as any, handleBalanceUpdate as EventListener);
    return () => window.removeEventListener('balanceUpdate' as any, handleBalanceUpdate as EventListener);
  }, [addTokensToBalance]);

  const navLinks = [
    { href: "#features", text: "Features", color: "#ff2d95" },
    { href: "#presale", text: "Presale", color: "#00dbde" },
    { href: "#tokenomics", text: "Tokenomics", color: "#8a2be2" },
    { href: "#roadmap", text: "Roadmap", color: "#ff5e00" },
    { href: "#community", text: "Community", color: "#00dbde" }
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div>
          <Link href="/" className="logo-link">
            $ROT BrainRot
          </Link>
        </div>

        {isMobile && (
          <button 
            className={`mobile-menu-button ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
          </button>
        )}

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: isMobile ? '1rem' : '1.1rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = link.color;
                e.currentTarget.style.textShadow = `0 0 10px ${link.color}99`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.textShadow = 'none';
              }}
            >
              {link.text}
            </Link>
          ))}
        </div>

        <div className="wallet-section">
          {connected && publicKey && (
            <div className="balance-display">
              <div className="status-dot"></div>
              <span>
                {isLoading ? 'Loading...' : `${balance?.toLocaleString() || '0'} $ROT`}
              </span>
            </div>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}