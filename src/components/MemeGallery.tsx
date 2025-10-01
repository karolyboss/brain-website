"use client";

import { useState } from 'react';

export default function MemeGallery() {
  // In a real implementation, these would be actual meme images
  const memes = [
    { id: 1, title: "Brain Melt" },
    { id: 2, title: "Neural Network" },
    { id: 3, title: "Crypto Brain" },
    { id: 4, title: "Meme Magic" },
    { id: 5, title: "Digital Dementia" },
    { id: 6, title: "Tokenized Thoughts" }
  ];
  
  const [selectedMeme, setSelectedMeme] = useState<number | null>(null);

  return (
    <div className="card-float-static bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 mb-12 border border-gray-800">
      <h2 className="text-3xl font-bold mb-2 text-center gradient-text">BrainRot Memes</h2>
      <p className="text-gray-400 text-center mb-8">Enjoy our collection of brainrotted memes</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {memes.map((meme) => (
          <div 
            key={meme.id}
            className="card-float-static bg-gray-800/50 rounded-xl overflow-hidden hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group border border-gray-700"
            onClick={() => setSelectedMeme(meme.id)}
          >
            <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <div className="text-5xl">🤪</div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg group-hover:text-pink-400 transition-colors gradient-text">
                {meme.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
      
      {selectedMeme && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMeme(null)}
        >
          <div 
            className="card-float-static bg-gray-800 rounded-2xl max-w-2xl w-full overflow-hidden border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <div className="text-9xl">🤪</div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4 gradient-text">
                {memes.find(m => m.id === selectedMeme)?.title}
              </h3>
              <p className="text-gray-300 mb-6">
                Another brainrotted meme from the $ROT collection. Share with your friends and spread the memetic infection!
              </p>
              <div className="flex justify-end">
                <button 
                  className="btn-3d bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                  onClick={() => setSelectedMeme(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}