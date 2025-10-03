'use client';
import { useState, useEffect } from 'react';

const PRESALE_DATA = {
  hardcap: 5000, // in SOL
  currentPhase: 1,
  phases: [
    { id: 1, bonus: 50, cap: 2000, endDate: '2025-10-10' },
    { id: 2, bonus: 30, cap: 3000, endDate: '2025-10-20' }
  ]
};

export default function PresaleProgress() {
  const [stats, setStats] = useState({
    raised: 1250, // in SOL
    contributors: 842,
    transactions: 1567
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        raised: Math.min(PRESALE_DATA.hardcap, prev.raised + (Math.random() * 10)),
        contributors: prev.contributors + Math.floor(Math.random() * 3)
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentPhase = PRESALE_DATA.phases.find(p => p.id === PRESALE_DATA.currentPhase)!;
  const progressPercent = Math.min(100, (stats.raised / currentPhase.cap) * 100);

  return (
    <div className="presale-progress">
      {/* Phase Indicator */}
      <div className="phase-banner">
        <span>PHASE {currentPhase.id}</span>
        <strong>{currentPhase.bonus}% BONUS</strong>
        <span>Ends in {getDaysLeft(currentPhase.endDate)} days</span>
      </div>

      {/* Main Progress Bar */}
      <div className="progress-container">
        <div 
          className="progress-fill"
          style={{ width: `${progressPercent}%` }}
        ></div>
        <div className="progress-labels">
          <span>0 SOL</span>
          <span>{currentPhase.cap.toLocaleString()} SOL</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard value={`${stats.raised.toFixed(1)} SOL`} label="Raised" />
        <StatCard value={`${stats.contributors}`} label="Investors" />
        <StatCard value={`${stats.transactions}`} label="Transactions" />
        <StatCard value={`${getDaysLeft(currentPhase.endDate)}`} label="Days Left" />
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat-card">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  );
}

function getDaysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
