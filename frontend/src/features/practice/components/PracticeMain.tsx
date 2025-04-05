// src/features-real/practice/components/PracticeMain.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchPracticeWords } from '../services/practiceService';
import { usePracticeStore } from '../store/practiceStore';
import PracticeLayout from './PracticeLayout';
import SpellingGame from './SpellingGame';
import GameOverview from './GameOverview';
import GameResults from './GameResults';
import { PracticeWord } from '../services/practiceService';

enum GameState {
  OVERVIEW,
  LOADING,
  PLAYING,
  RESULTS
}

export const PracticeMain: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>(GameState.OVERVIEW);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    config, 
    startGame, 
    isGameActive, 
    currentWords, 
    currentWordIndex,
    results,
    resetGame
  } = usePracticeStore();
  
  // Handle starting a new game
  const handleStartGame = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setGameState(GameState.LOADING);
      setError(null);
      
      // Fetch words for practice
      const words = await fetchPracticeWords(user.id, config);
      
      if (words.length === 0) {
        setError('No words available for practice. Add more words to your vocabulary first.');
        setGameState(GameState.OVERVIEW);
        return;
      }
      
      // If we don't have enough words, adjust the game configuration
      if (words.length < config.wordCount) {
        console.log(`Only ${words.length} words available for practice.`);
      }
      
      // Start the game with the fetched words
      startGame(words);
      setGameState(GameState.PLAYING);
    } catch (error) {
      console.error('Error starting practice:', error);
      setError('Failed to start practice. Please try again.');
      setGameState(GameState.OVERVIEW);
    }
  };
  
  // Handle game completion
  const handleGameComplete = () => {
    setGameState(GameState.RESULTS);
  };
  
  // Reset game and return to overview
  const handleReturnToOverview = () => {
    resetGame();
    setGameState(GameState.OVERVIEW);
  };
  
  // Clean up game state if component unmounts during active game
  useEffect(() => {
    return () => {
      if (isGameActive) {
        resetGame();
      }
    };
  }, [isGameActive, resetGame]);
  
  // Render appropriate content based on game state
  const renderContent = () => {
    switch (gameState) {
      case GameState.OVERVIEW:
        return (
          <GameOverview
            onStartGame={handleStartGame}
            onConfigChange={(newConfig) => usePracticeStore.getState().setConfig(newConfig)}
            config={config}
            error={error}
          />
        );
      
      case GameState.LOADING:
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-center">Loading practice words...</p>
              </div>
            </CardContent>
          </Card>
        );
      
      case GameState.PLAYING:
        if (currentWords.length === 0) {
          return <div>No words available for practice.</div>;
        }
        
        // Depending on the game type, render different game components
        switch (config.gameType) {
          case 'spelling':
            return (
              <SpellingGame
                word={currentWords[currentWordIndex]}
                onComplete={(result) => {
                  usePracticeStore.getState().saveResult(result);
                  
                  // Check if this was the last word
                  if (currentWordIndex >= currentWords.length - 1) {
                    handleGameComplete();
                  } else {
                    usePracticeStore.getState().nextWord();
                  }
                }}
              />
            );
          
          // Add other game types here as they are implemented
          default:
            return <div>Game type not implemented yet.</div>;
        }
      
      case GameState.RESULTS:
        return (
          <GameResults
            results={results}
            words={currentWords}
            onPlayAgain={() => {
              resetGame();
              handleStartGame();
            }}
            onReturnToOverview={handleReturnToOverview}
          />
        );
    }
  };
  
  return (
    <PracticeLayout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">
          {gameState === GameState.PLAYING 
            ? `${config.gameType.charAt(0).toUpperCase() + config.gameType.slice(1)} Practice` 
            : 'Vocabulary Practice'}
        </h1>
        
        {gameState === GameState.PLAYING && (
          <div className="mb-4 flex justify-between items-center">
            <div>
              Word {currentWordIndex + 1} of {currentWords.length}
            </div>
            <Button variant="outline" size="sm" onClick={handleReturnToOverview}>
              Exit Game
            </Button>
          </div>
        )}
        
        {renderContent()}
      </div>
    </PracticeLayout>
  );
};

export default PracticeMain;