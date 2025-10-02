"use client";

import { useState, useEffect } from 'react';
import './LiveStats.css';

export default function LiveStats() {
  const [totalRaised, setTotalRaised] = useState(127543);
  const [holders, setHolders] = useState(2847);
  const [solLeft, setSolLeft] = useState(416.6);

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalRaised(prev => prev + Math.floor(Math.random() * 500) + 100);
      setHolders(prev => prev + Math.floor(Math.random() * 3));
      setSolLeft(prev => Math.max(0, prev - (Math.random() * 0.5)));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-stats-container">
      <div className="live-stats-header">
        <span className="live-pulse"></span>
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