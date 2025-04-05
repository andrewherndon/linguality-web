import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  BarChart3,
  Volume2,
  Edit,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { Word } from '../types/word';

interface WordDetailsProps {
  word: Word;
  open: boolean;
  onClose: () => void;
}

const WordDetails: React.FC<WordDetailsProps> = ({ word, open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{word.original}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-2 mb-4">
          <Badge>{word.partOfSpeech || 'Unknown'}</Badge>
          <div className="flex items-center space-x-1 text-muted-foreground text-sm">
            <Clock className="h-4 w-4" />
            <span>Last seen: {word.lastSeen ? format(new Date(word.lastSeen), 'MMM d, yyyy') : 'Never'}</span>
          </div>
          <Button variant="ghost" size="icon">
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <Label className="text-muted-foreground text-sm">Translation</Label>
              <p className="text-xl font-medium mt-1">{word.translation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <Label className="text-muted-foreground text-sm">Expertise Level</Label>
              <div className="flex items-center space-x-2">
                <Progress value={word.expertiseLevel} className="flex-1" />
                <span className="font-medium">{Math.round(word.expertiseLevel)}%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Based on {word.timesEncountered} encounters and {word.practiceHistory?.length || 0} practice sessions
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="contexts">
          <TabsList className="mb-4">
            <TabsTrigger value="contexts">Contexts</TabsTrigger>
            <TabsTrigger value="related">Related Words</TabsTrigger>
            <TabsTrigger value="practice">Practice History</TabsTrigger>
          </TabsList>

          <TabsContent value="contexts">
            <div className="space-y-4">
              {word.contexts && word.contexts.length > 0 ? (
                word.contexts.map((context, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                        <BookOpen className="h-4 w-4" />
                        <span>{context.bookId}</span>
                        <Calendar className="h-4 w-4 ml-2" />
                        <span>{format(new Date(context.timestamp), 'MMM d, yyyy')}</span>
                      </div>
                      <p className="text-sm">
                        {context.text.split(' ').map((w, i) => (
                          <span
                            key={i}
                            className={w.toLowerCase().includes(word.original.toLowerCase()) 
                              ? "font-bold text-primary" 
                              : ""}
                          >
                            {w}{' '}
                          </span>
                        ))}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No contexts available for this word.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="related">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Different Forms</h3>
                </div>
                {word.forms && word.forms.length > 0 ? (
                  <div className="space-y-2">
                    {word.forms.map((form, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                        <span>{form || 'Unknown form'}</span>
                        <Badge variant="outline">
                          {index === 0 ? 'Base Form' : `Variant ${index}`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No alternative forms available.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practice">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Practice History</h3>
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>

                {word.practiceHistory && word.practiceHistory.length > 0 ? (
                  <div className="space-y-2">
                    {word.practiceHistory.map((session, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                        <div>
                          <div className="font-medium">{session.gameType}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(session.date), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={session.score > 70 ? "default" : "outline"}
                            className="text-xs"
                          >
                            {session.score}%
                          </Badge>
                          {session.score > 70 ? 
                            <Check className="h-4 w-4 text-green-500" /> : 
                            <X className="h-4 w-4 text-red-500" />
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No practice history available.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WordDetails;