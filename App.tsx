
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { GameState, type StorySegment } from './types';
import { GeminiService } from './services/geminiService';
import Header from './components/Header';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Start);
  const [storyHistory, setStoryHistory] = useState<StorySegment[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  const handleStartGame = useCallback(async (genre: string) => {
    setGameState(GameState.Loading);
    setError(null);
    setStoryHistory([]);
    setChoices([]);

    try {
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
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.Start:
        return <StartScreen onStart={handleStartGame} />;
      case GameState.Loading:
        return <LoadingScreen />;
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

  return (
    <div className="min-h-screen font-mono flex flex-col items-center p-4 sm:p-6 md:p-8">
      <Header />
      <main className="w-full max-w-3xl mx-auto flex-grow flex flex-col justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
