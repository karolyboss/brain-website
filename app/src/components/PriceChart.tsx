'use client';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useEffect, useState } from 'react';
import axios from 'axios';

Chart.register(...registerables);

export default function PriceChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulating API call - replace with actual CoinGecko API in production
        const mockData = {
          prices: Array(30).fill(0).map((_,i) => 0.05 + (Math.random() * 0.02)),
          market_caps: Array(30).fill(0).map((_,i) => 50000 + (Math.random() * 20000)),
          total_volumes: Array(30).fill(0).map((_,i) => 10000 + (Math.random() * 5000))
        };
        
        setChartData({
          labels: Array(30).fill('').map((_,i) => `${i+1}D`),
          datasets: [{
            label: '$ROT Price',
            data: mockData.prices,
            borderColor: '#8a2be2',
            backgroundColor: 'rgba(138, 43, 226, 0.1)',
            tension: 0.4,
            fill: true
          }]
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load chart data');
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="chart-loading">Loading chart...</div>;
  if (error) return <div className="chart-error">{error}</div>;

  return (
    <div className="price-chart-container">
      <Line 
        data={chartData} 
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }} 
      />
    </div>
  );
}
