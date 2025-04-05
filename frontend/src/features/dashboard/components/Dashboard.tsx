import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WordList from './WordList';
import StatisticsSection from './StatisticsSection';
import { useUserWords } from '../hooks/useUserWords';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Book, BookOpen, BrainCircuit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { words, isLoading, error, statistics, filterOptions, setFilter } = useUserWords();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-300">
          <CardContent className="p-6">
            <p className="text-red-500">Error loading your vocabulary: {error.message}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Vocabulary Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/library')}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Library
          </Button>
          <Button 
            onClick={() => navigate('/practice')}
            className="flex items-center gap-2"
          >
            <BrainCircuit className="h-4 w-4" />
            Practice
          </Button>
        </div>
      </div>

      <Tabs defaultValue="words">
        <TabsList className="mb-6">
          <TabsTrigger value="words">My Words</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="words">
          <WordList 
            words={words} 
            filterOptions={filterOptions}
            onFilterChange={setFilter}
          />
        </TabsContent>
        
        <TabsContent value="stats">
          <StatisticsSection statistics={statistics} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;