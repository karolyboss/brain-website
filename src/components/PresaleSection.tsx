"use client";

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function PresaleSection() {
  const { publicKey, sendTransaction } = useWallet();
  const [solAmount, setSolAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');
  
  // Presale phases
  const presalePhases = [
    { phase: 1, target: 100, raised: 35, bonus: 50, rate: 1500000 }, // 50% bonus
    { phase: 2, target: 100, raised: 65, bonus: 30, rate: 1300000 }, // 30% bonus
    { phase: 3, target: 100, raised: 85, bonus: 15, rate: 1150000 }  // 15% bonus
  ];
  
  // Get current phase based on raised amount
  const getCurrentPhase = () => {
    const totalRaised = presalePhases.reduce((sum, phase) => sum + phase.raised, 0);
    if (totalRaised < 100) return presalePhases[0];
    if (totalRaised < 200) return presalePhases[1];
    return presalePhases[2];
  };
  
  const currentPhase = getCurrentPhase();
  const rotAmount = solAmount ? (parseFloat(solAmount) * currentPhase.rate).toLocaleString() : '0';
  
  const handlePurchase = async () => {
    if (!publicKey || !solAmount) return;
    
    setIsProcessing(true);
    setTransactionStatus('Processing transaction...');
    
    try {
      // In a real implementation, we would create and send the transaction here
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTransactionStatus(`Successfully purchased ${rotAmount} ROT tokens!`);
      setSolAmount('');
    } catch (error) {
      setTransactionStatus('Transaction failed. Please try again or use manual payment.');
      console.error('Transaction failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="card-float-static bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 mb-12 border border-gray-800">
      <h2 className="text-3xl font-bold mb-2 text-center gradient-text">Presale</h2>
      <p className="text-gray-400 text-center mb-8">Get your $ROT tokens with exclusive bonuses!</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Presale Progress */}
        <div>
          <h3 className="text-xl font-bold mb-4 gradient-text">Presale Progress</h3>
          
          {presalePhases.map((phase) => (
            <div key={phase.phase} className="card-float-static mb-6 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between mb-2">
                <span>Phase {phase.phase} - {phase.bonus}% Bonus</span>
                <span>{phase.raised} / {phase.target} SOL</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-4 rounded-full" 
                  style={{ width: `${Math.min(100, (phase.raised / phase.target) * 100)}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-400 mt-1">
                1 SOL = {(phase.rate / 1000000).toFixed(1)}M ROT
              </div>
            </div>
          ))}
          
          <div className="card-float-static bg-gray-800/50 rounded-xl p-4 mt-6 border border-gray-700">
            <h4 className="font-bold mb-2 gradient-text">Current Phase: {currentPhase.phase}</h4>
            <p className="text-pink-400">{currentPhase.bonus}% Bonus - Get {currentPhase.rate.toLocaleString()} ROT per SOL!</p>
          </div>
        </div>
        
        {/* Purchase Form */}
        <div>
          <h3 className="text-xl font-bold mb-4 gradient-text">Buy $ROT Tokens</h3>
          
          <div className="card-float-static bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700">
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">SOL Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={solAmount}
                  onChange={(e) => setSolAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  step="0.1"
                  min="0.1"
                />
                <div className="absolute right-3 top-3 text-gray-400">SOL</div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">You will receive</label>
              <div className="bg-gray-900 rounded-lg py-3 px-4">
                <div className="text-2xl font-bold gradient-text">
                  {rotAmount} <span className="text-pink-400">ROT</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handlePurchase}
              disabled={!solAmount || isProcessing || !publicKey}
              className={`btn-3d w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                solAmount && publicKey && !isProcessing
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Buy with Phantom'}
            </button>
            
            {transactionStatus && (
              <div className={`mt-4 p-3 rounded-lg text-center ${
                transactionStatus.includes('Successfully') 
                  ? 'bg-green-900/50 text-green-400' 
                  : transactionStatus.includes('failed') 
                    ? 'bg-red-900/50 text-red-400' 
                    : 'bg-blue-900/50 text-blue-400'
              }`}>
                {transactionStatus}
              </div>
            )}
          </div>
          
          {/* Manual Payment */}
          <div className="card-float-static bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="font-bold mb-3 gradient-text">Manual Payment</h4>
            <p className="text-gray-400 text-sm mb-4">
              If the one-click purchase fails, you can manually send SOL to this address:
            </p>
            <div className="bg-gray-900 rounded-lg p-3 mb-4 break-all text-sm font-mono">
              4vztUxqbpYwb48xRFSqqHZEGFcDW15WGEHth6SE4mU91
            </div>
            <p className="text-gray-400 text-sm">
              After sending, please contact support with your transaction ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}