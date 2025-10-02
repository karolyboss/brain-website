"use client";

import { useState, useEffect } from 'react';
import './LiveTicker.css';

interface Purchase {
  id: number;
  name: string;
  amount: string;
  time: string;
}

const names = ['Sarah', 'Mike', 'Alex', 'Emma', 'John', 'Lisa', 'David', 'Maria', 'Chris', 'Anna'];
const amounts = ['10,000', '25,000', '50,000', '75,000', '100,000', '150,000', '200,000'];

export default function LiveTicker() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    // Generate initial purchases
    const initial = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      name: names[Math.floor(Math.random() * names.length)],
      amount: amounts[Math.floor(Math.random() * amounts.length)],
      time: `${Math.floor(Math.random() * 10) + 1} mins ago`
    }));
    setPurchases(initial);

    // Add new purchase every 8-15 seconds
    const interval = setInterval(() => {
      const newPurchase = {
        id: Date.now(),
        name: names[Math.floor(Math.random() * names.length)],
        amount: amounts[Math.floor(Math.random() * amounts.length)],
        time: 'Just now'
      };

      setPurchases(prev => [newPurchase, ...prev.slice(0, 4)]);
    }, Math.random() * 7000 + 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-ticker-container">
      <div className="ticker-header">
        <span className="ticker-pulse"></span>
        <span className="ticker-title">🔥 Recent Purchases</span>
      </div>

      <div className="ticker-list">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="ticker-item">
            <div className="ticker-avatar">{purchase.name[0]}</div>
            <div className="ticker-content">
              <div className="ticker-text">
                <strong>{purchase.name}</strong> bought <strong>{purchase.amount} $ROT</strong>
              </div>
              <div className="ticker-time">{purchase.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}