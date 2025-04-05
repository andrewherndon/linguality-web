import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameOverview from './GameOverview';
import SpellingGame from './SpellingGame';
import GameResults from './GameResults';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Define the possible game states
type GameState = 'overview' | 'playing' | 'results';
type GameType = 'spelling' | 'matching' | 'multiplechoice';

export interface GameResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  details: Array<{
    word: string;
    correct: boolean;
    userAnswer?: string;
    correctAnswer: string;
  }>;
}

const PracticeLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('overview');
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [gameResults, setGameResults] = useState<GameResult | null>(null);

  // Handle game selection
  const handleGameSelect = (gameType: GameType) => {
    setSelectedGame(gameType);
    setGameState('playing');
  };

  // Handle game completion
  const handleGameComplete = (results: GameResult) => {
    setGameResults(results);
    setGameState('results');
  };

  // Handle return to game overview
  const handleReturnToOverview = () => {
    setGameState('overview');
    setSelectedGame(null);
    setGameResults(null);
  };

  // Render the appropriate component based on the game state
  const renderContent = () => {
    switch (gameState) {
      case 'overview':
        return <GameOverview onGameSelect={handleGameSelect} />;
      case 'playing':
        return selectedGame === 'spelling' ? (
          <SpellingGame onComplete={handleGameComplete} onCancel={handleReturnToOverview} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              This game is coming soon! Please check back later.
            </p>
            <Button onClick={handleReturnToOverview} className="mt-4">
              Return to Games
            </Button>
          </div>
        );
      case 'results':
        return (
          <GameResults 
            results={gameResults!} 
            gameType={selectedGame!}
            onPlayAgain={() => setGameState('playing')}
            onReturnToOverview={handleReturnToOverview}
          />
        );
      default:
        return <GameOverview onGameSelect={handleGameSelect} />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => 
              gameState === 'overview' ? navigate('/') : handleReturnToOverview()
            }
          >
            {gameState === 'overview' ? (
              <Home className="h-5 w-5" />
            ) : (
              <ArrowLeft className="h-5 w-5" />
            )}
          </Button>
          <h1 className="text-2xl font-bold">
            {gameState === 'overview' && 'Practice Games'}
            {gameState === 'playing' && selectedGame === 'spelling' && 'Spelling Practice'}
            {gameState === 'results' && 'Game Results'}
          </h1>
        </div>

        {gameState !== 'overview' && (
          <Button 
            variant="outline" 
            onClick={handleReturnToOverview}
          >
            All Games
          </Button>
        )}
      </header>

      <main>{renderContent()}</main>
    </div>
  );
};

export default PracticeLayout;