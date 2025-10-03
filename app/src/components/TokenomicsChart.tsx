'use client';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';

Chart.register(ArcElement, Tooltip, Legend);

const TOKENOMICS = [
  { label: 'Presale', percent: 40, color: '#FF2D95', unlock: '2025-11-01' },
  { label: 'Liquidity', percent: 30, color: '#8A2BE2', unlock: '2025-10-15' },
  { label: 'Team', percent: 15, color: '#00DBDE', unlock: '2026-01-01', locked: true },
  { label: 'Marketing', percent: 10, color: '#FF5E00', unlock: '2025-12-01' },
  { label: 'Community', percent: 5, color: '#4CAF50', unlock: '2025-10-20' }
];

export default function TokenomicsChart() {
  const data = {
    labels: TOKENOMICS.map(t => t.label),
    datasets: [{
      data: TOKENOMICS.map(t => t.percent),
      backgroundColor: TOKENOMICS.map(t => t.color),
      borderWidth: 0
    }]
  };

  return (
    <div className="tokenomics-container">
      <div className="chart-container">
        <Doughnut data={data} options={{
          cutout: '70%',
          plugins: {
            legend: { position: 'right' }
          }
        }} />
      </div>
      
      <div className="details-container">
        {TOKENOMICS.map((item) => (
          <div key={item.label} className="detail-item">
            <div className="color-badge" style={{ background: item.color }}></div>
            <div className="detail-text">
              <strong>{item.label} - {item.percent}%</strong>
              <span>Unlocks: {format(new Date(item.unlock), 'MMM d, yyyy')}</span>
              {item.locked && <span className="locked-badge">LOCKED</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
