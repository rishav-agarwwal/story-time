
import React, { useEffect, useRef } from 'react';
import type { StorySegment } from '../types';

interface GameScreenProps {
  storyHistory: StorySegment[];
  choices: string[];
  onChoice: (choice: string) => void;
  isGameOver: boolean;
  onRestart: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ storyHistory, choices, onChoice, isGameOver, onRestart }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [storyHistory]);

  return (
    <div className="w-full h-full flex flex-col bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl shadow-cyan-500/10 overflow-hidden">
      <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto">
        {storyHistory.map((segment, index) => (
          <div key={index}>
            {segment.choice && (
              <p className="text-cyan-400 italic font-semibold my-4 border-l-4 border-cyan-700 pl-4 py-2 bg-gray-900/30 rounded-r-md">
                &gt; {segment.choice}
              </p>
            )}
            {segment.scene && (
              <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap my-4"
                dangerouslySetInnerHTML={{ __html: segment.scene.replace(/\n/g, '<br />') }}
              />
            )}
          </div>
        ))}
         {isGameOver && (
          <div className="text-center my-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <h3 className="text-2xl font-bold text-red-300">GAME OVER</h3>
            <p className="text-red-200 mt-2">Your adventure has come to an end.</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-700 bg-gray-900/50">
        {!isGameOver ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => onChoice(choice)}
                className="w-full text-left p-4 bg-gray-700 rounded-lg hover:bg-cyan-800 transition-colors duration-200 text-gray-200 hover:text-white"
              >
                {choice}
              </button>
            ))}
          </div>
        ) : (
           <div className="text-center">
             <button
                onClick={onRestart}
                className="px-6 py-3 bg-cyan-600 text-white font-bold text-lg rounded-lg hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105"
              >
                Play Again
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;
