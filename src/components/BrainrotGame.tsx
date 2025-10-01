"use client";

import { useState, useEffect } from 'react';

export default function BrainrotGame() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Set the countdown to a future date (e.g., 30 days from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    
    const calculateTimeLeft = () => {
      const difference = futureDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, you would send this to your backend
    console.log('Subscribed with email:', email);
    setSubscribed(true);
  };

  return (
    <div className="card-float-static bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 mb-12 border border-gray-800">
      <h2 className="text-3xl font-bold mb-2 text-center gradient-text">Brainrot Game</h2>
      <p className="text-gray-400 text-center mb-8">An epic gaming experience is coming soon!</p>
      
      <div className="max-w-3xl mx-auto">
        <div className="card-float-static bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-8 mb-8 text-center border border-purple-800">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-2xl font-bold mb-4 gradient-text">Coming Soon</h3>
          <p className="text-gray-300 mb-6">
            Get ready for the most brainrotted gaming experience on Solana. 
            Play to earn $ROT tokens and compete with other players in this revolutionary memecoin game.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="card-float-static bg-black/30 rounded-xl p-4 border border-gray-700">
                <div className="text-3xl font-bold gradient-text">{value.toString().padStart(2, '0')}</div>
                <div className="text-gray-400 uppercase text-sm">{unit}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card-float-static bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-center gradient-text">Get Early Access</h3>
          <p className="text-gray-400 text-center mb-6">
            Subscribe to be notified when the Brainrot Game launches and get exclusive early access!
          </p>
          
          {!subscribed ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-grow bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              <button
                type="submit"
                className="btn-3d bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 whitespace-nowrap"
              >
                Notify Me
              </button>
            </form>
          ) : (
            <div className="text-center py-4 text-green-400">
              🎉 Thanks for subscribing! We&#39;ll notify you when the game is ready.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}