'use client';
import { useState, useEffect } from 'react';

const COUNTRIES = ['US', 'UK', 'DE', 'JP', 'AU', 'SG', 'CA'];
const ACTIVITIES = ['bought', 'invested', 'joined', 'secured'];

export default function FomoCounter() {
  const [count, setCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  useEffect(() => {
    // Simulate random activity
    const interval = setInterval(() => {
      const newCount = count + Math.floor(Math.random() * 3) + 1;
      setCount(newCount);
      
      if (Math.random() > 0.5) {
        const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        const action = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
        const amount = (Math.random() * 10).toFixed(2);
        setRecentActivity(prev => [
          `${country} ${action} ${amount} SOL`,
          ...prev
        ].slice(0, 3));
      }
    }, 15000); // Every 15 seconds
    
    return () => clearInterval(interval);
  }, [count]);

  return (
    <div className="fomo-counter">
      <div className="fomo-message">
        🚀 <strong>{count}+ investors</strong> in last 24h
      </div>
      {recentActivity.length > 0 && (
        <div className="recent-activity">
          {recentActivity.map((item, i) => (
            <div key={i} className="activity-item">
              <span className="country-flag">{item.split(' ')[0]}</span>
              <span>{item.split(' ').slice(1).join(' ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
