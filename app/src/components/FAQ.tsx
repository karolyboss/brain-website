"use client";

import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is BrainRot ($ROT)?",
      answer: "BrainRot is a memecoin on the Solana blockchain designed to bring humor and community to the crypto space. It's for those who embrace the absurdity of internet culture."
    },
    {
      question: "How do I buy $ROT tokens?",
      answer: "You can buy $ROT tokens during our presale by connecting your Phantom wallet, completing social verification, and sending SOL to our presale contract. You'll receive bonus tokens based on the current phase."
    },
    {
      question: "What are the presale bonuses?",
      answer: "Phase 1: 50% bonus (1 SOL = 1,500,000 ROT), Phase 2: 30% bonus (1 SOL = 1,300,000 ROT), Phase 3: 15% bonus (1 SOL = 1,150,000 ROT)."
    },
    {
      question: "How does the referral program work?",
      answer: "Share your unique referral link with friends. When they successfully purchase tokens, you'll earn 1000 $ROT tokens for each referral. There's no limit to how many referrals you can make!"
    },
    {
      question: "Is BrainRot a good investment?",
      answer: "As with all cryptocurrencies, especially memecoins, there is inherent risk. BrainRot is primarily for entertainment and community participation. Please only invest what you can afford to lose."
    },
    {
      question: "When will the Brainrot Game be released?",
      answer: "The Brainrot Game is currently in development and will be released soon. Subscribe to our notifications on the website to be the first to know when it launches!"
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="card-float-static bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 mb-12 border border-gray-800">
      <h2 className="text-3xl font-bold mb-6 text-center gradient-text">Frequently Asked Questions</h2>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="card-float-static border border-gray-700 rounded-xl overflow-hidden">
            <button
              className="w-full flex justify-between items-center p-6 text-left bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              onClick={() => toggleFAQ(index)}
            >
              <span className="font-medium text-lg gradient-text">{faq.question}</span>
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {openIndex === index && (
              <div className="p-6 bg-gray-900/50">
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}