import React, { useState, useCallback, useRef } from 'react';
import type { Chat } from '@google/genai';
import { GameState, type StorySegment } from './types';
import { GeminiService, isApiKeySet } from './services/geminiService';
import Header from './components/Header';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';

// A new component to guide the user when the API key is missing.
const ApiKeyScreen: React.FC = () => {
  return (
    <div className="text-center bg-yellow-900/50 backdrop-blur-sm p-8 rounded-lg shadow-2xl shadow-yellow-500/10 border border-yellow-700 animate-fadeIn">
      <h2 className="text-3xl font-bold mb-4 text-yellow-300">Configuration Needed</h2>
      <p className="text-lg mb-6 text-yellow-200">
        Welcome to Gemini Adventure! To begin, you need to set up your Google AI API key.
      </p>
      <div className="text-left bg-gray-900 p-4 rounded-md mb-8 font-mono text-gray-300 text-sm space-y-2">
          <p>1. Open the file: <code className="bg-gray-700 px-2 py-1 rounded">services/geminiService.ts</code></p>
          <p>2. Find the constant named <code className="bg-gray-700 px-2 py-1 rounded">API_KEY</code>.</p>
          <p>3. Paste your API key inside the empty quotes.</p>
          <p>4. Save the file and refresh this page.</p>
      </div>
      <a
        href="https://aistudio.google.com/app/apikey"
        target="_blank"
        rel="noopener noreferrer"
        className="px-8 py-4 bg-cyan-600 text-white font-bold text-xl rounded-lg hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-600/30"
      >
        Get Your API Key
      </a>
    </div>
  );
};


const App: React.FC = () => {
  // Check if the API key is set at startup.
  const [apiKeyMissing] = useState(!isApiKeySet());
  const [gameState, setGameState] = useState<GameState>(GameState.Start);
  const [storyHistory, setStoryHistory] = useState<StorySegment[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const chatSessionRef = useRef<Chat | null>(null);

  const handleStartGame = useCallback(async (genre: string) => {
    setGameState(GameState.Loading);
    setIsGeneratingImage(true);
    setError(null);
    setStoryHistory([]);
    setChoices([]);
    setBackgroundImage(null);

    try {
      const imageUrl = await GeminiService.generateBackgroundImage(genre);
      setBackgroundImage(imageUrl);
      
      setIsGeneratingImage(false);

      const chat = GeminiService.startChat(genre);
      chatSessionRef.current = chat;
      
      const initialResponse = await GeminiService.continueStory(chat, "Let's begin.");
      
      setStoryHistory([{ scene: initialResponse.scene }]);
      setChoices(initialResponse.choices);
      setGameState(GameState.Playing);
    } catch (err) {
      console.error("Failed to start game:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setGameState(GameState.Error);
    } finally {
      setIsGeneratingImage(false);
    }
  }, []);

  const handleMakeChoice = useCallback(async (choice: string) => {
    if (!chatSessionRef.current) {
      setError("Chat session not initialized.");
      setGameState(GameState.Error);
      return;
    }

    setGameState(GameState.Loading);
    setStoryHistory(prev => [...prev, { choice }]);

    try {
      const response = await GeminiService.continueStory(chatSessionRef.current, choice);

      setStoryHistory(prev => [...prev, { scene: response.scene }]);
      
      if (response.isGameOver) {
        setChoices([]);
        setGameState(GameState.GameOver);
      } else {
        setChoices(response.choices);
        setGameState(GameState.Playing);
      }
    } catch (err) {
      console.error("Failed to continue story:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setGameState(GameState.Error);
    }
  }, []);

  const handleRestart = () => {
    setGameState(GameState.Start);
    chatSessionRef.current = null;
    setBackgroundImage(null);
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.Start:
        return <StartScreen onStart={handleStartGame} />;
      case GameState.Loading:
        return <LoadingScreen isGeneratingImage={isGeneratingImage} />;
      case GameState.Playing:
      case GameState.GameOver:
        return (
          <GameScreen
            storyHistory={storyHistory}
            choices={choices}
            onChoice={handleMakeChoice}
            isGameOver={gameState === GameState.GameOver}
            onRestart={handleRestart}
          />
        );
      case GameState.Error:
        return <ErrorScreen message={error || "An unknown error occurred."} onRestart={handleRestart} />;
      default:
        return <StartScreen onStart={handleStartGame} />;
    }
  };
  
  // If the API key is missing, show a dedicated screen.
  if (apiKeyMissing) {
    return (
        <div className="relative min-h-screen bg-gray-900">
            <div className="relative z-10 min-h-screen font-mono flex flex-col items-center p-4 sm:p-6 md:p-8">
                <Header />
                <main className="w-full max-w-3xl mx-auto flex-grow flex flex-col justify-center">
                    <ApiKeyScreen />
                </main>
            </div>
        </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-900">
        <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed transition-opacity duration-[2000ms] ease-in-out"
            style={{ 
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                opacity: backgroundImage ? 1 : 0
            }}
        />
        
        {backgroundImage && <div className="absolute inset-0 bg-black/70 z-0" />}
        
        <div className="relative z-10 min-h-screen font-mono flex flex-col items-center p-4 sm:p-6 md:p-8">
            <Header />
            <main className="w-full max-w-3xl mx-auto flex-grow flex flex-col justify-center">
                {renderContent()}
            </main>
        </div>
    </div>
  );
};

export default App;
