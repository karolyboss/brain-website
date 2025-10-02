"use client";

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Navbar() {
  const { publicKey } = useWallet();

  const navLinks = [
    { href: '#features', text: 'Features' },
    { href: '/minigame', text: 'Game' },
    { href: '#presale', text: 'Presale' },
    { href: '#roadmap', text: 'Roadmap' },
    { href: '#community', text: 'Community' }
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.text}
            </Link>
          ))}
        </div>
        <WalletMultiButton />
      </div>
    </nav>
  );
}
