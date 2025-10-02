"use client";

import { useState } from 'react';
import './ROICalculator.css';

export default function ROICalculator() {
  const [investment, setInvestment] = useState(100);
  const tokensPerSOL = 1500000;
  const solPrice = 150; // Approximate SOL price in USD

  const calculateROI = (targetPrice: number) => {
    const solAmount = investment / solPrice;
    const tokens = solAmount * tokensPerSOL;
    return (tokens * targetPrice).toFixed(0);
  };

  return (
    <div className="roi-calculator-container">
      <h3 className="roi-title">💰 ROI Calculator</h3>
      <p className="roi-subtitle">See your potential gains!</p>

      <div className="investment-input-section">
        <label className="input-label">Your Investment (USD)</label>
        <input
          type="number"
          value={investment}
          onChange={(e) => setInvestment(Number(e.target.value))}
          className="investment-input"
          min="10"
          max="100000"
        />
        <input
          type="range"
          value={investment}
          onChange={(e) => setInvestment(Number(e.target.value))}
          className="investment-slider"
          min="10"
          max="10000"
          step="10"
        />
      </div>

      <div className="roi-results">
        <div className="roi-item roi-conservative">
          <div className="roi-scenario">If $ROT = $0.001</div>
          <div className="roi-value">${calculateROI(0.001)}</div>
          <div className="roi-multiplier">10x Return</div>
        </div>

        <div className="roi-item roi-moderate">
          <div className="roi-scenario">If $ROT = $0.01</div>
          <div className="roi-value">${calculateROI(0.01)}</div>
          <div className="roi-multiplier">100x Return</div>
        </div>

        <div className="roi-item roi-moon">
          <div className="roi-scenario">If $ROT = $0.10</div>
          <div className="roi-value">${calculateROI(0.10)}</div>
          <div className="roi-multiplier">1000x Return 🚀</div>
        </div>
      </div>

      <div className="roi-disclaimer">
        * Calculations based on current presale price. Not financial advice.
      </div>
    </div>
  );
}