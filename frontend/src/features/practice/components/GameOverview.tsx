import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Keyboard, 
  Puzzle, 
  MousePointer, 
  Clock,
  Award,
  LockKeyhole
} from 'lucide-react';

interface GameOverviewProps {
  onGameSelect: (gameType: 'spelling' | 'matching' | 'multiplechoice') => void;
}

const GameOverview: React.FC<GameOverviewProps> = ({ onGameSelect }) => {
  const games = [
    {
      id: 'spelling',
      title: 'Spelling Practice',
      description: 'Practice spelling words from your vocabulary',
      icon: <Keyboard className="h-6 w-6 text-blue-500" />,
      available: true,
      stats: {
        highScore: 85,
        averageScore: 72,
        timesPlayed: 8
      }
    },
    {
      id: 'matching',
      title: 'Word Matching',
      description: 'Match words with their translations',
      icon: <Puzzle className="h-6 w-6 text-green-500" />,
      available: false,
      comingSoon: true
    },
    {
      id: 'multiplechoice',
      title: 'Multiple Choice',
      description: 'Choose the correct translation for each word',
      icon: <MousePointer className="h-6 w-6 text-purple-500" />,
      available: false,
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-2xl font-bold mb-2">Practice Your Vocabulary</h2>
        <p className="text-muted-foreground">
          Regular practice helps you remember words and improve your language skills.
          Choose a game below to start practicing!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {games.map((game) => (
          <Card 
            key={game.id}
            className={`
              ${!game.available ? 'opacity-70' : 'hover:shadow-md transition-shadow'}
              ${game.available ? 'cursor-pointer' : 'cursor-not-allowed'}
            `}
            onClick={() => game.available && onGameSelect(game.id as any)}
          >
            <CardHeader className="pb-2 relative">
              <div className="flex justify-between items-start">
                <div className="bg-primary/10 p-3 rounded-lg">
                  {game.icon}
                </div>
                
                {game.comingSoon && (
                  <Badge variant="outline" className="ml-auto">
                    <LockKeyhole className="h-3 w-3 mr-1" />
                    Coming Soon
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl mt-4">{game.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{game.description}</p>
              
              {game.stats && (
                <div className="border-t pt-4 mt-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1 text-yellow-500" />
                      <span>Best: {game.stats.highScore}%</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                      <span>Avg: {game.stats.averageScore}%</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{game.stats.timesPlayed}x</span>
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                className="w-full mt-4"
                disabled={!game.available}
                onClick={() => game.available && onGameSelect(game.id as any)}
              >
                {game.available ? 'Start Practice' : 'Coming Soon'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Card className="max-w-lg w-full bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <LockKeyhole className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">More Games Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  We're working on more practice games to help you master your vocabulary.
                  Check back soon for new ways to improve your language skills!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameOverview;