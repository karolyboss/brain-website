'use client';
import { CheckVerified } from 'lucide-react';

const TEAM_MEMBERS = [
  { name: "Karoly Boss", role: "Founder", verified: true },
  { name: "Alice Crypto", role: "Lead Dev", verified: true },
  { name: "Bob Blockchain", role: "Marketing", verified: false }
];

export default function TeamVerification() {
  return (
    <div className="team-verification">
      <h3>Core Team</h3>
      <div className="team-grid">
        {TEAM_MEMBERS.map((member) => (
          <div key={member.name} className="team-card">
            <div className="team-info">
              <h4>{member.name}</h4>
              <p>{member.role}</p>
            </div>
            {member.verified ? (
              <div className="verified-badge">
                <CheckVerified size={18} />
                <span>KYC Verified</span>
              </div>
            ) : (
              <div className="pending-badge">Pending</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
