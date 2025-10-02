"use client";

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function SocialVerification({ setSocialVerified }: { setSocialVerified: (verified: boolean) => void }) {
  const { connected } = useWallet();
  const [telegramJoined, setTelegramJoined] = useState(false);
  const [twitterFollowed, setTwitterFollowed] = useState(false);

  const handleTelegramClick = () => {
    window.open('https://t.me/rottedbrains', '_blank');
    // In a real implementation, you would have a verification mechanism here
    // For now, we'll set it to true when the button is clicked
    setTelegramJoined(true);
  };

  const handleTwitterClick = () => {
    window.open('https://x.com/kiralykaro61319?s=21', '_blank');
    // In a real implementation, you would have a verification mechanism here
    // For now, we'll set it to true when the button is clicked
    setTwitterFollowed(true);
  };

  const handleVerification = () => {
    if (telegramJoined && twitterFollowed && connected) {
      setSocialVerified(true);
    }
  };

  return (
    <div className="social-verification-card">
      <h2 className="text-3xl font-bold mb-6 text-center gradient-text">Social Verification</h2>
      <p className="text-gray-300 mb-8 text-center">
        To participate in the presale, please join our Telegram group and follow our X account.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
        <button
          onClick={handleTelegramClick}
          className="btn-3d flex-1 min-w-[200px] bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center"
        >
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path>
          </svg>
          Join Telegram
        </button>
        
        <button
          onClick={handleTwitterClick}
          className="btn-3d flex-1 min-w-[200px] bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-black text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center border border-gray-600"
        >
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
          </svg>
          Follow on X
        </button>
      </div>
      
      <div className="mb-8">
        <WalletMultiButton className="wallet-adapter-button" />
      </div>
      
      <button
        onClick={handleVerification}
        disabled={!telegramJoined || !twitterFollowed || !connected}
        className={`btn-3d w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
          telegramJoined && twitterFollowed && connected
            ? 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white' 
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {telegramJoined && twitterFollowed && connected ? 'Continue to Presale' : 'Complete all steps to continue'}
      </button>
      
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className={`flex items-center justify-center p-3 rounded-lg ${
          telegramJoined ? 'bg-green-900/50 text-green-400' : 'bg-gray-800/50 text-gray-400'
        }`}>
          <svg className={`w-5 h-5 mr-2 ${telegramJoined ? 'text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
            {telegramJoined ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            )}
          </svg>
          Telegram Joined
        </div>
        
        <div className={`flex items-center justify-center p-3 rounded-lg ${
          twitterFollowed ? 'bg-green-900/50 text-green-400' : 'bg-gray-800/50 text-gray-400'
        }`}>
          <svg className={`w-5 h-5 mr-2 ${twitterFollowed ? 'text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
            {twitterFollowed ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            )}
          </svg>
          X Followed
        </div>
        
        <div className={`flex items-center justify-center p-3 rounded-lg ${
          connected ? 'bg-green-900/50 text-green-400' : 'bg-gray-800/50 text-gray-400'
        }`}>
          <svg className={`w-5 h-5 mr-2 ${connected ? 'text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
            {connected ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            )}
          </svg>
          Wallet Connected
        </div>
      </div>
    </div>
  );
}