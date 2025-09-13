
import React from 'react';

interface ErrorScreenProps {
  message: string;
  onRestart: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message, onRestart }) => {
  return (
    <div className="text-center bg-red-900/50 backdrop-blur-sm p-8 rounded-lg shadow-2xl shadow-red-500/10 border border-red-700">
      <h2 className="text-3xl font-bold mb-4 text-red-300">A Twist of Fate!</h2>
      <p className="text-lg mb-6 text-red-200">
        The connection to the ethereal plane was lost.
      </p>
      <div className="bg-gray-900 p-4 rounded-md mb-8">
        <p className="font-mono text-red-400">{message}</p>
      </div>
      <button
        onClick={onRestart}
        className="px-8 py-4 bg-cyan-600 text-white font-bold text-xl rounded-lg hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-600/30"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorScreen;
