"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';

export default function ReferralSystem() {
  const { publicKey } = useWallet();
  const [referralCount, setReferralCount] = useState(3);
  const [copied, setCopied] = useState(false);
  
  // Generate referral link based on wallet address
  const referralLink = publicKey 
    ? `https://brainrot.fun/?ref=${publicKey.toBase58().slice(0, 8)}`
    : 'Please connect your wallet to get a referral link';

  const copyToClipboard = () => {
    if (publicKey) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card-float-static bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-gray-800">
      <h3 className="text-xl font-bold mb-4 gradient-text">Referral Program</h3>
      <p className="text-gray-400 mb-4">
        Share your referral link and earn 1000 ROT tokens for each successful referral!
      </p>
      
      <div className="card-float-static bg-gray-800/50 rounded-xl p-4 mb-4 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-grow bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white text-sm"
          />
          <button
            onClick={copyToClipboard}
            disabled={!publicKey}
            className={`btn-3d py-2 px-4 rounded-lg font-medium whitespace-nowrap ${
              publicKey
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-400">Referrals completed</p>
          <p className="text-2xl font-bold">{referralCount}</p>
        </div>
        <div>
          <p className="text-gray-400">Earned tokens</p>
          <p className="text-2xl font-bold text-pink-400">{(referralCount * 1000).toLocaleString()} ROT</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4">
        <a 
          href={`https://twitter.com/intent/tweet?text=Check out BrainRot memecoin!&url=${encodeURIComponent(referralLink)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-3d bg-black text-white py-2 px-4 rounded-lg flex items-center hover:bg-gray-900 transition-colors border border-gray-700"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
          </svg>
          Share on X
        </a>
        <a 
          href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=Check out BrainRot memecoin!`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-3d bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center hover:bg-blue-600 transition-colors border border-blue-400"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path>
          </svg>
          Share on Telegram
        </a>
      </div>
    </div>
  );
}