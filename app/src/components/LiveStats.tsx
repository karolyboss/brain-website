"use client";

import { useState, useEffect } from 'react';
import './LiveStats.css';

export default function LiveStats() {
  const [totalRaised, setTotalRaised] = useState(127543);
  const [holders, setHolders] = useState(415);
  const [solLeft, setSolLeft] = useState(416.6);

  useEffect(() => {
    // Listen for purchase events from LiveTicker
    const handlePurchase = () => {
      setHolders(prev => prev + 1);
      setTotalRaised(prev => prev + Math.floor(Math.random() * 500) + 100);
      setSolLeft(prev => Math.max(0, prev - (Math.random() * 0.5)));
    };

    window.addEventListener('newPurchase', handlePurchase);

    return () => window.removeEventListener('newPurchase', handlePurchase);
  }, []);

  return (
    <div className="live-stats-container">
      <div className="live-stats-header">
        <span className="live-text">LIVE STATS</span>
      </div>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">${totalRaised.toLocaleString()}</div>
            <div className="stat-label">Total Raised</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{holders.toLocaleString()}</div>
            <div className="stat-label">Holders</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">{solLeft.toFixed(1)} SOL</div>
            <div className="stat-label">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
}