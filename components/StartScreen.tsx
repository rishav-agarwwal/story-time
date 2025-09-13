
import React, { useState } from 'react';

interface StartScreenProps {
  onStart: (genre: string) => void;
}

const genres = ["High Fantasy", "Cyberpunk", "Cosmic Horror", "Space Opera", "Steampunk"];

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
    const [selectedGenre, setSelectedGenre] = useState<string>(genres[0]);

    const handleStart = () => {
        if(selectedGenre) {
            onStart(selectedGenre);
        }
    }

  return (
    <div className="text-center bg-gray-800/50 backdrop-blur-sm p-8 rounded-lg shadow-2xl shadow-cyan-500/10 border border-gray-700 animate-fadeIn">
      <h2 className="text-3xl font-bold mb-4 text-gray-100">Welcome, Adventurer</h2>
      <p className="text-lg mb-6 text-gray-300">
        Your journey is about to begin. The story will be crafted by Gemini, making every path unique.
        Choose a genre to set the tone for your adventure.
      </p>
      <div className="mb-8">
        <label htmlFor="genre-select" className="block text-sm font-medium text-gray-400 mb-2">
            SELECT YOUR GENRE
        </label>
        <select 
            id="genre-select" 
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-gray-900 border border-gray-600 text-white text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full max-w-xs mx-auto p-3"
        >
            {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
            ))}
        </select>
      </div>

      <button
        onClick={handleStart}
        className="px-8 py-4 bg-cyan-600 text-white font-bold text-xl rounded-lg hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-600/30"
      >
        Begin Your Quest
      </button>
    </div>
  );
};

// Add fade-in animation to tailwind config if possible, or use a style tag.
// For simplicity here, we assume a global css animation `fadeIn` exists.
// A simple implementation could be in index.html's head:
// <style> @keyframes fadeIn { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; } </style>
// Since we cannot modify index.html easily this way, we'll just add the class.
// Tailwind doesn't have a default fadeIn animation, but it can be configured.
// For this environment, we'll rely on a hypothetical pre-configuration.

export default StartScreen;
