import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  AlarmClock, 
  BarChart3,
  TrendingUp,
  Trophy,
  Calendar,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { Statistics } from '../services/statisticsService';

interface StatisticsSectionProps {
  statistics: Statistics | null;
}

const StatisticsSection: React.FC<StatisticsSectionProps> = ({ statistics }) => {
  if (!statistics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading statistics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top stats cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
          title="Words Saved"
          value={statistics.totalWords}
          icon={<Brain className="h-5 w-5 text-purple-500" />}
          subtitle={`${statistics.newWordsThisWeek} new this week`}
        />
        
        <StatsCard 
          title="Reading Progress"
          value={`${statistics.booksRead} books`}
          icon={<BookOpen className="h-5 w-5 text-blue-500" />}
          subtitle={`${statistics.readingTimeMinutes} minutes of reading`}
        />
        
        <StatsCard 
          title="Learning Streak"
          value={`${statistics.streak} days`}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          subtitle={`Last activity: ${format(new Date(statistics.lastActivity), 'MMM d, yyyy')}`}
        />
      </div>

      {/* Word expertise breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vocabulary Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <LevelProgress 
              level="New" 
              count={statistics.wordsByLevel.new}
              total={statistics.totalWords}
              color="bg-red-500"
            />
            <LevelProgress 
              level="Learning" 
              count={statistics.wordsByLevel.learning}
              total={statistics.totalWords}
              color="bg-yellow-500"
            />
            <LevelProgress 
              level="Familiar" 
              count={statistics.wordsByLevel.familiar}
              total={statistics.totalWords}
              color="bg-blue-500"
            />
            <LevelProgress 
              level="Mastered" 
              count={statistics.wordsByLevel.mastered}
              total={statistics.totalWords}
              color="bg-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Learning insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                Practice Performance
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.gamePerformance.map((game, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="font-medium">{game.name}</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {game.timesPlayed} sessions
                    </span>
                    <Badge variant={game.avgScore > 70 ? "default" : "outline"}>
                      {game.avgScore}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <div className="flex items-center">
                <AlarmClock className="h-5 w-5 text-blue-500 mr-2" />
                Review Schedule
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="font-medium">Due today</div>
                <Badge variant="destructive">{statistics.reviewSchedule.today}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="font-medium">Due tomorrow</div>
                <Badge variant="outline">{statistics.reviewSchedule.tomorrow}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="font-medium">Next 7 days</div>
                <Badge variant="outline">{statistics.reviewSchedule.nextWeek}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="font-medium text-muted-foreground">Overdue</div>
                <Badge variant="destructive">{statistics.reviewSchedule.overdue}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statistics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start p-2 rounded-md hover:bg-muted/50">
                <div className="mr-4 mt-1">
                  {activity.type === 'word_saved' && <BookOpen className="h-4 w-4 text-blue-500" />}
                  {activity.type === 'practice' && <Brain className="h-4 w-4 text-purple-500" />}
                  {activity.type === 'reading' && <Clock className="h-4 w-4 text-green-500" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{format(new Date(activity.timestamp), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for the stats cards
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle: string;
}> = ({ title, value, icon, subtitle }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="bg-primary/10 p-2 rounded-full">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Helper component for level progress bars
const LevelProgress: React.FC<{
  level: string;
  count: number;
  total: number;
  color: string;
}> = ({ level, count, total, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <div className="font-medium">{level}</div>
      <div className="text-sm">
        {count} words ({Math.round((count / total) * 100)}%)
      </div>
    </div>
    <Progress 
      value={(count / total) * 100} 
      className="h-2"
      indicatorClassName={color}
    />
  </div>
);

export default StatisticsSection;