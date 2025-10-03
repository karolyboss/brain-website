'use client';
import { useState, useEffect } from 'react';

const BONUS_TIERS = [
  { min: 0, max: 5, bonus: 50, label: "Early Bird", color: "#FF2D95" },
  { min: 5, max: 10, bonus: 75, label: "Whale", color: "#8A2BE2" },
  { min: 10, max: 20, bonus: 100, label: "Alpha", color: "#00DBDE" }
];

export default function EnhancedCalculator() {
  const [solAmount, setSolAmount] = useState(1);
  const [currentTier, setCurrentTier] = useState(BONUS_TIERS[0]);
  const [nextTier, setNextTier] = useState(BONUS_TIERS[1]);
  const [referralCode, setReferralCode] = useState('');
  
  // Calculate values
  const totalBonus = referralCode ? currentTier.bonus + 5 : currentTier.bonus;
  const rotAmount = Math.floor(solAmount * 1000000 * (1 + totalBonus/100));

  useEffect(() => {
    const tier = BONUS_TIERS.find(t => solAmount >= t.min && solAmount < t.max) || BONUS_TIERS[0];
    const next = BONUS_TIERS[BONUS_TIERS.indexOf(tier) + 1] || null;
    
    setCurrentTier(tier);
    setNextTier(next);
  }, [solAmount]);

  return (
    <div className="calculator-container">
      {/* Tier Display */}
      <div className="tier-display" style={{ borderColor: currentTier.color }}>
        <span className="tier-badge" style={{ background: currentTier.color }}>
          {currentTier.label} Tier
        </span>
        <span>{totalBonus}% Total Bonus</span>
      </div>

      {/* Input */}
      <div className="input-group">
        <input
          type="range"
          min="0.1"
          max="20"
          step="0.1"
          value={solAmount}
          onChange={(e) => setSolAmount(parseFloat(e.target.value))}
        />
        <div className="input-value">
          <input
            type="number"
            min="0.1"
            max="20"
            step="0.1"
            value={solAmount}
            onChange={(e) => setSolAmount(parseFloat(e.target.value) || 0.1)}
          />
          <span>SOL</span>
        </div>
      </div>

      {/* Tier Progress */}
      {nextTier && (
        <div className="tier-progress">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${Math.min(100, ((solAmount - currentTier.min) / (nextTier.min - currentTier.min)) * 100)}%`,
              background: currentTier.color
            }}
          />
          <span>
            Add {(nextTier.min - solAmount).toFixed(1)} SOL for {nextTier.label} Tier ({nextTier.bonus}%)
          </span>
        </div>
      )}

      {/* ROI Comparison */}
      <div className="roi-comparison">
        <h4>Projected 30-Day Returns</h4>
        <div className="roi-bars">
          <div className="roi-bar your-roi" style={{ width: '75%' }}>
            <span>Your Potential: 75%</span>
          </div>
          <div className="roi-bar market-roi" style={{ width: '30%' }}>
            <span>Market Average: 30%</span>
          </div>
        </div>
      </div>

      {/* Referral Section */}
      <div className="referral-section">
        <h4>+5% Referral Bonus</h4>
        <input 
          type="text" 
          placeholder="Enter referral code (optional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="referral-input"
        />
        {referralCode && (
          <div className="referral-applied">
            +5% Bonus Applied!
          </div>
        )}
      </div>

      {/* Results */}
      <div className="results">
        <div className="result-row">
          <span>Your Investment:</span>
          <strong>{solAmount} SOL</strong>
        </div>
        <div className="result-row">
          <span>Base Bonus:</span>
          <strong>{currentTier.bonus}%</strong>
        </div>
        {referralCode && (
          <div className="result-row">
            <span>Referral Bonus:</span>
            <strong>+5%</strong>
          </div>
        )}
        <div className="result-row highlight">
          <span>Total $ROT:</span>
          <strong>{rotAmount.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}
