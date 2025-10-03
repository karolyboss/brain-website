'use client';

const MILESTONES = [
  { 
    date: 'Q4 2025', 
    title: 'Presale Launch', 
    completed: true,
    items: ['Website Live', 'Smart Contract Audit']
  },
  { 
    date: 'Q1 2026', 
    title: 'Exchange Listings', 
    completed: false,
    items: ['CEX Listings', 'Liquidity Lock']
  },
  { 
    date: 'Q2 2026', 
    title: 'Ecosystem Expansion', 
    completed: false,
    items: ['DegenDodge V2', 'NFT Integration']
  }
];

export default function RoadmapTimeline() {
  return (
    <div className="roadmap-container">
      <h3>Project Roadmap</h3>
      <div className="timeline">
        {MILESTONES.map((milestone, index) => (
          <div key={index} className={`milestone ${milestone.completed ? 'completed' : ''}`}>
            <div className="milestone-header">
              <div className="milestone-date">{milestone.date}</div>
              <div className="milestone-title">{milestone.title}</div>
              <div className="milestone-status">
                {milestone.completed ? '✅ Completed' : '🚀 Coming Soon'}
              </div>
            </div>
            <ul className="milestone-items">
              {milestone.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
