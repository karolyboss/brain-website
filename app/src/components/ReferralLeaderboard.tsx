"use client";

import { useState, useEffect } from 'react';
import './ReferralLeaderboard.css';

interface LeaderboardEntry {
  wallet: string;
  referrals: number;
  tokensEarned: number;
  rank: number;
}

export default function ReferralLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState({ referrals: 0, tokensEarned: 0, rank: 0 });
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      localStorage.setItem('referrer', refCode);
    }
    const userWallet = localStorage.getItem('userWallet') || 'CONNECT_WALLET';
    const baseUrl = window.location.origin;
    setReferralLink(`${baseUrl}?ref=${userWallet}`);
  }, []);

  useEffect(() => {
    const fetchLeaderboard = () => {
      const storedData = localStorage.getItem('referralData');
      let data = storedData ? JSON.parse(storedData) : [];
      
      // Add fake top referrers if no data exists
      const fakeReferrers = [
        { wallet: 'DzNvVANS3MrUdsv9ZoTcEFCvRoM5gkNodp6bTmUgd67U', referrals: 47, tokensEarned: 47000 },
        { wallet: '8xKzN9YmPqR3vWtL5hF2jD9cB4nE6sA1mT7pQ8uV3wX', referrals: 32, tokensEarned: 32000 },
        { wallet: 'Hg7Yt5Rf9Kp2Lm3Nq8Vx4Wz6Bc1Sd5Ae9Jh7Fg2Mn4', referrals: 28, tokensEarned: 28000 },
        { wallet: '5Qw9Er2Ty4Ui8Op3As7Df6Gh1Jk5Lz8Xc3Vb2Nm9Hj6', referrals: 19, tokensEarned: 19000 },
        { wallet: '3Bn7Vm4Cx2Zq9Ws5Ed8Rf1Tg6Yh3Uj7Ik2Ol9Pm4Aq8', referrals: 15, tokensEarned: 15000 }
      ];
      
      // Merge fake data with real data, avoiding duplicates
      const existingWallets = data.map((entry: LeaderboardEntry) => entry.wallet);
      const newFakes = fakeReferrers.filter(fake => !existingWallets.includes(fake.wallet));
      data = [...data, ...newFakes];
      
      const sorted = data.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.referrals - a.referrals);
      
      const withRanks = sorted.map((entry: LeaderboardEntry, index: number) => ({
        ...entry,
        rank: index + 1
      }));
      
      setLeaderboard(withRanks.slice(0, 10));
      
      const userWallet = localStorage.getItem('userWallet');
      if (userWallet) {
        const userEntry = withRanks.find((entry: LeaderboardEntry) => entry.wallet === userWallet);
        if (userEntry) {
          setUserStats({
            referrals: userEntry.referrals,
            tokensEarned: userEntry.tokensEarned,
            rank: userEntry.rank
          });
        }
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied! Share it to earn 1,000 $ROT per purchase! 🚀');
  };

  const formatWallet = (wallet: string) => {
    if (wallet.length < 12) return wallet;
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const getPrizeForRank = (rank: number) => {
    if (rank === 1) return '1,000,000 $ROT 🏆';
    if (rank === 2) return '500,000 $ROT 🥈';
    if (rank === 3) return '250,000 $ROT 🥉';
    return '-';
  };

  return (
    <div className="referral-leaderboard-container">
      <div className="referral-stats-card">
        <h3 className="referral-stats-title">🎯 Your Referral Stats</h3>
        <div className="referral-stats-grid">
          <div className="stat-box">
            <div className="stat-value">{userStats.referrals}</div>
            <div className="stat-label">Referrals</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{userStats.tokensEarned.toLocaleString()}</div>
            <div className="stat-label">$ROT Earned</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">#{userStats.rank || '-'}</div>
            <div className="stat-label">Your Rank</div>
          </div>
        </div>
        
        <div className="referral-link-section">
          <p className="referral-info">💰 Earn 1,000 $ROT for each friend who buys!</p>
          <div className="referral-link-box">
            <input 
              type="text" 
              value={referralLink} 
              readOnly 
              className="referral-link-input"
            />
            <button onClick={copyReferralLink} className="copy-button">
              📋 Copy Link
            </button>
          </div>
        </div>
      </div>

      <div className="leaderboard-section">
        <h2 className="leaderboard-title">🏆 Referral Leaderboard</h2>
        <p className="leaderboard-subtitle">
          Top referrers win MASSIVE bonuses! 🚀
        </p>

        <div className="prize-info">
          <div className="prize-item prize-gold">
            <span className="prize-rank">🥇 1st Place</span>
            <span className="prize-amount">1,000,000 $ROT</span>
          </div>
          <div className="prize-item prize-silver">
            <span className="prize-rank">🥈 2nd Place</span>
            <span className="prize-amount">500,000 $ROT</span>
          </div>
          <div className="prize-item prize-bronze">
            <span className="prize-rank">🥉 3rd Place</span>
            <span className="prize-amount">250,000 $ROT</span>
          </div>
        </div>

        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <div className="header-rank">Rank</div>
            <div className="header-wallet">Wallet</div>
            <div className="header-referrals">Referrals</div>
            <div className="header-earned">Earned</div>
            <div className="header-prize">Bonus Prize</div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="no-data">
              <p>🚀 Be the first to refer and claim the top spot!</p>
            </div>
          ) : (
            leaderboard.map((entry) => (
              <div 
                key={entry.wallet} 
                className={`leaderboard-row ${entry.rank <= 3 ? `rank-${entry.rank}` : ''}`}
              >
                <div className="row-rank">
                  {entry.rank === 1 && '🥇'}
                  {entry.rank === 2 && '🥈'}
                  {entry.rank === 3 && '🥉'}
                  {entry.rank > 3 && `#${entry.rank}`}
                </div>
                <div className="row-wallet">{formatWallet(entry.wallet)}</div>
                <div className="row-referrals">{entry.referrals}</div>
                <div className="row-earned">{entry.tokensEarned.toLocaleString()} $ROT</div>
                <div className="row-prize">{getPrizeForRank(entry.rank)}</div>
              </div>
            ))
          )}
        </div>

        <div className="live-indicator">
          <span className="pulse-dot"></span>
          <span>Live Updates</span>
        </div>
      </div>
    </div>
  );
}