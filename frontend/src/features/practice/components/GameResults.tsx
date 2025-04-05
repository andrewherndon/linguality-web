import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  BarChart3,
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { GameResult } from './PracticeLayout';

interface GameResultsProps {
  results: GameResult;
  gameType: 'spelling' | 'matching' | 'multiplechoice';
  onPlayAgain: () => void;
  onReturnToOverview: () => void;
}

const GameResults: React.FC<GameResultsProps> = ({ 
  results, 
  gameType, 
  onPlayAgain, 
  onReturnToOverview 
}) => {
  const { score, correctAnswers, totalQuestions, timeSpent, details } = results;
  
  const scoreColor = () => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formattedTime = () => {
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getScoreMessage = () => {
    if (score >= 90) return "'Excellent! You've mastered these words!'";
    if (score >= 70) return 'Great job! Keep practicing to improve further.';
    if (score >= 50) return 'Good effort! Regular practice will help you improve.';
    return "'Keep practicing! You'll get better with time.'";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Score overview card */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className={`text-5xl font-bold ${scoreColor()}`}>{score}%</h1>
              </div>
              <svg className="w-32 h-32">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                  r="58"
                  cx="64"
                  cy="64"
                />
                <circle
                  className={`${scoreColor()} stroke-current`}
                  strokeWidth="6"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="58"
                  cx="64"
                  cy="64"
                  strokeDasharray={`${(score / 100) * 365} 365`}
                  transform="rotate(-90 64 64)"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold mb-2">Practice Complete!</h2>
            <p className="text-muted-foreground">{getScoreMessage()}</p>

            <div className="flex justify-center gap-6 mt-6">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">{correctAnswers}</span>
                </div>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-red-500">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">{totalQuestions - correctAnswers}</span>
                </div>
                <p className="text-xs text-muted-foreground">Incorrect</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-blue-500">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{formattedTime()}</span>
                </div>
                <p className="text-xs text-muted-foreground">Time</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Word-by-word results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            Question Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {details.map((detail, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg ${
                  detail.correct ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      {detail.correct ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">{detail.word}</span>
                    </div>
                    
                    {!detail.correct && (
                      <div className="mt-2 ml-7 text-sm">
                        <div className="text-red-500">
                          Your answer: {detail.userAnswer || "(empty)"}
                        </div>
                        <div className="text-green-500">
                          Correct: {detail.correctAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Badge variant={detail.correct ? "default" : "outline"}>
                    {detail.correct ? "Correct" : "Incorrect"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-4 justify-center">
        <Button 
          variant="outline" 
          onClick={onReturnToOverview}
          className="min-w-[120px]"
        >
          All Games
        </Button>
        <Button 
          onClick={onPlayAgain}
          className="min-w-[120px] gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Play Again
        </Button>
      </div>
    </div>
  );
};

export default GameResults;