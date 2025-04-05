import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Volume2, 
  Check, 
  X, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { GameResult } from './PracticeLayout';
import { usePracticeWords } from '../hooks/usePracticeWords';

interface SpellingGameProps {
  onComplete: (results: GameResult) => void;
  onCancel: () => void;
}

const SpellingGame: React.FC<SpellingGameProps> = ({ onComplete, onCancel }) => {
  const { words, isLoading, error } = usePracticeWords('spelling');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [inputLocked, setInputLocked] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [gameResults, setGameResults] = useState<GameResult>({
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    timeSpent: 0,
    details: []
  });
  const startTimeRef = useRef(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on component mount and when moving to the next word
  useEffect(() => {
    if (inputRef.current && !isLoading && words.length > 0) {
      inputRef.current.focus();
    }
  }, [currentWordIndex, isLoading, words.length]);

  // Set up the start time when words are loaded
  useEffect(() => {
    if (!isLoading && words.length > 0) {
      startTimeRef.current = Date.now();
    }
  }, [isLoading, words]);

  // Handle submission of an answer
  const handleSubmit = () => {
    if (inputLocked || isLoading || words.length === 0) return;

    const currentWord = words[currentWordIndex];
    const isAnswerCorrect = userInput.trim().toLowerCase() === currentWord.original.toLowerCase();
    
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    setInputLocked(true);

    // Update game results
    setGameResults(prev => ({
      ...prev,
      correctAnswers: isAnswerCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      details: [
        ...prev.details,
        {
          word: currentWord.translation,
          correct: isAnswerCorrect,
          userAnswer: userInput.trim(),
          correctAnswer: currentWord.original
        }
      ]
    }));

    // Move to the next word after a delay
    setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
        setUserInput('');
        setInputLocked(false);
        setShowResult(false);
        setShowHint(false);
      } else {
        // Game complete - calculate final stats
        const endTime = Date.now();
        const timeSpent = Math.round((endTime - startTimeRef.current) / 1000); // In seconds
        
        const finalResults: GameResult = {
          ...gameResults,
          totalQuestions: words.length,
          score: Math.round((gameResults.correctAnswers / words.length) * 100),
          timeSpent,
        };
        
        onComplete(finalResults);
      }
    }, 1500);
  };

  // Handle key press (Enter to submit)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userInput.trim() && !inputLocked) {
      handleSubmit();
    }
  };

  // Display hint (first few letters of the word)
  const getHint = () => {
    if (!words.length) return '';
    const word = words[currentWordIndex].original;
    const hintLength = Math.ceil(word.length / 3);
    return word.substring(0, hintLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading practice words...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error loading practice words: {error.message}</p>
        <Button onClick={onCancel}>Return to Games</Button>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No words available for practice. Add more words to your vocabulary first!
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const currentWord = words[currentWordIndex];
  const progress = ((currentWordIndex) / words.length) * 100;

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto">
      {/* Progress bar */}
      <div className="w-full mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span>{currentWordIndex + 1} of {words.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Word to translate */}
      <div className="mb-8 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Type the word for:
        </p>
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-3xl font-bold">{currentWord.translation}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => {/* Text-to-speech functionality would go here */}}
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </div>
        
        {showHint && (
          <p className="mt-2 text-muted-foreground">
            Hint: {getHint()}
          </p>
        )}
      </div>

      {/* Input field */}
      <div className="w-full mb-8">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={inputLocked}
            className={`w-full p-4 text-xl text-center border-2 rounded-lg ${
              showResult
                ? isCorrect
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-input focus:border-primary'
            } outline-none transition-colors`}
            placeholder="Type your answer here..."
          />
          
          {showResult && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isCorrect ? (
                <Check className="h-6 w-6 text-green-500" />
              ) : (
                <X className="h-6 w-6 text-red-500" />
              )}
            </div>
          )}
        </div>
        
        {showResult && !isCorrect && (
          <p className="mt-2 text-center text-red-500">
            Correct answer: <span className="font-bold">{currentWord.original}</span>
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        {!showHint && !showResult && (
          <Button 
            variant="outline" 
            onClick={() => setShowHint(true)}
            className="gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Show Hint
          </Button>
        )}
        
        <Button 
          onClick={handleSubmit} 
          disabled={!userInput.trim() || inputLocked}
          className="min-w-[120px]"
        >
          {showResult ? 'Next' : 'Check'}
        </Button>
      </div>
    </div>
  );
};

export default SpellingGame;